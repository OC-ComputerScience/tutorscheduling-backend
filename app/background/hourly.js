const cron = require('node-cron');
const db = require("../models");
const Appointment = db.appointment;
const PersonAppointment = db.personappointment;
const Person = db.person;
const Location = db.location;
const sms = require("../controllers/twilio.controller.js");
const Op = db.Sequelize.Op;
const accountSid = process.env.TWILIO_ACCOUNT_SID; 
const authToken = process.env.TWILIO_AUTH_TOKEN1 + process.env.TWILIO_AUTH_TOKEN2;
const phoneNum = process.env.TWILIO_NUMBER;
const client = require('twilio')(accountSid, authToken);


// Schedule tasks to be run on the server 12:01 am.
// From : https://www.digitalocean.com/community/tutorials/nodejs-cron-jobs-by-examples

  exports.hourlyTasks = () =>{
// for prod, runs at ever hour at 55 minute past the hour.
      cron.schedule('55 * * * *', function() {
// for testing, runs every minute
      // cron.schedule('* * * * *', function() {
        console.log('Scheduled task every day at 55 min past the hour');
        deletePastAppointments();
        notifyUpcomingAppointments();
        })
  } 

  async function deletePastAppointments() {
    let delDate = new Date().setHours(0,0,0);
    let delTime = new Date().toLocaleTimeString('it-IT');
    //get all of the appointments for today that start before now
    await Appointment.findAll({
      where: { 
        status : 'available',
        type : 'Private',
        date : {[Op.eq]: delDate},
        startTime : {[Op.lt]: delTime}
      }
    })
      .then(appointments => {
        console.log(delTime+":Checking "+appointments.length+" appointments for deletion or revision");
        if (appointments.length >0) {
          // for each appointment check to see if the need to have start time update or be deleted
          appointments.forEach((appointment) => {
          let startTime = appointment.startTime.split(":");
          let hour = parseInt(startTime[0])+1 % 24;
          if(hour < 10) {
            hour = "0" + hour
          }
          let newStartTime = hour+":"+startTime[1]+":"+startTime[2];
          if (newStartTime < appointment.endTime && appointment.endTime > delTime ) {
            appointment.startTime =  newStartTime;
            let newAppointment = appointment.dataValues
            let appointmentId = newAppointment.id
            Appointment.update(newAppointment, {
            where: { id: appointmentId}
            })
            .catch (err => {
                console.log("Could not update Appointment"+ err);
            });
          }
          else {
            let id = appointment.id
            Appointment.destroy({
              where: { id: id }
            })
           .catch (err => {
              console.log("Could not delete Appointment"+ err);
            });
          }
        })
      }
      })
      .catch(err => {
        console.log("Could not find past Appointments"+ err);
      });

      PersonAppointment.destroy({
        where: { 
          appointmentId : null
        }
      })
      .then(num => {
        console.log( num+' Past person appointments before '+delDate.toString()+' were deleted successfully!');

          })
      .catch(err => {
        console.log("Could not delete past PersonAppointments"+ err);
        });
         
  }

  async function notifyUpcomingAppointments() {
    let date = new Date().setHours(0,0,0);
    let startDate = new Date();
    startDate.setHours(startDate.getHours() + 1);
    let startTime = startDate.toLocaleTimeString('it-IT');
    let endDate = new Date();
    endDate.setHours(endDate.getHours() + 2);
    let endTime = endDate.toLocaleTimeString('it-IT');
    let personAppointments = [];
    //get all of the appointments for today that start before now
    await PersonAppointment.findAll({
      include: [{
        model: Appointment,
        as: 'appointment',
        where: {
          status: 'booked',
          date : {[Op.eq]: date},
          startTime : { [Op.and]: [ 
            {[Op.gt]: startTime},
            {[Op.lt]: endTime}]
          },
        },
        required: true
      }]
    })
      .then(pap => {
        console.log(pap.length+" people found with booked appointments");
        if (pap.length >0) {
          pap.forEach((pa) => {
            personAppointments.push(pa);
          })
        }
        PersonAppointment.findAll({
          as: 'personAppointment',
          where: {
            [Op.or]: [
              {isTutor: false},
              {appointmentId : {[Op.in]:  db.sequelize.literal("(SELECT appointmentId FROM personappointments where appointmentId=personAppointment.appointmentId AND isTutor='0')")},
            }
            ]
          },
          include: [{
            model: Appointment,
            as: 'appointment',
            where: {
              status: 'available',
              type: 'Group',
              date : {[Op.eq]: date},
              startTime : { [Op.and]: [ 
                {[Op.gt]: startTime},
                {[Op.lt]: endTime}]
              },
            },
            required: true
          }]
        })
        .then((morePap)=> {
          console.log(morePap.length+" people found with group appointments");
          if (morePap.length >0) {
            morePap.forEach((pa) => {
              personAppointments.push(pa);
            })
          }
          personAppointments.forEach((personAppoint) => {
            Person.findByPk(personAppoint.personId).then((person) => {
              Appointment.findByPk(personAppoint.appointmentId).then((appoint) => {
                Location.findByPk(appoint.locationId).then((location) => {
                  let time = calcTime(appoint.startTime);
                  let message = {
                    message: "You have an upcoming tutoring appointment:\n    Type: " + 
                      appoint.type + "\n    Time: " + time + "\n    Location: " + location.name,
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


