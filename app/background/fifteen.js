const cron = require("node-cron");
const Appointment = require("../utils/appointment.js");
const AppointmentActions = require("../utils/appointmentActions");
const Group = require("../utils/group.js");
const PersonAppointment = require("../utils/personAppointment.js");
const Time = require("../utils/timeFunctions.js");

// Schedule tasks to be run on the server 12:01 am.
// From: https://www.digitalocean.com/community/tutorials/nodejs-cron-jobs-by-examples

exports.fifteenMinuteTasks = () => {
  // for prod, runs at 3 minutes before every 15 minutes every hour
  cron.schedule("12,27,42,57 * * * *", async function () {
    // for testing, runs every minute
    // cron.schedule("* * * * *", async function () {
    console.log(
      "15-Minute Tasks for " + new Date().toLocaleTimeString("it-IT") + ":"
    );
    await deletePastAppointments();
  });
};

async function deletePastAppointments() {
  let appointments = [];
  let groups = await Group.findAllGroups();

  // need to get appointments outside of the book past minutes buffer
  for (let i = 0; i < groups.length; i++) {
    let group = groups[i].dataValues;
    await Appointment.findAllToDeleteForGroup(group)
      .then((data) => {
        appointments = data;
      })
      .catch((err) => {
        console.log(
          "Could not find past appointments to delete for group: " + err
        );
      });

    console.log(
      delTime +
        ": Checking " +
        appointments.length +
        " appointments for deletion or revision"
    );

    if (appointments.length > 0) {
      // for each appointment check to see if they need to have start time updated or be deleted
      for (let j = 0; j < appointments.length; j++) {
        let appointment = appointments[j];
        let startTime = Time.addMinsToTime(
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
            await Appointment.updateAppointment(
              newAppointment,
              newAppointment.id
            ).catch((err) => {
              console.log("Could not update appointment: " + err);
            });
          } else {
            await Appointment.deleteAppointment(appointment.id).catch((err) => {
              console.log("Could not delete appointment: " + err);
            });
          }
        } else if (appointment.type === "Group") {
          // need to delete from Google first and then delete the actual appointment
          await AppointmentActions.deleteFromGoogle(appointment.id).catch(
            (err) => {
              console.log("Could not delete appointment from Google " + err);
            }
          );

          await Appointment.deleteAppointment(appointment.id).catch((err) => {
            console.log("Could not delete appointment: " + err);
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
          Time.Date(new Date(delDate)) +
          " at " +
          delTime +
          " were deleted successfully!"
      );
    })
    .catch((err) => {
      console.log("Could not delete past person appointments " + err);
    });
}
