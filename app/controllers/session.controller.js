const db = require("../models");
const Session = db.session;
const Op = db.Sequelize.Op;

// Create and Save a new Session
exports.create = (req, res) => {
    // Validate request
    if (!req.body.token) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
      return;
    }
  
    // Create a Session
    const session = {
      id: req.body.id,
      personId: req.body.personId,
      token: req.body.token,
      email: req.body.email,
      expirationDate: req.body.expirationDate
    };
  
    // Save Session in the database
    Session.create(session)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Session."
        });
      });
  };

// Retrieve all Session from the database.
exports.findAll = (req, res) => {
    const id = req.query.id;
    var condition = id ? { id: { [Op.like]: `%${id}%` } } : null;
  
    Session.findAll({ where: condition })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Session."
        });
      });
  };

// Find a single Session with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
  
    Session.findByPk(id)
      .then(data => {
        if (data) {
          res.send(data);
        } else {
          res.status(404).send({
            message: `Cannot find Session with id=${id}.`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error retrieving Session with id=" + id
        });
      });
  };

// Update a Session by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;
  
    Session.update(req.body, {
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Session was updated successfully."
          });
        } else {
          res.send({
            message: `Cannot update Session with id=${id}. Maybe Session was not found or req.body is empty!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error updating Session with id=" + id
        });
      });
  };

// Delete a Session with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;
  
    Session.destroy({
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Session was deleted successfully!"
          });
        } else {
          res.send({
            message: `Cannot delete Session with id=${id}. Maybe Session was not found!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete Session with id=" + id
        });
      });
  };

// Delete all Session from the database.
exports.deleteAll = (req, res) => {
    Session.destroy({
      where: {},
      truncate: false
    })
      .then(nums => {
        res.send({ message: `${nums} Session were deleted successfully!` });
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while removing all Session."
        });
      });
  };