const Appointment = require("./appointment.js");
const PersonAppointment = require("./personappointment.js");
const Person = require("./person.js");
const Twilio = require("./twilio.js");
const Time = require("./timeFunctions.js");

const { google } = require("googleapis");

let eventId = "";

exports.getAppointmentInfo = async (appointmentId) => {
  let appointment = {};
  await Appointment.findOneAppointmentInfo(appointmentId).then((response) => {
    appointment = response[0].dataValues;
    appointment.students = appointment.personappointment.filter(
      (pa) => pa.isTutor === false
    );
    appointment.tutors = appointment.personappointment.filter(
      (pa) => pa.isTutor === true
    );
  });
  return appointment;
};

exports.updateAppointment = async (appointment) => {
  if (
    appointment.googleEventId === "" ||
    appointment.googleEventId === undefined ||
    appointment.googleEventId === null
  ) {
    if (
      (appointment.type === "Group" && appointment.status === "available") ||
      (appointment.type === "Private" && appointment.status === "booked")
    ) {
      await Appointment.updateAppointment(appointment, appointment.id);
      return await this.addAppointmentToGoogle(appointment.id);
    } else if (
      appointment.type === "Private" &&
      appointment.status === "pending"
    ) {
      return await Appointment.updateAppointment(appointment, appointment.id);
    }
  } else {
    await Appointment.updateAppointment(appointment, appointment.id);
    return await this.updateForGoogle(appointment.id);
  }
};

exports.cancelAppointment = async (id, fromUser) => {
  let appointment = await this.getAppointmentInfo(id);
  if (fromUser.type === "Student") {
    if (appointment.type === "Private") {
      if (appointment.status === "pending") {
        return await this.pendingStudentCancel(appointment);
      } else if (appointment.status === "booked") {
        return await this.bookedStudentCancel(appointment);
      }
    } else if (appointment.type === "Group") {
      return await this.groupStudentTutorCancel(appointment, fromUser);
    }
  } else if (fromUser.type === "Tutor") {
    if (appointment.tutors.length === 1 && appointment.students.length === 0) {
      return await this.emptyTutorCancel(appointment);
    } else if (
      appointment.tutors.length === 1 &&
      appointment.students.length > 0
    ) {
      return await this.oneTutorCancel(appointment);
    } else if (appointment.tutors.length > 1) {
      let tutorOwnsAppointment = await Person.findFirstTutorForAppointment(
        appointment.id
      );
      if (tutorOwnsAppointment.id === fromUser.userID) {
        return await this.swapTutorCancel(appointment, fromUser);
      } else {
        return await this.groupStudentTutorCancel(appointment, fromUser);
      }
    }
  }
};

exports.cancelFeedbackMessage = async (personAppointments, fromUser) => {
  for (let i = 0; i < personAppointments.length; i++) {
    let pa = personAppointments[i];
    let temp = {
      id: pa.id,
      isTutor: pa.isTutor,
      feedbacknumber: null,
      feedbacktext: `Canceled by ${fromUser.fName} ${fromUser.lName}`,
      appointmentId: pa.appointmentId,
      personId: pa.personId,
    };
    await PersonAppointment.updatePersonAppointment(temp, temp.id);
  }
};

exports.pendingStudentCancel = async (appointment) => {
  // 1. update appointment to student cancel
  // 2. delete personappointment
  // no need to update google event because it doesn't exist
  // no need to send text because it hasn't been booked yet
  let updatedAppointment = {
    id: appointment.id,
    date: appointment.date,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    type: appointment.type,
    status: "available",
    preSessionInfo: "",
    groupId: appointment.groupId,
    owner: false,
  };
  await Appointment.updateAppointment(
    updatedAppointment,
    updatedAppointment.id
  );
  await PersonAppointment.deletePersonAppointment(appointment.students[0].id);
};

