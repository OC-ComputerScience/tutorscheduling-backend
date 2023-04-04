const cron = require("node-cron");
const Person = require("../sequelizeUtils/person.js");
const Twilio = require("../utils/twilio.js");

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

  // notify tutors for appointments that have passed
  await Person.findTutorsForPassedAppointments()
    .then(async (response) => {
      let tutors = response;
      for (let i = 0; i < tutors.length; i++) {
        let textInfo = {
          toPhoneNum: tutors[i].phoneNum,
          roleType: "Tutor",
          appointmentCount: tutors[i].personappointment.length,
        };
        await Twilio.sendFeedbackMessage(textInfo)
          .then((message) => {
            if (message.sid !== undefined) {
              console.log("Sent text " + message.sid);
            } else {
              console.log(message);
            }
          })
          .catch((err) => {
            console.log("Error sending feedback text: " + err);
          });
      }
    })
    .catch((err) => {
      console.log("Failed to get tutors for passed appointments: " + err);
    });

  // notify students for appointments that have passed
  await Person.findStudentsForPassedAppointments()
    .then(async (response) => {
      let students = response;
      for (let i = 0; i < students.length; i++) {
        let textInfo = {
          toPhoneNum: students[i].phoneNum,
          roleType: "Student",
          appointmentCount: students[i].personappointment.length,
        };
        await Twilio.sendFeedbackMessage(textInfo)
          .then((message) => {
            if (message.sid !== undefined) {
              console.log("Sent text " + message.sid);
            } else {
              console.log(message);
            }
          })
          .catch((err) => {
            console.log("Error sending feedback text: " + err);
          });
      }
    })
    .catch((err) => {
      console.log("Failed to get students for passed appointments: " + err);
    });
}
