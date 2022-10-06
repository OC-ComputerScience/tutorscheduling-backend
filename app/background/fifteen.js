const cron = require('node-cron');
const db = require("../models");
const Appointment = db.appointment;
const PersonAppointment = db.personappointment;
const Person = db.person;
const Location = db.location;
const Op = db.Sequelize.Op;
const Group = db.group;


// Schedule tasks to be run on the server 12:01 am.
// From : https://www.digitalocean.com/community/tutorials/nodejs-cron-jobs-by-examples

  exports.fifteenMinuteTasks = () =>{
// for prod, runs at ever hour at 15 minute past the hour.
      cron.schedule('*/15 * * * *', function() {
// for testing, runs every minute
    //   cron.schedule('* * * * *', function() {
            console.log('Scheduled task every 15 mins');
            deletePastAppointments();
        })
  } 

async function deletePastAppointments() {
    let delDate = new Date().setHours(0,0,0);
    let delTime = new Date().toLocaleTimeString('it-IT');

    //get all of the appointments for today that start before now
    await Appointment.findAll({
        where: { 
        [Op.or]: [
            {type: 'Private'},
            { [Op.and] : [
                {type: 'Group'},
                {id : {[Op.in]:  db.sequelize.literal("(SELECT COUNT(spa.id) FROM roles AS sr, personroles as spr, personappointments as spa, appointments a WHERE spr.roleId = sr.id AND spr.personId = spa.personId AND spa.id = a.id AND sr.type = 'Student') = 0")}}
            ] 
            }
        ],
        status : 'available',
        date : {[Op.eq]: delDate},
        startTime : {[Op.lt]: delTime}
        },
        include: [{
        model: Group,
        as: 'group',
        required: true
        }]
    })
    .then(appointments => {
        console.log(delTime+":Checking "+appointments.length+" appointments for deletion or revision");
        if (appointments.length >0) {
        // for each appointment check to see if the need to have start time update or be deleted
        appointments.forEach((appointment) => {
            // let startTime = .split(":");
            let startTime = addMinsToTime(appointment.group.timeInterval, appointment.startTime)
            console.log(startTime)
            // let hour = parseInt(startTime[0])+1 % 24;
            // if(hour < 10) {
            // hour = "0" + hour
            // }
            // let newStartTime = hour+":"+startTime[1]+":"+startTime[2];
            // should not try to change time of group appointment, should just delete those
            if (startTime < appointment.endTime && appointment.endTime > delTime && appointment.type === "Private" && appointment.group.allowSplittingAppointments) {
                appointment.startTime =  startTime;
                let newAppointment = appointment.dataValues
                let appointmentId = newAppointment.id
                Appointment.update(newAppointment, {
                    where: { id: appointmentId}
                })
                .catch (err => {
                    console.log("Could not update Appointment"+ err);
                });
            } else {
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
        console.log("Could not find past Appointments: "+ err);
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

function addMinsToTime(mins, time) {
    // get the times hour and min value
    var [timeHrs, timeMins] = getHoursAndMinsFromTime(time);

    // time arithmetic (addition)
    if (timeMins + mins >= 60) {
        var addedHrs = parseInt((timeMins + mins) / 60);
        timeMins = (timeMins + mins) % 60
        if (timeHrs + addedHrs > 23) {
            timeHrs = (timeHrs + addedHrs) % 24;
        } else {
            timeHrs += addedHrs;
        }
    } else {
        timeMins += mins;
    }

    // make sure the time slots are padded correctly
    return String("00" + timeHrs).slice(-2) + ":" + String("00" + timeMins).slice(-2) + ":00";
}

function getHoursAndMinsFromTime(time) {
    return time.split(':').map(function(str) {
      return parseInt(str);
    });

}
