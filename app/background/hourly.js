const cron = require("node-cron");
const Appointment = require("../utils/appointment.js");
const AppointmentActions = require("../utils/appointmentActions");
const PersonAppointment = require("../utils/personappointment.js");
const Time = require("../utils/timeFunctions.js");
const Twilio = require("../utils/twilio.js");

// Schedule tasks to be run on the server 12:01 am.
// From: https://www.digitalocean.com/community/tutorials/nodejs-cron-jobs-by-examples

exports.hourlyTasks = () => {
  // for prod, runs at ever hour at 55 minute past the hour.
  cron.schedule("55 * * * *", async function () {
    // for testing, runs every minute
    // cron.schedule("* * * * *", async function () {
    console.log("Every 55-Minute Tasks:");
    await checkGoogleEvents();
    await notifyUpcomingAppointments();
  });
};

async function checkGoogleEvents() {
  console.log("Checking Google Events:");
  let appointmentsNeedingGoogle = [];
  await Appointment.findAllUpcomingNeedingGoogleId()
    .then(async (data) => {
      appointmentsNeedingGoogle = data;
    })
    .catch((err) => {
      console.log("Could not find appointments needing Google ids: " + err);
    });

  // all of these appointments need to be added to Google calendar
  for (let i = 0; i < appointmentsNeedingGoogle.length; i++) {
    let appointment = appointmentsNeedingGoogle[i];
    await AppointmentActions.addAppointmentToGoogle(appointment.id).catch(
      (err) => {
        console.log(err);
      }
    );
  }

  let appointmentsWithGoogle = [];
  await Appointment.findAllUpcomingWithGoogleId()
    .then(async (data) => {
      appointmentsWithGoogle = data;
    })
    .catch((err) => {
      console.log("Could not find appointments with Google ids: " + err);
    });

  for (let i = 0; i < appointmentsWithGoogle.length; i++) {
    let appointment = appointmentsWithGoogle[i].dataValues;
    appointment.students = appointment.personappointment.filter(
      (pa) => !pa.isTutor
    );
    appointment.tutors = appointment.personappointment.filter(
      (pa) => pa.isTutor
    );
    let event = await AppointmentActions.getAppointmentFromGoogle(
      appointment
    ).catch((err) => {
      console.log("Error getting appointment from Google: " + err);
    });

    if (event.data !== undefined) {
      await AppointmentActions.updateAppointmentFromGoogle(
        appointment,
        event
      ).catch((err) => {
        console.log("Could not update appointment from Google: " + err);
      });
    }
  }
}

// this gets appointments around 2 hours from now
async function notifyUpcomingAppointments() {
  let appointments = [];

  await Appointment.findAllUpcomingToNotify()
    .then((data) => {
      appointments = data;
    })
    .catch((err) => {
      console.log("Could not find upcoming appointments to notify: " + err);
    });

  for (let i = 0; i < appointments.length; i++) {
    let appointment = appointments[i].dataValues;
    appointment.students = appointment.personappointment.filter(
      (pa) => !pa.isTutor
    );
    appointment.tutors = appointment.personappointment.filter(
      (pa) => pa.isTutor
    );

    let textInfo = {
      appointmentId: appointment.id,
      appointmentType: appointment.type,
      toPhoneNum: "",
      toPersonRoleId: "",
      date: Time.formatDate(appointment.date),
      startTime: Time.formatTimeFromString(appointment.startTime),
      topicName: appointment.topic.name,
      locationName:
        appointment.location.type === "Online" && appointment.URL !== null
          ? appointment.URL
          : appointment.location.name,
      roleType: "",
      people: "",
    };

    let peopleStringForStudent =
      "\nTutors: " +
      appointment.tutors[0].person.fName +
      " " +
      appointment.tutors[0].person.lName;
    for (let j = 1; j < appointment.tutors.length; j++) {
      peopleStringForStudent +=
        ", " +
        appointment.tutors[j].person.fName +
        " " +
        appointment.tutors[j].person.lName;
    }

    let peopleStringForTutor = "";

    if (appointment.type === "Group") {
      peopleStringForTutor = peopleStringForStudent;
    }

    peopleStringForTutor +=
      "\nStudents: " +
      appointment.students[0].person.fName +
      " " +
      appointment.students[0].person.lName;
    for (let j = 1; j < appointment.students.length; j++) {
      peopleStringForTutor +=
        ", " +
        appointment.students[j].person.fName +
        " " +
        appointment.students[j].person.lName;
    }

    for (let j = 0; j < appointment.personappointment.length; j++) {
      let pap = appointment.personappointment[j];
      textInfo.people = pap.isTutor
        ? peopleStringForTutor
        : peopleStringForStudent;
      textInfo.toPhoneNum = pap.person.phoneNum;
      textInfo.toPersonRoleId = pap.person.personrole[0].id;

      await Twilio.sendUpcomingMessage(textInfo);
    }
  }
}