exports.bookedStudentCancel = async (appointment) => {
  // 1. notify tutor
  // 2. update person appointments with cancel feedback
  // 3. delete appointment from google
  // 4. update appointment to student cancel and remove google event id
  // 5. create new private appointment and personappointment for tutor
  let updatedAppointment = {
    id: appointment.id,
    date: appointment.date,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    type: appointment.type,
    status: "studentCancel",
    preSessionInfo: appointment.preSessionInfo,
    groupId: appointment.groupId,
    topicId: appointment.topicId,
    locationId: appointment.locationId,
    googleEventId: null,
    owner: false,
  };
  let textInfo = {
    appointmentType: appointment.type,
    toPhoneNum: appointment.tutors[0].person.phoneNum,
    toPersonRoleId: appointment.tutors[0].person.personrole[0].id,
    date: Time.formatDate(appointment.date),
    startTime: Time.calcTime(appointment.startTime),
    topicName: appointment.topic.name,
    fromFirstName: appointment.students[0].person.fName,
    fromLastName: appointment.students[0].person.lName,
    fromRoleType: "Student",
  };
  await Twilio.sendCanceledMessage(textInfo);
  let fromUser = {
    fName: appointment.students[0].person.fName,
    lName: appointment.students[0].person.lName,
  };
  await this.cancelFeedbackMessage(appointment.personappointment, fromUser);
  await this.deleteFromGoogle(appointment.id);
  await Appointment.updateAppointment(
    updatedAppointment,
    updatedAppointment.id
  );
  updatedAppointment.id = undefined;
  updatedAppointment.status = "available";
  updatedAppointment.preSessionInfo = "";
  updatedAppointment.topicId = null;
  updatedAppointment.locationId = null;
  await Appointment.createAppointment(updatedAppointment).then(
    async (response) => {
      let pap = {
        isTutor: true,
        appointmentId: response.data.id,
        personId: appointment.tutors[0].personId,
      };
      await PersonAppointment.createPersonAppointment(pap);
    }
  );
};

exports.groupStudentTutorCancel = async (appointment, fromUser) => {
  // 1. notify all/other tutors
  // 2. delete personappointment
  // 3. update google event
  // no cancellation feedback since it's a group appointment
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
    fromRoleType: fromUser.type,
    owner: false,
  };
  // let other tutors know
  for (let i = 0; i < appointment.tutors.length; i++) {
    if (appointment.tutors[i].personId !== fromUser.userID) {
      textInfo.toPhoneNum = appointment.tutors[i].person.phoneNum;
      textInfo.toPersonRoleId = appointment.tutors[i].person.personrole[0].id;
      await Twilio.sendCanceledMessage(textInfo);
    }
  }
  await PersonAppointment.deletePersonAppointmentForPersonAndAppointment(
    fromUser.userID,
    appointment.id
  ).catch((err) => console.log("ERROR: " + err));
  await this.updateForGoogle(appointment.id);
};

exports.emptyTutorCancel = async (appointment) => {
  // 1. delete from google if it's a group appointment
  // 2. delete personappointment
  // 3. delete appointment

  if (appointment.type === "Group") {
    await this.deleteFromGoogle(appointment.id);
  }
  await PersonAppointment.deletePersonAppointment(
    appointment.personappointment[0].id
  );
  await Appointment.deleteAppointment(appointment.id);
};

