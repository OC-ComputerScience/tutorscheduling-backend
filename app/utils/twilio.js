const Appointment = require("./appointment.js");
const Person = require("./person.js");
const Time = require("./timeFunctions.js");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken =
  process.env.TWILIO_AUTH_TOKEN1 + process.env.TWILIO_AUTH_TOKEN2;
const phoneNum = process.env.TWILIO_NUMBER;
const client = require("twilio")(accountSid, authToken);
const MessagingResponse = require("twilio/lib/twiml/MessagingResponse");
let prefix = "OC Tutor Scheduling:\n";
// let postfix = "\nReply STOP to unsubscribe.";
let appointment = {};

exports.sendText = async (text) => {
  let finalMessage = prefix + text.message;
  // + postfix;

  let person = await Person.findOnePersonByPhoneNumber(text.phoneNum).catch(
    (err) => {
      console.log(
        "Error retrieving person by phone number " + text.phone + ": " + err
      );
    }
  );

  if (text.phone === null || person === undefined) {
    return "Could not find person by phone number";
  } else if (person.textOptIn) {
    return await client.messages
      .create({
        body: finalMessage,
        to: text.phoneNum,
        from: phoneNum,
      })
      .then((message) => {
        return message;
      })
      .catch(async (err) => {
        // if we get an error that the recipient is unsubscribed, we need to update their textOptIn to false
        if (err.message.includes("unsubscribed recipient")) {
          person.textOptIn = false;
          console.log(person);
          await Person.updatePerson(person.dataValues, person.id);
        } else {
          return err;
        }
      });
  } else {
    return "Person has opted out of texts.";
  }
};

exports.respondToStop = async (body, from) => {
  console.log("twilio request");
  console.log(body);
  if (body === "STOP") {
    let phoneNum = from.substring(2);
    console.log(phoneNum);
    //we need to update person to opt out of texts
    let person = await Person.findOnePersonByPhoneNumber(phoneNum).catch(
      (err) => {
        console.log(
          "Error retrieving person by phone number " + phoneNum + ": " + err
        );
      }
    );
    if (person === undefined) {
      return "Could not find person by phone number";
    } else {
      person.textOptIn = false;
      console.log(person);
      await Person.updatePerson(person.dataValues, person.id);

      const twiml = new MessagingResponse();

      twiml.message(
        "You have successfully unsubscribed from OC Tutor Scheduling text notifications."
      );

      return twiml.toString();
    }
  } else {
    return "No need to update person's text opt in.";
  }
};

getAppointmentInfoForText = async (appointId) => {
  await Appointment.findOneAppointmentInfo(appointId)
    .then(async (response) => {
      appointment = response.data[0];
      if (
        appointment.personappointment !== null &&
        appointment.personappointment !== undefined
      ) {
        appointment.students = appointment.personappointment.filter(
          (pa) => pa.isTutor === false
        );
        appointment.tutors = appointment.personappointment.filter(
          (pa) => pa.isTutor === true
        );
      }
    })
    .catch((error) => {
      console.log("There was an error:", error);
    });
};

exports.sendApplicationMessage = async (textInfo) => {
  let text = {
    phoneNum: textInfo.adminPhoneNum,
    message:
      "You have a new tutor application from " +
      textInfo.fromFirstName +
      " " +
      textInfo.fromLastName +
      " for the " +
      textInfo.groupName +
      ".\nPlease view this application: " +
      process.env.URL +
      "/adminApprove/" +
      textInfo.adminPersonRoleId +
      "?personRoleId=" +
      textInfo.applicationPersonRoleId,
  };
  return await this.sendText(text);
};

exports.sendRequestMessage = async (textInfo) => {
  let text = {
    phoneNum: textInfo.adminPhoneNum,
    message:
      "You have a new request from " +
      textInfo.fromFirstName +
      " " +
      textInfo.fromLastName +
      " for the " +
      textInfo.groupName +
      ".\nPlease view this request: " +
      process.env.URL +
      "/adminRequests/" +
      textInfo.adminPersonRoleId +
      "?requestId=" +
      textInfo.requestId,
  };
  return await this.sendText(text);
};

exports.sendPendingMessage = async (appointmentId) => {
  await this.getAppointmentInfoForText(appointmentId);
  let text = {
    phoneNum: appointment.tutors[0].person.phoneNum,
    message:
      "You have a new pending private appointment." +
      "\n    Date: " +
      Time.formatDate(appointment.date) +
      "\n    Time: " +
      Time.calcTime(appointment.startTime) +
      "\n    Location: " +
      appointment.location.name +
      "\n    Topic: " +
      appointment.topic.name +
      "\n    Student: " +
      appointment.students[0].person.fName +
      " " +
      appointment.students[0].person.lName +
      "\nPlease confirm or reject this pending appointment: " +
      process.env.URL +
      "/tutorHome/" +
      appointment.tutors[0].person.personrole[0].id +
      "?appointmentId=" +
      appointment.id,
  };
  return await this.sendText(text);
};

exports.sendCanceledMessage = async (fromUser, appointId) => {
  let appointment = await this.getAppointmentInfoForText(appointId);
  let text = {
    phoneNum: "",
    message: "",
  };
  let ending = "";
  if (fromUser.selectedRole.type === "Student") {
    if (appointment.type === "Private") {
      ending = "\nThis appointment is now open again for booking.";
    }
  } else if (fromUser.selectedRole.type === "Tutor") {
    ending = "\nWe apologize for the inconvenience.";
  }

  if (
    appointment.type === "Private" ||
    (appointment.type === "Group" && fromUser.selectedRole.type === "Tutor")
  ) {
    text.message =
      "Your " +
      appointment.type +
      " appointment for " +
      appointment.topic.name +
      " on " +
      Time.formatDate(appointment.date) +
      " at " +
      Time.calcTime(appointment.startTime) +
      " has been canceled by " +
      fromUser.fName +
      " " +
      fromUser.lName +
      "." +
      ending;
  } else if (
    appointment.type === "Group" &&
    fromUser.selectedRole.type === "Student"
  ) {
    text.message =
      "A student has left your group appointment." +
      "\n    Date: " +
      Time.formatDate(appointment.date) +
      "\n    Time: " +
      Time.calcTime(appointment.startTime) +
      "\n    Location: " +
      appointment.location.name +
      "\n    Topic: " +
      appointment.topic.name +
      "\n    Student: " +
      fromUser.fName +
      " " +
      fromUser.lName +
      ending;
  }

  // notify all tutors involved besides themselves
  for (let i = 0; i < appointment.tutors.length; i++) {
    if (appointment.tutors[i].personId !== fromUser.userID) {
      text.phoneNum = appointment.tutors[i].person.phoneNum;
      if (text.phoneNum !== "") {
        await this.sendText(text.message, text.phoneNum).catch((error) => {
          console.log("There was an error:", error.response);
        });
      }
    }
  }

  // only notify all students involved besides themselves if tutor canceled
  if (fromUser.selectedRole.type === "Tutor") {
    for (let i = 0; i < appointment.students.length; i++) {
      if (appointment.students[i].personId !== fromUser.userID) {
        text.phoneNum = appointment.students[i].person.phoneNum;
        if (text.phoneNum !== "") {
          await this.sendText(text.message, text.phoneNum).catch((error) => {
            console.log("There was an error:", error.response);
          });
        }
      }
    }
  }
};
