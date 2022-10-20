
const db = require("../models");
const Availability = db.availability;
const Appointment = db.appointment;
const PersonAppointment = db.personappointment;
const Op = db.Sequelize.Op;

// Create and Save a new Availability
exports.create = (req, res) => {
    // Validate request
    if (!req.body.date) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
      return;
    }
  
    // Create a Availability
    const availability = {
      id: req.body.id,
      personId: req.body.personId,
      date: req.body.date,
      startTime: req.body.startTime,
      endTime: req.body.endTime
    };
  
    // Save Availability in the database
    Availability.create(availability)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Person."
        });
      });
  };

// Retrieve all Availability from the database.
exports.findAll = (req, res) => {
    const id = req.query.id;
    var condition = id ? { id: { [Op.like]: `%${id}%` } } : null;
  
    Availability.findAll({ where: condition })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Availability."
        });
      });
  };

  // Retrieve all Roles for a group from the database.
exports.findAllForPerson = (req, res) => {
  const id = req.params.personId;

  Availability.findAll({ where: {personId: id} })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving availabilities for person."
      });
    });
};

// Retrieve all availabilities for a group from the database.	
exports.findAllForGroup = (req, res) => {	
  const id = req.params.personId;	
  Availability.findAll({ where: {personId: id} })	
    .then(data => {	
      res.send(data);	
    })	
    .catch(err => {	
      res.status(500).send({	
        message:	
          err.message || "Some error occurred while retrieving availabilities for person."	
      });
    });
  };

exports.findAllUpcomingForPerson = (req, res) => {
  const personId = req.params.personId;
  const date = new Date();
  date.setHours(date.getHours() - (date.getTimezoneOffset()/60))
  date.setHours(0,0,0,0);

  let checkTime = new Date();
  checkTime = checkTime.getHours()+":"+ checkTime.getMinutes() +":"+checkTime.getSeconds();

  Availability.findAll({
    where: {
      personId: personId,
      [Op.or]: [
        {
          [Op.and]: [
            {startTime: { [Op.gte]: checkTime }},  {date: { [Op.eq]: date }},
          ],
        },
        {
          date: { [Op.gt]: date },
        }
      ],
    }
  })
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving appointments for person for group."
    });
  });
};


// Find a single Availability with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
  
    Availability.findByPk(id)
      .then(data => {
        if (data) {
          res.send(data);
        } else {
          res.status(404).send({
            message: `Cannot find Availability with id=${id}.`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error retrieving Availability with id=" + id
        });
      });
  };

// Update a Availability by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;
  
    Availability.update(req.body, {
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Availability was updated successfully."
          });
        } else {
          res.send({
            message: `Cannot update Availability with id=${id}. Maybe Availability was not found or req.body is empty!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error updating Availability with id=" + id
        });
      });
  };

// Delete a Availability with the specified id in the request
// and delete any available appointents for the tutor in tthe availabilty time window
exports.delete = (req, res) => {
    const id = req.params.id;
    Availability.findByPk(id)
      .then(data => {
        if (data) {
          let availability=data.dataValues;
          Availability.destroy({
            where: { id: id }
          })
            .then(num => {
              if (num == 1) {
                let tutorId = availability.personId;
                let date = availability.date;
                date.setHours(date.getHours() + 5);
                let startTime = availability.startTime;
                console.log(tutorId);
                let endTime = availability.endTime;
                console.log(date);
                Appointment.destroy({
                  where: { 
                    id : {[Op.in]:  db.sequelize.literal("(SELECT appointmentId FROM personappointments where personID="+tutorId+" AND isTutor='1')")},
                    status : 'available',
                    date : {[Op.eq]: date},
                    startTime : {[Op.gte]: startTime},
                    endTime: {[Op.lte]: endTime}
                   }
                })
                .then (()=>{
                  PersonAppointment.destroy({
                    where: { 
                      appointmentId : null
                    }
                  })
                  .catch(err => {
                    console.log("Could not delete past PersonAppointments"+ err);
                    });
                  res.send({
                    message: "Availability/Appointments were deleted successfully!"
                  })
                })
                .catch(err => {
                  res.status(500).send({
                    message: "Error deleteing Appointments for Availability with id=" + id
                  });
                })
              }
              else {
                res.send({
                  message: `Cannot delete Availability with id=${id}. Maybe Availability was not found!`
                });
              }
            })
            .catch(err => {
              res.status(500).send({
                message: "Could not delete Availability with id=" + id +" :"+ err
              });
            });
        } else {
          res.status(404).send({
            message: `Cannot find Availability with id=${id}.`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error retrieving Availability with id=" + id
        });
      });
  
    
  };

// Delete all Availability from the database.
exports.deleteAll = (req, res) => {
    Availability.destroy({
      where: {},
      truncate: false
    })
      .then(nums => {
        res.send({ message: `${nums} Availability were deleted successfully!` });
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while removing all Availability."
        });
      });
  };
  