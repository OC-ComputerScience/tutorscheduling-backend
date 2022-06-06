const cron = require('node-cron');
const db = require("../models");
const Appointment = db.appointment;
const PersonAppointment = db.personappointment;
const Op = db.Sequelize.Op;

// Schedule tasks to be run on the server 12:01 am.
// From : https://www.digitalocean.com/community/tutorials/nodejs-cron-jobs-by-examples

  exports.dailyTasks = () =>{
// for prod, runs at ever hour at 55 minute past the hour.
       cron.schedule('55 * * * *', function() {
// for testing, runs every minute
//      cron.schedule('* * * * *', function() {
        console.log('Start running a task every day at 12:01 am');
      
        })
}



