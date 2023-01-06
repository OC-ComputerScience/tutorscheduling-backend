const cron = require("node-cron");
const db = require("../models");
const Appointment = db.appointment;
const PersonAppointment = db.personappointment;
const Person = db.person;
const Topic = db.topic;
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

// this gets appointments around 2 hours from now
async function notifyUpcomingAppointments() {
  let date = new Date().setHours(0, 0, 0);
  let startDate = new Date();
  startDate.setHours(startDate.getHours() + 1);
  let startTime = startDate.toLocaleTimeString("it-IT");
  let endDate = new Date();
  endDate.setHours(endDate.getHours() + 2);
  let endTime = endDate.toLocaleTimeString("it-IT");
  let personAppointments = [];
  //get all of the appointments for today that start after now
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
        for (let i = 0; i < pap.length; i++) {
          personAppointments.push(pap[i]);
        }
      }
    })
    .catch((err) => {
      console.log("Could not work 1: " + err);
    });
  await PersonAppointment.findAll({
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
        for (let i = 0; i < morePap.length; i++) {
          personAppointments.push(morePap[i]);
        }
      }
    })
    .catch((err) => {
      console.log("Could not work 2: " + err);
    });

  for (let i = 0; i < personAppointments.length; i++) {
    let pap = personAppointments[i];
    let person = {};
    let appointment = {};
    await Person.findByPk(pap.personId)
      .then((data) => {
        person = data;
      })
      .catch((err) => {
        console.log("Could not work person: " + err);
      });

    await Appointment.findAll({
      where: { id: pap.appointmentId },
      include: [
        {
          model: Location,
          as: "location",
          required: true,
        },
        {
          model: Topic,
          as: "topic",
          required: true,
        },
        {
          model: PersonAppointment,
          as: "personappointment",
          required: true,
          include: [
            {
              model: Person,
              as: "person",
              required: true,
              right: true,
            },
          ],
        },
      ],
      order: [
        ["date", "ASC"],
        ["startTime", "ASC"],
      ],
    })
      .then((data) => {
        appointment = data[0];
        appointment.students = appointment.personappointment.filter(
          (pa) => pa.isTutor === false
        );
        appointment.tutors = appointment.personappointment.filter(
          (pa) => pa.isTutor === true
        );
      })
      .catch((err) => {
        console.log("An error occurred: " + err);
      });

    let message =
      "You have an upcoming appointment:" +
      "\n    Type: " +
      appointment.type +
      "\n    Date: " +
      formatDate(appointment.date) +
      "\n    Time: " +
      calcTime(appointment.startTime) +
      "\n    Location: " +
      appointment.location.name +
      "\n    Topic: " +
      appointment.topic.name;

    if (pap.isTutor) {
      if (appointment.students.length > 1) {
        message += "\n    Students: ";
        for (let j = 0; j < appointment.students.length; j++) {
          text.message += "\n              ";
          text.message +=
            appointment.students[j].person.fName +
            " " +
            appointment.students[j].person.lName;
        }
      } else if (appointment.students.length === 1) {
        message +=
          "\n    Student: " +
          appointment.students[0].person.fName +
          " " +
          appointment.students[0].person.lName;
      }
    } else {
      message +=
        "\n    Tutor: " +
        appointment.tutors[0].person.fName +
        " " +
        appointment.tutors[0].person.lName;
    }

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

function formatDate(date) {
  let formattedDate =
    date.toISOString().substring(5, 10) +
    "-" +
    date.toISOString().substring(0, 4);
  return formattedDate;
}
