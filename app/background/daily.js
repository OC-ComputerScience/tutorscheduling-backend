const cron = require('node-cron');
const db = require("../models");
const Appointment = db.appointment;
const PersonAppointment = db.personappointment;
const Person = db.person;
const Op = db.Sequelize.Op;
//twilio stuff
const accountSid = process.env.TWILIO_ACCOUNT_SID; 
const authToken = process.env.TWILIO_AUTH_TOKEN1 + process.env.TWILIO_AUTH_TOKEN2;
const phoneNum = process.env.TWILIO_NUMBER;
const client = require('twilio')(accountSid, authToken);
const url = process.env.url;



// Schedule tasks to be run on the server 12:01 am.
// From : https://www.digitalocean.com/community/tutorials/nodejs-cron-jobs-by-examples

  exports.dailyTasks = () =>{
// for prod, runs at every day at 9am.
       cron.schedule('00 09 * * *', function() {
// for testing, runs every minute
//      cron.schedule('* * * * *', function() {
        console.log('Start running a task every day at 12:01 am');
        notifyForFeedback();
        })
}

async function notifyForFeedback() {
  let date = new Date();
  date.setHours(date.getHours() - (date.getTimezoneOffset()/60))
  date.setHours(0,0,0);
  let personAppointments = [];
  //get all of the appointments for today that start before now
  await PersonAppointment.findAll({ // add notifcations for group appointments once feedback is added for them
    where: {
      isTutor: true,
      feedbackNumber: null,
    },
    include: [{
      model: Appointment,
      as: 'appointment',
      where: {
        [Op.or]: [
          {status: 'booked'},
          {type: 'Group'}
        ],
        date : {[Op.lt]: date},
      },
      required: true
    }]
  })
    .then(pap => {
      console.log(pap.length+" tutors found with feedback needed");
      if (pap.length > 0) {
        pap.forEach((pa) => {
          personAppointments.push(pa);
        })
      }
      PersonAppointment.findAll({
        as: 'personAppointment',
        where: {
          [Op.and]: [
            {appointmentId : {[Op.in]:  db.sequelize.literal("(SELECT appointmentID FROM personappointments WHERE feedbackNumber IS NOT NULL AND isTutor = true)")}},
            {feedbackNumber: null},
          ]
          }
      })
      .then((morePap)=> {
        console.log(morePap.length+" students found without feedback");
        if (morePap.length >0) {
          morePap.forEach((pa) => {
            personAppointments.push(pa);
          })
        }
        personAppointments.forEach((personAppoint) => {
          Person.findByPk(personAppoint.personId).then((person) => {
            Appointment.findByPk(personAppoint.appointmentId).then((appoint) => {
                let time = calcTime(appoint.startTime);
                let date = appoint.date.toString().slice(0,15)
                let message = {
                  message: "Please leave feedback on your appointment from " + date + " at " + time + " " + url,
                  phoneNum: person.phoneNum,
                }
                client.messages
                  .create({
                    body: message.message,
                    from: phoneNum,
                    to: message.phoneNum
                  })
                  .then(message => console.log("sent" + message.sid))
                  .catch(err => {
                    console.log("Could not send messsage"+ err);
                  });
            })
          })

          })
        })
        .catch(err => {
          console.log("Could not work"+ err);
        })
      })
      .catch(err => {
        console.log("Could not work 2"+ err);
      })
    .catch(err => {
      console.log("Could not work 3"+ err);
    });
}
function calcTime(time) {
  if(time == null)
  {
    return null;
  }
  let temp = time.split(":")
  let milHours = parseInt(temp[0])
  let minutes = temp[1]
  let hours = milHours % 12
  if (hours == 0) {
    hours = 12
  }
  let dayTime = (~~(milHours / 12) > 0 ? "PM":"AM")
  return "" + hours + ":" + minutes + " " + dayTime
}

function getLocalDateString() {
  let date = new Date();
  date.setHours(date.getHours() - (date.getTimezoneOffset()/60));
  return date.toISOString().slice(0,10);
}



