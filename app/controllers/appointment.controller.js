const db = require("../models");
const Appointment = db.appointment;
const PersonAppointment = db.personappointment;
const Location = db.location;
const Topic = db.topic;
const Op = db.Sequelize.Op;

// Create and Save a new Appointment
exports.create = (req, res) => {
    // Validate request
    if (!req.body.date) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
      return;
    }
  
    // Create a Appointment
    const appointment = {
      id: req.body.id,
      groupId: req.body.groupId,
      topicId: req.body.topicId,
      locationId: req.body.locationId,
      date: req.body.date,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      type: req.body.type,
      status: req.body.status,
      tutorStart: req.body.tutorStart,
      tutorEnd: req.body.tutorEnd,
      URL: req.body.URL,
      tutorFeedback: req.body.tutorFeedback,
      studentFeedback: req.body.studentFeedback,
      preSessionInfo: req.body.preSessionInfo
    };
  
    // Save Appointment in the database
    Appointment.create(appointment)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Appointment."
        });
      });
  };

// Retrieve all Appointment from the database.
exports.findAll = (req, res) => {
    const id = req.query.id;
    var condition = id ? { id: { [Op.like]: `%${id}%` } } : null;
  
    Appointment.findAll({ where: condition })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Appointment."
        });
      });
  };

    // Retrieve all upcoming appointments for a person for a group from the database.
exports.findAllUpcomingForPersonForGroup = (req, res) => {
  const personId = req.params.personId;
  const groupId = req.params.groupId;
  const date = new Date();

  Appointment.findAll({ 
    where: {groupId: groupId, date: { $gte: date }},
    include: [{
      where: { '$personappointment.personId$': personId },
      model: PersonAppointment,
      as: 'personappointment',
      required: true
    }]
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


  // Retrieve all appointments for a person for a group from the database.
exports.findAllForPersonForGroup = (req, res) => {
  const personId = req.params.personId;
  const groupId = req.params.groupId;

  Appointment.findAll({ 
    where: {groupId: groupId},
    include: [{
      where: { '$personappointment.personId$': personId },
      model: PersonAppointment,
      as: 'personappointment',
      required: true
    }]
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

  // Retrieve all appointments for a person for a group from the database.
  exports.findAllUpcomingForGroup = (req, res) => {
    const groupId = req.params.groupId;
    const date = new Date();
    // const time = date.toLocaleTimeString('en-US', { hour12: false });
  
    Appointment.findAll({ where: { 
                            groupId: groupId, 
                            date: { $gte: date }
                        }})
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving appointments for group."
        });
      });
  };

  // Retrieve all appointments for a person for a group from the database.
  exports.findAllForGroup = (req, res) => {
    const groupId = req.params.groupId;
  
    Appointment.findAll({ 
        where: {groupId: groupId},
        include: [{
          model: Location,
          as: 'location',
          required: true
        },
        {
          model: Topic,
          as: 'topic',
          required: true
        },
        {
          model: PersonAppointment,
          as: 'personappointment',
          required: true
        }] 
      })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving appointments for group."
        });
      });
  };

  // Retrieve all Appointments for a person from the database.
exports.findAllForPerson = (req, res) => {
  const id = req.params.personId;

  Appointment.findAll({ 
    include: [{
      where: { '$personappointment.personId$': id },
      model: PersonAppointment,
      as: 'personappointment',
      required: true
    }]
  })
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving appointments."
    });
  });
};

// Find a single Appointment with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
  
    Appointment.findByPk(id)
      .then(data => {
        if (data) {
          res.send(data);
        } else {
          res.status(404).send({
            message: `Cannot find Appointment with id=${id}.`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error retrieving Appointment with id=" + id
        });
      });
  };

// Update a Appointment by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;
  
    Appointment.update(req.body, {
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Appointment was updated successfully."
          });
        } else {
          res.send({
            message: `Cannot update Appointment with id=${id}. Maybe Appointment was not found or req.body is empty!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error updating Appointment with id=" + id
        });
      });
  };

// Delete a Appointment with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;
  
    Appointment.destroy({
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Appointment was deleted successfully!"
          });
        } else {
          res.send({
            message: `Cannot delete Appointment with id=${id}. Maybe Appointment was not found!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete Appointment with id=" + id
        });
      });
  };

// Delete all Appointment from the database.
exports.deleteAll = (req, res) => {
    Appointment.destroy({
      where: {},
      truncate: false
    })
      .then(nums => {
        res.send({ message: `${nums} Appointment were deleted successfully!` });
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while removing all Appointment."
        });
      });
  };