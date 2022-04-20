const db = require("../models");
const Availability = db.availability;
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
exports.delete = (req, res) => {
    const id = req.params.id;
  
    Availability.destroy({
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Availability was deleted successfully!"
          });
        } else {
          res.send({
            message: `Cannot delete Availability with id=${id}. Maybe Availability was not found!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete Availability with id=" + id
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