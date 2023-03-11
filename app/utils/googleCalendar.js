const Appointment = require("../utils/appointment.js");
const Person = require("../utils/person.js");
const Twilio = require("../utils/twilio.js");

const { google } = require("googleapis");

let eventId = "";

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

exports.getAppointmentFromGoogle = async (id) => {
  let error;
  let appointment = [];

  await Appointment.findOneAppointment(id)
    .then((data) => {
      appointment = data;
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

exports.updateEventForGoogle = async (id) => {
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

exports.updateGoogleAppointment = async (appointment, event) => {
  let updateAppointment = {
    id: appointment.id,
    date: appointment.originalDate,
    startTime: appointment.originalStart,
    endTime: appointment.originalEnd,
    type: appointment.type,
    status: appointment.status,
    preSessionInfo: appointment.preSessionInfo,
    googleEventId: appointment.googleEventId,
    groupId: appointment.groupId,
    locationId: appointment.locationId,
    topicId: appointment.topicId,
  };

  // confirmed
  //   private student - remake appointment time and notify
  //   group student - remove pa and notify tutors
  //   tutor cancel with no students - delete
  //   tutor cancel with one tutor - delete and notify
  //   tutor cancel with multiple tutors - change tutors and notify
  //   NOT DECLINED - update info and person appointments (group, etc)
  // cancelled - tutor deleted event on google
  //   tutor cancel with no students - delete
  //   tutor cancel with one tutor - delete and notify
  //   tutor cancel with multiple tutors - change tutors and notify

  if (appointment.type === "Private") {
    let student = await Person.findFirstStudentForAppointment(appointment.id);
    let tutor = await Person.findFirstTutorForAppointment(appointment.id);
    let fromUser = {};
    if (event.data.status === "confirmed") {
      for (let i = 0; i < event.data.attendees.length; i++) {
        let attendee = event.data.attendee[i];
        if (attendee.responseStatus === "declined") {
          if (attendee.email === event.creator.email) {
            // the tutor declined but didn't delete the event
            updateAppointment.status = "tutorCancel";
            fromUser = {
              fName: tutor.fName,
              lName: tutor.lName,
              userID: tutor.id,
              selectedRole: {
                type: "Tutor",
              },
            };
          } else {
            // TODO
            // if it's not the creator's email, then it's a student cancel
            // need to make a new appointment for the same time
            let temp = {
              date: appointment.date,
              startTime: appointment.startTime,
              endTime: appointment.endTime,
              type: appointment.type,
              status: "available",
              preSessionInfo: "",
              groupId: appointment.groupId,
            };
            await AppointmentServices.addAppointment(temp).then(
              async (response) => {
                // private will only have one tutor
                let pap = {
                  isTutor: true,
                  appointmentId: response.data.id,
                  personId: tutor.id,
                };
                await PersonAppointmentServices.addPersonAppointment(pap);
              }
            );
            updateAppointment.status = "studentCancel";
            fromUser = {
              fName: student.fName,
              lName: student.lName,
              userID: student.id,
              selectedRole: {
                type: "Student",
              },
            };
          }

          updateAppointment.googleEventId = null;
          await Appointment.updateAppointment(
            updateAppointment,
            updateAppointment.id
          );
          await this.deleteFromGoogle(updateAppointment.id);
        }
      }
    } else if (event.data.status === "cancelled") {
      // this means that the tutor deleted the event
      updateAppointment.googleEventId = null;
      updateAppointment.status = "tutorCancel";
      await Appointment.updateAppointment(
        updateAppointment,
        updateAppointment.id
      );
      await this.deleteFromGoogle(updateAppointment.id);
    }
  } else if (appointment.type === "Group") {
    if (event.data.status === "confirmed") {
      // check if any information was changed from google calendar
      // don't allow any information to be changed except attendees
      // if students are not in the appointment anymore, update person appointments
      // if private, set to student cancel
      console.log(event.data);
    } else if (event.data.status === "cancelled") {
      // check for another tutor
      console.log(event.data);
    } else if (event.data.status === "notfound") {
      // check if there are any other tutors for this appointment
      // if not, set to tutor cancel
    }
  }
  await Twilio.sendCanceledMessage(fromUser, appointment.id);
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

  let creds = {};
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
    .then((json) => (creds = json));

  oAuth2Client.setCredentials(creds);
  return oAuth2Client;
};