exports.oneTutorCancel = async (appointment) => {
  // 1. notify all students
  // 2. update personappointments with cancel feedback
  // 3. delete appointment from google
  // 4. update appointment to tutor cancel and remove google event id
  let updatedAppointment = {
    id: appointment.id,
    date: appointment.date,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    type: appointment.type,
    status: "tutorCancel",
    preSessionInfo: appointment.preSessionInfo,
    groupId: appointment.groupId,
    topicId: appointment.topicId,
    locationId: appointment.locationId,
    googleEventId: null,
  };
  let textInfo = {
    appointmentType: appointment.type,
    toPhoneNum: "",
    toPersonRoleId: "",
    date: Time.formatDate(appointment.date),
    startTime: Time.calcTime(appointment.startTime),
    topicName: appointment.topic.name,
    fromFirstName: appointment.tutors[0].person.fName,
    fromLastName: appointment.tutors[0].person.lName,
    fromRoleType: "Tutor",
    owner: true,
  };
  // notify the students
  for (let i = 0; i < appointment.students.length; i++) {
    textInfo.toPhoneNum = appointment.students[i].person.phoneNum;
    textInfo.toPersonRoleId = appointment.students[i].person.personrole[0].id;
    await Twilio.sendCanceledMessage(textInfo);
  }
  let fromUser = {
    fName: appointment.tutors[0].person.fName,
    lName: appointment.tutors[0].person.lName,
  };
  await this.cancelFeedbackMessage(appointment.personappointment, fromUser);
  await this.deleteFromGoogle(appointment.id);
  await Appointment.updateAppointment(
    updatedAppointment,
    updatedAppointment.id
  );
};

exports.swapTutorCancel = async (appointment, fromUser) => {
  // 1. delete appointment from google since the organizer of the event is leaving
  // 2. notify all tutors
  // 3. delete owner's personappointment
  // 4. add appointment to google calendar again since the organizer is changing
  // no cancellation feedback since it's a group appointment
  let textInfo = {
    appointmentType: appointment.type,
    toPhoneNum: "",
    toPersonRoleId: "",
    date: Time.formatDate(appointment.date),
    startTime: Time.calcTime(appointment.startTime),
    topicName: appointment.topic.name,
    fromFirstName: fromUser.fName,
    fromLastName: fromUser.lName,
    fromRoleType: "Tutor",
    owner: false,
  };
  await this.deleteFromGoogle(appointment.id);
  // let other tutors know
  for (let i = 0; i < appointment.tutors.length; i++) {
    if (appointment.tutors[i].personId !== fromUser.userID) {
      textInfo.toPhoneNum = appointment.tutors[i].person.phoneNum;
      textInfo.toPersonRoleId = appointment.tutors[i].person.personrole[0].id;
      await Twilio.sendCanceledMessage(textInfo);
    }
  }
  await PersonAppointment.deletePersonAppointmentForPersonAndAppointment(
    fromUser.userID,
    appointment.id
  );
  await this.addAppointmentToGoogle(appointment.id);
};

exports.addAppointmentToGoogle = async (id) => {
  let auth = await getAccessToken(id);

  let event = {};
  event = await setUpEvent(id);

  const calendar = google.calendar({
    version: "v3",
    auth: auth,
  });

  // We make a request to Google Calendar API.
  return await calendar.events
    .insert({
      auth: auth,
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: "all",
    })
    .then(async (event) => {
      await this.updateGoogleEventIdForAppointment(id, event.data.id);
      return event;
    })
    .catch(async (error) => {
      console.log("Some error occurred: " + error);
      // if we get back 403 or 429, try again
      if (error.status === 403 || error.status === 429) {
        await this.addAppointmentToGoogle(id);
      }
    });
};

exports.getAppointmentFromGoogle = async (appointment) => {
  let auth = await getAccessToken(appointment.id);

  const calendar = google.calendar({
    version: "v3",
    auth: auth,
  });

  return await calendar.events
    .get({
      auth: auth,
      calendarId: "primary",
      eventId: appointment.googleEventId,
    })
    .then((event) => {
      console.log("Event retrieved from Google calendar");
      return event;
    })
    .catch(async (err) => {
      if (err.message.includes("Not Found")) {
        appointment.data.status = "notfound";
        return appointment;
      } else {
        console.log("Google returned an error: " + err);
        return err;
      }
    });
};

