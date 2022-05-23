const cron = require('node-cron');
const db = require("../models");
const Appointment = db.appointment;
const PersonAppointment = db.personappointment;
const Op = db.Sequelize.Op;

// Schedule tasks to be run on the server 12:01 am.
// From : https://www.digitalocean.com/community/tutorials/nodejs-cron-jobs-by-examples

  exports.dailyTasks = () =>{
// for prod, runs at 12:01 am.
//      cron.schedule('01 00 * * *', function() {
// for testing, runs every minute
      cron.schedule('* * * * *', function() {
        console.log('Start running a task every day at 12:01 am');
        deletePastAppointments();
        })
}

  function deletePastAppointments() {
    var delDate = new Date();
    Appointment.destroy({
      where: { 
        status : 'available',
        date : {[Op.lt]: delDate},
      }
    })
      .then(num => {
        console.log( num+' Past appointments before '+delDate.toString()+' were deleted successfully!');
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
          })
      .catch(err => {
        console.log("Could not delete past Appointments"+ err);
        });
  }


