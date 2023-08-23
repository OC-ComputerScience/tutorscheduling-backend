const cron = require("node-cron");
const Group = require("../sequelizeUtils/group.js");
// const Person = require("../utils/person.js");
const Twilio = require("../utils/twilio.js");

// Schedule tasks to be run on the server 12:01 am.
// From : https://www.digitalocean.com/community/tutorials/nodejs-cron-jobs-by-examples

exports.dailyTasks = () => {
  // for prod, runs at every day at 9AM.
  // cron.schedule("00 09 * * *", async function () {
  // for testing, runs every minute
  cron.schedule("* * * * *", async function () {
    console.log("Daily 9AM Tasks:");
    await notifyForFeedback();
  });
};

async function notifyForFeedback() {
  console.log("Finding appointments needing feedback");
  let feedbackAppointments = [];

  await Group.findPassedAppointmentsByGroupAndRole()
    .then(async (response) => {
      feedbackAppointments = response;
    })
    .catch((err) => {
      console.log("Failed to get passed appointments: " + err);
    });

  for (let i = 0; i < feedbackAppointments.length; i++) {
    let group = feedbackAppointments[i];
    let textInfo = {
      toPhoneNum: "",
      toPersonRoleId: "",
      roleType: "",
      groupName: group.name,
      appointmentCount: 0,
    };
    for (let j = 0; j < group.role.length; j++) {
      let role = group.role[j];
      textInfo.roleType = role.type;
      for (let k = 0; k < role.personrole.length; k++) {
        let person = role.personrole[k].person;
        textInfo.toPersonRoleId = role.personrole[k].id;
        textInfo.toPhoneNum = person.phoneNum;
        textInfo.appointmentCount = person.personappointment.length;
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
    }
  }
}