exports.patchForGoogle = async (appointment) => {
  let auth = await getAccessToken(appointment.id);

  // make sure generic information is the same
  let summary = "";
  if (appointment.type === "Private") {
    summary =
      appointment.students[0].fName +
      appointment.students[0].lName +
      " - " +
      appointment.topic.name +
      " Tutoring";
  } else {
    summary = "Group - " + appointment.topic.name + " Tutoring";
  }

  let event = {
    summary: summary,
    location: appointment.location.name,
    description: appointment.preSessionInfo,
  };

  if (appointment.type.toLowerCase() === "online") {
    event.conferenceData = {
      createRequest: {
        conferenceSolutionKey: {
          type: "hangoutsMeet",
        },
        requestId: appointment.group.name + appointment.date,
      },
    };
  }

  const calendar = google.calendar({
    version: "v3",
    auth: auth,
  });

  // We make a request to Google Calendar API.
  return await calendar.events
    .patch({
      auth: auth,
      calendarId: "primary",
      eventId: appointment.googleEventId,
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: "all",
    })
    .then(async (event) => {
      return event;
    })
    .catch((error) => {
      return error;
    });
};

exports.updateForGoogle = async (id) => {
  let auth = await getAccessToken(id);

  let event = {};
  event = await setUpEvent(id);

  const calendar = google.calendar({
    version: "v3",
    auth: auth,
  });

  // We make a request to Google Calendar API.
  return await calendar.events
    .update({
      auth: auth,
      calendarId: "primary",
      eventId: eventId,
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: "all",
    })
    .then(async (event) => {
      return event;
    })
    .catch((error) => {
      return error;
    });
};

