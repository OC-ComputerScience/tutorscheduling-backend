const cron = require("node-cron");
const db = require("../models");
const Appointment = db.appointment;
const PersonAppointment = db.personappointment;
const Person = db.person;
const Location = db.location;
const Twilio = require("../utils/twilio.js");
const Op = db.Sequelize.Op;

// Schedule tasks to be run on the server 12:01 am.
// From : https://www.digitalocean.com/community/tutorials/nodejs-cron-jobs-by-examples

exports.hourlyTasks = () => {
  // for prod, runs at ever hour at 55 minute past the hour.
  cron.schedule("55 * * * *", async function () {
    // for testing, runs every minute
    // cron.schedule('* * * * *', async function() {
    console.log("Every 55-Minute Tasks:");
    await notifyUpcomingAppointments();
  });
};

async function notifyUpcomingAppointments() {
  let date = new Date().setHours(0, 0, 0);
  let startDate = new Date();
  startDate.setHours(startDate.getHours() + 1);
  let startTime = startDate.toLocaleTimeString("it-IT");
  let endDate = new Date();
  endDate.setHours(endDate.getHours() + 2);
  let endTime = endDate.toLocaleTimeString("it-IT");
  let personAppointments = [];
  //get all of the appointments for today that start before now
  await PersonAppointment.findAll({
    include: [
      {
        model: Appointment,
        as: "appointment",
        where: {
          status: "booked",
          date: { [Op.eq]: date },
          startTime: {
            [Op.and]: [{ [Op.gt]: startTime }, { [Op.lt]: endTime }],
          },
        },
        required: true,
      },
    ],
  })
    .then((pap) => {
      console.log(pap.length + " people found with booked appointments");
      if (pap.length > 0) {
        pap.forEach((pa) => {
          personAppointments.push(pa);
        });
      }
      PersonAppointment.findAll({
        as: "personAppointment",
        where: {
          [Op.or]: [
            { isTutor: false },
            {
              appointmentId: {
                [Op.in]: db.sequelize.literal(
                  "(SELECT appointmentId FROM personappointments where appointmentId=personAppointment.appointmentId AND isTutor='0')"
                ),
              },
            },
          ],
        },
        include: [
          {
            model: Appointment,
            as: "appointment",
            where: {
              status: "available",
              type: "Group",
              date: { [Op.eq]: date },
              startTime: {
                [Op.and]: [{ [Op.gt]: startTime }, { [Op.lt]: endTime }],
              },
            },
            required: true,
          },
        ],
      })
        .then((morePap) => {
          console.log(morePap.length + " people found with group appointments");
          if (morePap.length > 0) {
            morePap.forEach((pa) => {
              personAppointments.push(pa);
            });
          }
          personAppointments.forEach((personAppoint) => {
            Person.findByPk(personAppoint.personId).then((person) => {
              Appointment.findByPk(personAppoint.appointmentId).then(
                (appoint) => {
                  Location.findByPk(appoint.locationId).then(
                    async (location) => {
                      let time = calcTime(appoint.startTime);
                      let message =
                        "You have an upcoming tutoring appointment:" +
                        "\n    Type: " +
                        appoint.type +
                        "\n    Time: " +
                        time +
                        "\n    Location: " +
                        location.name;
                      await Twilio.sendText(message, person.phoneNum)
                        .then((message) => {
                          if (message.sid !== undefined) {
                            console.log("Sent text " + message.sid);
                          } else {
                            console.log(message);
                          }
                        })
                        .catch((err) => {
                          console.log("Error sending text message: " + err);
                        });
                    }
                  );
                }
              );
            });
          });
        })
        .catch((err) => {
          console.log("Could not work" + err);
        });
    })
    .catch((err) => {
      console.log("Could not work 2" + err);
    })
    .catch((err) => {
      console.log("Could not work 3" + err);
    });
}
function calcTime(time) {
  if (time == null) {
    return null;
  }
  let temp = time.split(":");
  let milHours = parseInt(temp[0]);
  let minutes = temp[1];
  let hours = milHours % 12;
  if (hours == 0) {
    hours = 12;
  }
  let dayTime = ~~(milHours / 12) > 0 ? "PM" : "AM";
  return "" + hours + ":" + minutes + " " + dayTime;
}
