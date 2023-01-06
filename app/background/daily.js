const cron = require("node-cron");
const db = require("../models");
const Appointment = db.appointment;
const PersonAppointment = db.personappointment;
const Person = db.person;
const Op = db.Sequelize.Op;
const Twilio = require("../utils/twilio.js");
const url = process.env.URL;

// Schedule tasks to be run on the server 12:01 am.
// From : https://www.digitalocean.com/community/tutorials/nodejs-cron-jobs-by-examples

exports.dailyTasks = () => {
  // for prod, runs at every day at 9AM.
  cron.schedule("00 09 * * *", async function () {
    // for testing, runs every minute
    // cron.schedule("* * * * *", async function () {
    console.log("Daily 9AM Tasks:");
    await notifyForFeedback();
  });
};

async function notifyForFeedback() {
  console.log("Finding appointments needing feedback");
  let date = new Date();
  let endTime = date.toLocaleTimeString("it-IT");
  date.setHours(date.getHours() - date.getTimezoneOffset() / 60);
  date.setHours(0, 0, 0);
  let tutors = [];
  let students = [];
  //get all of the appointments for today that start before now
  await Person.findAll({
    include: [
      {
        model: PersonAppointment,
        as: "personappointment",
        where: {
          isTutor: true,
          feedbackNumber: null,
        },
        include: [
          {
            model: Appointment,
            as: "appointment",
            where: {
              [Op.and]: [
                {
                  [Op.or]: [
                    { date: { [Op.lt]: date } },
                    {
                      [Op.and]: [
                        { date: { [Op.eq]: date } },
                        { endTime: { [Op.lt]: endTime } },
                      ],
                    },
                  ],
                },
                {
                  [Op.or]: [
                    { status: "booked" },
                    { [Op.and]: [{ type: "Group" }, { status: "available" }] },
                  ],
                },
              ],
            },
            required: true,
          },
        ],
      },
    ],
  })
    .then((response) => {
      tutors = response;
    })
    .catch((err) => {
      console.log("Failed to get tutor appointments: " + err);
    });

  await Person.findAll({
    include: [
      {
        model: PersonAppointment,
        as: "personappointment",
        where: {
          isTutor: false,
          feedbackNumber: null,
        },
        include: [
          {
            model: Appointment,
            as: "appointment",
            where: {
              status: "complete",
              [Op.or]: [
                { date: { [Op.lt]: date } },
                {
                  [Op.and]: [
                    { date: { [Op.eq]: date } },
                    { endTime: { [Op.lt]: endTime } },
                  ],
                },
              ],
            },
            required: true,
          },
        ],
      },
    ],
  })
    .then((response) => {
      students = response;
    })
    .catch((err) => {
      console.log("Failed to get student appointments: " + err);
    });

  console.log(tutors);
  console.log(students);

  for (let i = 0; i < tutors.length; i++) {
    let tutor = tutors[i];
    let message =
      "Please leave feedback for " +
      tutor.personappointment.length +
      " appointment(s) that you tutored.\n" +
      url;
    await Twilio.sendText(message, tutor.phoneNum)
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

  for (let i = 0; i < students.length; i++) {
    let student = students[i];
    let message =
      "Please leave feedback for " +
      student.personappointment.length +
      " appointment(s) that you attended.\n" +
      url;
    await Twilio.sendText(message, student.phoneNum)
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
}
