const Appointment = require("../utils/appointment.js");
const Person = require("../utils/person.js");

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
      console.log("Some error occured: " + error);
      // if we get back 403 or 429, try again
      if (error.status === 403 || error.status === 429) {
        // We make a request to Google Calendar API.
        console.log("Google status is: " + error.status);
        console.log("Attempting insert again.");
        await calendar.events
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
          .catch((error) => {
            return error;
          });
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

  await Appointment.findAll({ where: { id: id } })
    .then((data) => {
      eventId = data[0].dataValues.googleEventId;
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
