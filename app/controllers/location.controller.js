const db = require("../models");
const Location = db.location;
const Op = db.Sequelize.Op;

// Create and Save a new Location
exports.create = (req, res) => {
    // Validate request
    if (!req.body.name) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
      return;
    }
  
    // Create a Location
    const location = {
      id: req.body.id,
      name: req.body.name,
      type: req.body.type,
      building: req.body.building,
      description: req.body.description,
      groupId: req.body.groupId
    };
  
    // Save Location in the database
    Location.create(location)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Location."
        });
      });
  };

// Retrieve all Location from the database.
exports.findAll = (req, res) => {
    const id = req.query.id;
    var condition = id ? { id: { [Op.like]: `%${id}%` } } : null;
  
    Location.findAll({ where: condition })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Location."
        });
      });
  };

  // Retrieve all locations for a group from the database.
exports.findAllForGroup = (req, res) => {
  const id = req.params.groupId;

  Location.findAll({ where: {groupId: id} })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving locations for group."
      });
    });
};

// Find a single Location with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
  
    Location.findByPk(id)
      .then(data => {
        if (data) {
          res.send(data);
        } else {
          res.status(404).send({
            message: `Cannot find Location with id=${id}.`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error retrieving Location with id=" + id
        });
      });
  };

// Update a Location by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;
  
    Location.update(req.body, {
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Location was updated successfully."
          });
        } else {
          res.send({
            message: `Cannot update Location with id=${id}. Maybe Location was not found or req.body is empty!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error updating Location with id=" + id
        });
        console.log("Error updating location" + err);
      });
  };

// Delete a Location with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;
  
    Location.destroy({
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Location was deleted successfully!"
          });
        } else {
          res.send({
            message: `Cannot delete Location with id=${id}. Maybe Location was not found!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete Location with id=" + id
        });
      });
  };

// Delete all Location from the database.
exports.deleteAll = (req, res) => {
    Location.destroy({
      where: {},
      truncate: false
    })
      .then(nums => {
        res.send({ message: `${nums} Location were deleted successfully!` });
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while removing all Location."
        });
      });
  };
  