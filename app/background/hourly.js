const cron = require('node-cron');
const db = require("../models");
const Appointment = db.appointment;
const PersonAppointment = db.personappointment;
const Op = db.Sequelize.Op;

// Schedule tasks to be run on the server 12:01 am.
// From : https://www.digitalocean.com/community/tutorials/nodejs-cron-jobs-by-examples

  exports.hourlyTasks = () =>{
// for prod, runs at ever hour at 55 minute past the hour.
       cron.schedule('55 * * * *', function() {
// for testing, runs every minute
//      cron.schedule('* * * * *', function() {
        console.log('Scheduled task every day at 55 min past the hour');
        deletePastAppointments();
        })
}

  async function deletePastAppointments() {
    let delDate = new Date().setHours(0,0,0);
    let delTime = new Date().toLocaleTimeString('it-IT');
    //get all of the appointments for today that start before now
    await Appointment.findAll({
      where: { 
        status : 'available',
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