exports.updateGoogleEventIdForAppointment = async (id, eventId) => {
  let appointment = {};
  let error;

  await Appointment.findOneAppointment(id)
    .then((data) => {
      appointment = data.dataValues;
    })
    .catch((err) => {
      error = err;
    });

  if (error !== undefined) {
    throw error;
  }

  appointment.googleEventId = eventId;

  return await Appointment.updateAppointment(appointment, appointment.id)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.deleteFromGoogle = async (id) => {
  let error;

  await Appointment.findOneAppointment(id)
    .then((data) => {
      eventId = data.dataValues.googleEventId;
    })
    .catch((err) => {
      error = err;
    });

  if (error !== undefined) {
    return error;
  }

  let auth = await getAccessToken(id);

  const calendar = google.calendar({
    version: "v3",
    auth: auth,
  });

  return await calendar.events
    .delete({
      auth: auth,
      calendarId: "primary",
      eventId: eventId,
    })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.updateAppointmentFromGoogle = async (appointment, event) => {
  let stopChecking = false;
  // student or tutor could have canceled on Google
  for (let i = 0; i < event.data.attendees.length && !stopChecking; i++) {
    let attendee = event.data.attendees[i];
    if (
      attendee.organizer &&
      (attendee.responseStatus === "declined" ||
        event.data.status === "cancelled")
    ) {
      // tutor cancel
      if (
        appointment.tutors.length === 1 &&
        appointment.students.length === 0
      ) {
        // tutor cancel with no students
        await this.emptyTutorCancel(appointment);
        stopChecking = true;
      } else if (
        appointment.tutors.length === 1 &&
        appointment.students.length > 0
      ) {
        // tutor cancel with one tutor
        await this.oneTutorCancel(appointment);
        stopChecking = true;
      } else if (appointment.tutors.length > 1) {
        // tutor cancel with multiple tutors
        let ownerTutor = appointment.tutors.find(
          (tutor) => tutor.person.email === attendee.email
        );
        let fromUser = {
          fName: ownerTutor.person.fName,
          lName: ownerTutor.person.lName,
          userID: ownerTutor.personId,
          type: "Tutor",
        };
        await this.swapTutorCancel(appointment, fromUser);
      }
    } else if (attendee.responseStatus === "declined") {
      if (appointment.type === "Private") {
        await this.bookedStudentCancel(appointment);
        stopChecking = true;
      } else if (appointment.type === "Group") {
        let otherPerson = appointment.personappointment.find(
          (pa) => pa.person.email === attendee.email
        );
        let fromUser = {
          fName: otherPerson.person.fName,
          lName: otherPerson.person.lName,
          userID: otherPerson.personId,
          type: "",
        };

        if (otherPerson.isTutor) {
          // other tutor removed themselves from the group appointment
          fromUser.type = "Tutor";
        } else {
          fromUser.type = "Student";
        }

        await this.groupStudentTutorCancel(appointment, fromUser);
      }
    }
  }

  if (!stopChecking) {
    await this.patchForGoogle(appointment);
  }
};

setUpEvent = async (id) => {
  let appointments = []; // there will be multiple for each attendee
  appointments = await Appointment.findRawAppointmentInfo(id);

  let startTime = "";
  let endTime = "";
  let group = "";
  let location = "";
  let topic = "";
  let attendees = [];
  let online = false;
  let studentName = "";
  let summary = "";

  for (let i = 0; i < appointments.length; i++) {
    let obj = appointments[i];
    if (obj.type === "Private" && !obj.personappointment.isTutor) {
      studentName =
        obj.personappointment.person.fName +
        " " +
        obj.personappointment.person.lName;
    }
    let tempObj = {};
    tempObj.email = obj.personappointment.person.email;
    if (obj.personappointment.isTutor) tempObj.responseStatus = "accepted";
    attendees.push(tempObj);
  }

  let appointment = appointments[0];
  eventId = appointment.googleEventId;

  startTime = new Date(appointment.date).toISOString();
  let temp = startTime.slice(11, 19);
  startTime = startTime.replace(temp, appointment.startTime.toString());
  startTime = startTime.slice(0, 23);
  endTime = new Date(appointment.date).toISOString();
  temp = endTime.slice(11, 19);
  endTime = endTime.replace(temp, appointment.endTime.toString());
  endTime = endTime.slice(0, 23);
  group = appointment.group.name;
  location = appointment.location.name;
  topic = appointment.topic.name;
  if (
    appointment.location.type === "Online" ||
    appointment.location.type === "online"
  ) {
    online = true;
  }

  // set up name
  if (appointment.type === "Private") {
    summary = studentName + " - " + topic + " Tutoring";
  } else {
    summary = "Group - " + topic + " Tutoring";
  }

  const event = {
    summary: summary,
    location: location,
    description: appointment.preSessionInfo,
    start: {
      dateTime: startTime,
      timeZone: "US/Central",
    },
    end: {
      dateTime: endTime,
      timeZone: "US/Central",
    },
    attendees: attendees,
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "email", minutes: 120 },
      ],
    },
    status: "confirmed",
    transparency: "opaque",
  };

  if (online) {
    event.conferenceData = {
      createRequest: {
        conferenceSolutionKey: {
          type: "hangoutsMeet",
        },
        requestId: group + appointment.date,
      },
    };
  }

  return event;
};

getAccessToken = async (id) => {
  const client_id = process.env.GOOGLE_AUDIENCE;
  const client_secret = process.env.CLIENT_SECRET;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    "postmessage"
  );

  let person = await Person.findFirstTutorForAppointment(id);

  let credentials = {};
  // gets access token from refresh token
  // reference: https://zapier.com/engineering/how-to-use-the-google-calendar-api/
  var fetch = require("node-fetch"); // or fetch() is native in browsers

  var makeQuerystring = (params) =>
    Object.keys(params)
      .map((key) => {
        return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
      })
      .join("&");

  await fetch("https://www.googleapis.com/oauth2/v4/token", {
    method: "post",
    body: makeQuerystring({
      client_id: client_id,
      client_secret: client_secret,
      refresh_token: person[0].dataValues.refresh_token,
      grant_type: "refresh_token",
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then((res) => res.json())
    .then((json) => (credentials = json));

  oAuth2Client.setCredentials(credentials);
  return oAuth2Client;
};
