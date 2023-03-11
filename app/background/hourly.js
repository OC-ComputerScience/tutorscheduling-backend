const cron = require("node-cron");
const Appointment = require("../utils/appointment.js");
const GoogleCalendar = require("../utils/googleCalendar");
const PersonAppointment = require("../utils/personappointment.js");
const Time = require("../utils/timeFunctions.js");
const Twilio = require("../utils/twilio.js");

// Schedule tasks to be run on the server 12:01 am.
// From: https://www.digitalocean.com/community/tutorials/nodejs-cron-jobs-by-examples

exports.hourlyTasks = () => {
  // for prod, runs at ever hour at 55 minute past the hour.
  cron.schedule("55 * * * *", async function () {
    // for testing, runs every minute
    // cron.schedule('* * * * *', async function() {
    console.log("Every 55-Minute Tasks:");
    // await checkGoogleEvents();
    await notifyUpcomingAppointments();
  });
};

async function checkGoogleEvents() {
  console.log("Checking Google Events:");
  let appointmentsNeedingGoogle = [];
  await Appointment.findAllNeedingGoogleId()
    .then(async (data) => {
      appointmentsNeedingGoogle = data;
    })
    .catch((err) => {
      console.log("Could not find appointments needing Google ids: " + err);
    });

  // all of these appointments need to be added to Google calendar
  for (let i = 0; i < appointmentsNeedingGoogle.length; i++) {
    let appointment = appointmentsNeedingGoogle[i];
    await GoogleCalendar.addAppointmentToGoogle(appointment.id).catch((err) => {
      console.log(err);
    });
  }

  let appointmentsWithGoogle = [];
  await Appointment.findAllWithGoogleId()
    .then(async (data) => {
      appointmentsWithGoogle = data;
    })
    .catch((err) => {
      console.log("Could not find appointments with Google ids: " + err);
    });

  for (let i = 0; i < appointmentsWithGoogle.length; i++) {
    let appointment = appointmentsWithGoogle[i].dataValues;
    appointment.students = appointment.personappointment.filter(
      (pa) => pa.isTutor === false
    );
    appointment.tutors = appointment.personappointment.filter(
      (pa) => pa.isTutor === true
    );
    let event = await GoogleCalendar.getAppointmentFromGoogle(
      appointment.id
    ).catch((err) => {
      console.log("Error getting appointment from Google: " + err);
    });

    console.log("GOOGLE EVENT INFO");
    console.log(event.data);
    console.log(appointment);

    if (event.data !== undefined) {
      await GoogleCalendar.updateGoogleAppointment(appointment, event);
    }
  }
}

// this gets appointments around 2 hours from now
async function notifyUpcomingAppointments() {
  let personAppointments = [];
  //get all of the appointments for today that start after now
  await PersonAppointment.findUpcomingPrivatePersonAppointments()
    .then((pap) => {
      console.log(pap.length + " people found with booked appointments");
      if (pap.length > 0) {
        for (let i = 0; i < pap.length; i++) {
          personAppointments.push(pap[i]);
        }
      }
    })
    .catch((err) => {
      console.log("Error getting upcoming private appointments: " + err);
    });

  await PersonAppointment.findUpcomingGroupPersonAppointments()
    .then((morePap) => {
      console.log(morePap.length + " people found with group appointments");
      if (morePap.length > 0) {
        for (let i = 0; i < morePap.length; i++) {
          personAppointments.push(morePap[i]);
        }
      }
    })
    .catch((err) => {
      console.log("Error getting upcoming group appointments: " + err);
    });

  for (let i = 0; i < personAppointments.length; i++) {
    let pap = personAppointments[i];
    let appointment = {};

    await Appointment.findOneAppointmentInfo(pap.appointmentId)
      .then((data) => {
        appointment = data[0];
        appointment.students = appointment.personappointment.filter(
          (pa) => pa.isTutor === false
        );
        appointment.tutors = appointment.personappointment.filter(
          (pa) => pa.isTutor === true
        );
      })
      .catch((err) => {
        console.log("An error occurred: " + err);
      });

    let textInfo = {
      appointmentType: appointment.type,
      toPhoneNum: "",
      toPersonRoleId: "",
      date: Time.formatDate(appointment.date),
      startTime: Time.calcTime(appointment.startTime),
      topicName: appointment.topic.name,
      locationName: appointment.location.name,
      fromFirstName: fromUser.fName,
      fromLastName: fromUser.lName,
      roleType: "",
      people: "",
    };

    if (pap.isTutor) {
      if (appointment.students.length > 1) {
        textInfo.people += "\n    Students: ";
        for (let j = 0; j < appointment.students.length; j++) {
          textInfo.people += "\n              ";
          textInfo.people +=
            appointment.students[j].person.fName +
            " " +
            appointment.students[j].person.lName;
        }
      } else if (appointment.students.length === 1) {
        textInfo.people +=
          "\n    Student: " +
          appointment.students[0].person.fName +
          " " +
          appointment.students[0].person.lName;
      }
    } else {
      if (appointment.tutors.length > 1) {
        textInfo.people += "\n    Tutors: ";
        for (let j = 0; j < appointment.tutors.length; j++) {
          textInfo.people += "\n              ";
          textInfo.people +=
            appointment.tutors[j].person.fName +
            " " +
            appointment.tutors[j].person.lName;
        }
      } else if (appointment.tutors.length === 1) {
        textInfo.people +=
          "\n    Tutor: " +
          appointment.tutors[0].person.fName +
          " " +
          appointment.tutors[0].person.lName;
      }
    }

    await Twilio.sendUpcomingMessage(textInfo)
      .then((message) => {
        if (message.sid !== undefined) {
          console.log("Sent text " + message.sid);
        } else {
          console.log(message);
        }
      })
      .catch((err) => {
        console.log("Error sending upcoming appointment message: " + err);
      });
  }
}
