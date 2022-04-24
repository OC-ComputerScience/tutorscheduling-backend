const db = require("../models");
const PersonAppointment = db.personappointment;
const Op = db.Sequelize.Op;

// Create and Save a new PersonAppointment
exports.create = (req, res) => {
    // Validate request
    if (!req.body.personId) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
      return;
    }
  
    // Create a PersonAppointment
    const personappointment = {
      id: req.body.id,
      isTutor: req.body.isTutor,
      personId: req.body.personId,
      appointmentId: req.body.appointmentId
    };
  
    // Save PersonAppointment in the database
    PersonAppointment.create(personappointment)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the PersonAppointment."
        });
      });
  };

// Retrieve all PersonAppointment from the database.
exports.findAll = (req, res) => {
    const id = req.query.id;
    var condition = id ? { id: { [Op.like]: `%${id}%` } } : null;
  
    PersonAppointment.findAll({ where: condition })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving PersonAppointment."
        });
      });
  };

// Find a single PersonAppointment with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
  
    PersonAppointment.findByPk(id)
      .then(data => {
        if (data) {
          res.send(data);
        } else {
          res.status(404).send({
            message: `Cannot find PersonAppointment with id=${id}.`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error retrieving PersonAppointment with id=" + id
        });
      });
  };

// Update a PersonAppointment by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;
  
    PersonAppointment.update(req.body, {
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "PersonAppointment was updated successfully."
          });
        } else {
          res.send({
            message: `Cannot update PersonAppointment with id=${id}. Maybe PersonAppointment was not found or req.body is empty!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error updating PersonAppointment with id=" + id
        });
      });
  };

// Delete a PersonAppointment with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;
  
    PersonAppointment.destroy({
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "PersonAppointment was deleted successfully!"
          });
        } else {
          res.send({
            message: `Cannot delete PersonAppointment with id=${id}. Maybe PersonAppointment was not found!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete PersonAppointment with id=" + id
        });
      });
  };

// Delete all PersonAppointment from the database.
exports.deleteAll = (req, res) => {
    PersonAppointment.destroy({
      where: {},
      truncate: false
    })
      .then(nums => {
        res.send({ message: `${nums} PersonAppointment were deleted successfully!` });
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while removing all PersonAppointment."
        });
      });
  };