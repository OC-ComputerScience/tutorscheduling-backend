const cron = require("node-cron");
const db = require("../models");
const Appointment = db.appointment;
const appointmentController = require("../controllers/appointment.controller.js");
const PersonAppointment = db.personappointment;
const Op = db.Sequelize.Op;
const Group = db.group;
let appointments = [];
let groups = [];

// Schedule tasks to be run on the server 12:01 am.
// From : https://www.digitalocean.com/community/tutorials/nodejs-cron-jobs-by-examples

exports.fifteenMinuteTasks = () => {
  // for prod, runs at 3 minutes before every 15 minutes every hour
  cron.schedule("12,27,42,57 * * * *", async function () {
    // for testing, runs every minute
    // cron.schedule("* * * * *", async function () {
    console.log("Scheduled task every 15 mins");
    await getGroups();
    // await checkGoogleEvents();
    await deletePastAppointments();
  });
};

async function checkGoogleEvents() {
  await Appointment.findAll({
    where: {
      googleEventId: {
        [Op.ne]: null,
      },
    },
  })
    .then(async (data) => {
      appointments = data;
    })
    .catch((err) => {
      console.log("Could not find past Appointments: " + err);
    });

  for (let i = 0; i < appointments.length; i++) {
    let appointment = appointments[i];
    await appointmentController.getFromGoogle(appointment.id);
  }
}

async function deletePastAppointments() {
  let delDate = new Date().setHours(0, 0, 0);
  let delTime = new Date().toLocaleTimeString("it-IT");

  // need to get appointments outside of the book past minutes buffer
  for (let i = 0; i < groups.length; i++) {
    let group = groups[i];
    console.log(group);
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
      console.log("Could not delete past PersonAppointments " + err);
    });
}

async function getGroups() {
  await Group.findAll({ order: [["name", "ASC"]] })
    .then((data) => {
      for (let i = 0; i < data.length; i++) {
        groups.push(data[i].dataValues);
      }
    })
    .catch((err) => {
      console.log("Could not get groups " + err);
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
