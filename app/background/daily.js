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


// Schedule tasks to be run on the server 12:01 am.
// From : https://www.digitalocean.com/community/tutorials/nodejs-cron-jobs-by-examples
//  exports.dailyTasks = () =>{
  exports.hourlyTasks = () =>{
// for prod, runs at ever hour at 55 minute past the hour.
//       cron.schedule('55 * * * *', function() {
// for testing, runs every minute
      cron.schedule('* * * * *', function() {
        console.log('Start running a task every day at 12:01 am');
        notifyForFeedback();
        })
}

async function notifyForFeedback() {
  let date = new Date().setHours(0,0,0);
  let endDate = new Date();
  endDate.setHours(endDate.getHours() + 1);
  let endTime = endDate.toLocaleTimeString('it-IT');
  let personAppointments = [];
  //get all of the appointments for today that start before now
  await PersonAppointment.findAll({ // if appointment is passed and status != complete -> if appoint is complete and feedbacknumber == 0 and istutor = 0
    where: {
      isTutor: true
    },
    include: [{
      model: Appointment,
      as: 'appointment',
      where: {
        status: 'booked',
        date : {[Op.lte]: date},
        endTime : {[Op.lt]: endTime},
      },
      required: true
    }]
  })
    .then(pap => {
      console.log(pap.length+" tutors found with feedback needed");
      if (pap.length >0) {
        pap.forEach((pa) => {
          personAppointments.push(pa);
        })
      }
      PersonAppointment.findAll({
        as: 'personAppointment',
        where: {
          [Op.and]: [
            {appointmentId : {[Op.in]:  db.sequelize.literal("(SELECT appointmentId FROM personappointments where appointmentId=personAppointment.appointmentId AND feedbacknumber IS NULL)")},
          },
          {feedbackNumber: null}
          ]
        },
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
                let date = appoint.date.toString().substring(5,10) + "-" + appoint.date.toString().substring(0,4)
                // dev
                let url = 'http://tutorschedulingdev.oc.edu/';
                // prod
                //let url = 'http://tutorscheduling.oc.edu/';
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




