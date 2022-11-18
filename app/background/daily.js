const cron = require("node-cron");
const db = require("../models");
const Appointment = db.appointment;
const PersonAppointment = db.personappointment;
const Person = db.person;
const Op = db.Sequelize.Op;
//twilio stuff
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken =
  process.env.TWILIO_AUTH_TOKEN1 + process.env.TWILIO_AUTH_TOKEN2;
const phoneNum = process.env.TWILIO_NUMBER;
const client = require("twilio")(accountSid, authToken);
const url = process.env.url;

// Schedule tasks to be run on the server 12:01 am.
// From : https://www.digitalocean.com/community/tutorials/nodejs-cron-jobs-by-examples

exports.dailyTasks = () => {
  // for prod, runs at every day at 9am.
  cron.schedule("00 09 * * *", function () {
    // for testing, runs every minute
    //  cron.schedule('* * * * *', function() {
    console.log("Start running a task every day at 9:00 am");
    notifyForFeedback();
  });
};

async function notifyForFeedback() {
  console.log("check for feedback");
  let date = new Date();
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
              [Op.or]: [
                { status: "booked" },
                { [Op.and]: [{ type: "Group" }, { status: "available" }] },
              ],
              date: { [Op.lt]: date },
            },
            required: true,
          },
        ],
      },
    ],
  })
    .then((response) => {
      tutors = response;
      console.log(tutors[0].dataValues);
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
              date: { [Op.lt]: date },
            },
            required: true,
          },
        ],
      },
    ],
  })
    .then((response) => {
      students = response;
      console.log(students[0].dataValues);
    })
    .catch((err) => {
      console.log("Failed to get student appointments: " + err);
    });

  tutors.forEach((tutor) => {
    let message = {
      message:
        "Please leave feedback for " +
        tutor.personappointment.length +
        " appointment(s). " +
        url,
      phoneNum: tutor.phoneNum,
    };
    client.messages
      .create({
        body: message.message,
        from: phoneNum,
        to: message.phoneNum,
      })
      .then((message) => console.log("sent" + message.sid))
      .catch((err) => {
        console.log("Could not send messsage" + err);
      });
  });

  students.forEach((student) => {
    let message = {
      message:
        "Please leave feedback for " +
        student.personappointment.length +
        " appointment(s). " +
        url,
      phoneNum: student.phoneNum,
    };
    client.messages
      .create({
        body: message.message,
        from: phoneNum,
        to: message.phoneNum,
      })
      .then((message) => console.log("sent" + message.sid))
      .catch((err) => {
        console.log("Could not send messsage" + err);
      });
  });
}
