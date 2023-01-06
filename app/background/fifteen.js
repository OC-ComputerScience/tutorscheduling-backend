const cron = require("node-cron");
const db = require("../models");
const Appointment = require("../utils/appointment.js");
const GoogleCalendar = require("../utils/googleCalendar");
const Group = require("../utils/group.js");
const PersonAppointment = require("../utils/personAppointment.js");
const Time = require("../utils/timeFunctions.js");
const Op = db.Sequelize.Op;

// Schedule tasks to be run on the server 12:01 am.
// From : https://www.digitalocean.com/community/tutorials/nodejs-cron-jobs-by-examples

exports.fifteenMinuteTasks = () => {
  // for prod, runs at 3 minutes before every 15 minutes every hour
  // cron.schedule("12,27,42,57 * * * *", async function () {
  // for testing, runs every minute
  cron.schedule("* * * * *", async function () {
    console.log(
      "15-Minute Tasks for " + new Date().toLocaleTimeString("it-IT") + ":"
    );
    await checkGoogleEvents();
    // await deletePastAppointments();
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
    let appointment = appointmentsWithGoogle[i];
    await GoogleCalendar.getAppointmentFromGoogle(appointment.id)
      .then((event) => {
        if (event.data !== undefined) {
          // console.log(event);
          // look at response of attendees too
          // we should be checking Private Booked
          if (event.data.status === "confirmed") {
            // check if any information was changed from google calendar
            // don't allow any information to be changed except attendees
            // if students are not in the appointment anymore, update person appointments
            // if private, set to student cancel
            console.log(event.data);
          } else if (event.data.status === "cancelled") {
            console.log(event.data);
          } else if (event.data.status === "notfound") {
            // check if there are any other tutors for this appointment
            // if not, set to tutor cancel
          }
        }
      })
      .catch((err) => {
        console.log("Error getting appointment from Google: " + err);
      });
  }
}

async function deletePastAppointments() {
  let delDate = new Date().setHours(0, 0, 0);
  let delTime = new Date().toLocaleTimeString("it-IT");
  let appointments = [];
  let groups = await Group.findAllGroups();

  // need to get appointments outside of the book past minutes buffer
  for (let i = 0; i < groups.length; i++) {
    let group = groups[i];
    let delTimePlusBuffer = subtractMinsFromTime(
      group.bookPastMinutes,
      delTime
    );
    console.log(delTimePlusBuffer);
    //get all of the appointments for today that start before now
    await Appointment.findAll({
      where: {
        [Op.or]: [
          { type: "Private" },
          {
            [Op.and]: [
              { type: "Group" },
              {
                id: {
                  [Op.in]: db.sequelize.literal(
                    "(SELECT COUNT(spa.id) FROM roles AS sr, personroles as spr, personappointments as spa, appointments a WHERE spr.roleId = sr.id AND spr.personId = spa.personId AND spa.id = a.id AND sr.type = 'Student') = 0"
                  ),
                },
              },
            ],
          },
        ],
        status: "available",
        date: { [Op.eq]: delDate },
        startTime: { [Op.lt]: delTimePlusBuffer },
        groupId: group.id,
      },
      include: [
        {
          model: Group,
          as: "group",
          required: true,
          where: { id: group.id },
        },
      ],
    })
      .then((data) => {
        appointments = data;
      })
      .catch((err) => {
        console.log("Could not find past Appointments: " + err);
      });
    console.log(
      delTime +
        ": Checking " +
        appointments.length +
        " appointments for deletion or revision"
    );
    if (appointments.length > 0) {
      // for each appointment check to see if they need to have start time update or be deleted
      for (let j = 0; j < appointments.length; j++) {
        let appointment = appointments[j];
        let startTime = addMinsToTime(
          appointment.group.timeInterval,
          appointment.startTime
        );
        // should not try to change time of group appointment, should just delete those
        if (appointment.type === "Private") {
          if (
            startTime < appointment.endTime &&
            appointment.endTime > delTime &&
            delTime - startTime > appointment.group.minApptTime &&
            appointment.group.allowSplittingAppointments
          ) {
            appointment.startTime = startTime;
            let newAppointment = appointment.dataValues;
            let appointmentId = newAppointment.id;
            await Appointment.update(newAppointment, {
              where: { id: appointmentId },
            }).catch((err) => {
              console.log("Could not update Appointment" + err);
            });
          } else {
            await Appointment.destroy({
              where: { id: appointment.id },
            }).catch((err) => {
              console.log("Could not delete Appointment" + err);
            });
          }
        } else if (appointment.type === "Group") {
          // need to delete from Google first and then delete the actual appointment
          await appointmentController
            .deleteFromGoogle(appointment.id)
            .catch((err) => {
              console.log("Could not delete Appointment from Google " + err);
            });
          await Appointment.destroy({
            where: { id: appointment.id },
          }).catch((err) => {
            console.log("Could not delete Appointment" + err);
          });
        }
      }
    }
  }
  await PersonAppointment.destroy({
    where: {
      appointmentId: null,
    },
  })
    .then((num) => {
      console.log(
        num +
          " past person appointments before " +
          formatDate(new Date(delDate)) +
          " at " +
          delTime +
          " were deleted successfully!"
      );
    })
    .catch((err) => {
      console.log("Could not delete past person appointments " + err);
    });
}

function addMinsToTime(mins, time) {
  // get the times hour and min value
  var [timeHrs, timeMins] = getHoursAndMinsFromTime(time);

  // time arithmetic (addition)
  if (timeMins + mins >= 60) {
    var addedHrs = parseInt((timeMins + mins) / 60);
    timeMins = (timeMins + mins) % 60;
    if (timeHrs + addedHrs > 23) {
      timeHrs = (timeHrs + addedHrs) % 24;
    } else {
      timeHrs += addedHrs;
    }
  } else {
    timeMins += mins;
  }

  // make sure the time slots are padded correctly
  return (
    String("00" + timeHrs).slice(-2) +
    ":" +
    String("00" + timeMins).slice(-2) +
    ":00"
  );
}

function subtractMinsFromTime(mins, time) {
  console.log(time);
  // get the times hour and min value
  var [timeHrs, timeMins] = getHoursAndMinsFromTime(time);

  //TODO test when hour should be -1 but it's -0

  // time arithmetic (subtraction)
  if (timeMins - mins <= 0) {
    var subtractedHrs = parseInt((timeMins - mins) / 60);
    console.log(subtractedHrs);
    timeMins = ((timeMins - mins) % 60) + 60;
    console.log(timeMins);

    if (timeHrs - subtractedHrs < 0) {
      timeHrs = ((timeHrs - subtractedHrs) % 24) + 24;
    } else {
      timeHrs -= subtractedHrs;
    }
  } else {
    timeMins -= mins;
  }

  // make sure the time slots are padded correctly
  return (
    String("00" + timeHrs).slice(-2) +
    ":" +
    String("00" + timeMins).slice(-2) +
    ":00"
  );
}

function getHoursAndMinsFromTime(time) {
  return time.split(":").map(function (str) {
    return parseInt(str);
  });
}

function formatDate(date) {
  let formattedDate =
    date.toISOString().substring(5, 10) +
    "-" +
    date.toISOString().substring(0, 4);
  return formattedDate;
}
