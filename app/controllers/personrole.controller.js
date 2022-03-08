const db = require("../models");
const PersonRole = db.personrole;
const Op = db.Sequelize.Op;

// Create and Save a new PersonRole
exports.create = (req, res) => {
    // Validate request
    if (!req.body.status) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
      return;
    }
  
    // Create a PersonRole
    const personrole = {
      id: req.body.id,
      personId: req.body.personId,
      roleId: req.body.roleId,
      status: req.body.status,
      agree: req.body.agree,
      dateSigned: req.body.dateSigned
    };
  
    // Save PersonRole in the database
    PersonRole.create(personrole)
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

// Retrieve all PeopleRole from the database.
exports.findAll = (req, res) => {
    const id = req.query.id;
    var condition = id ? { id: { [Op.like]: `%${id}%` } } : null;
  
    PersonRole.findAll({ where: condition })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving personroles."
        });
      });
  };

// Retrieve all Person Roles and their corresponding roles for a person from the database.
exports.findAllForPerson = (req, res) => {
  const id = req.params.personId;

  PersonRole.findAll({ where: {personId: id} })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving personroles for person."
      });
    });
};

// Find a single PersonRole with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
  
    PersonRole.findByPk(id)
      .then(data => {
        if (data) {
          res.send(data);
        } else {
          res.status(404).send({
            message: `Cannot find PersonRole with id=${id}.`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error retrieving PersonRole with id=" + id
        });
      });
  };

// Update a PersonRole by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;
  
    PersonRole.update(req.body, {
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "PersonRole was updated successfully."
          });
        } else {
          res.send({
            message: `Cannot update PersonRole with id=${id}. Maybe PersonRole was not found or req.body is empty!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error updating PersonRole with id=" + id
        });
      });
  };

// Delete a PersonRole with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;
  
    PersonRole.destroy({
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "PersonRole was deleted successfully!"
          });
        } else {
          res.send({
            message: `Cannot delete PersonRole with id=${id}. Maybe PersonRole was not found!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete PersonRole with id=" + id
        });
      });
  };

// Delete all PeopleRole from the database.
exports.deleteAll = (req, res) => {
    PersonRole.destroy({
      where: {},
      truncate: false
    })
      .then(nums => {
        res.send({ message: `${nums} PersonRoles were deleted successfully!` });
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while removing all personroles."
        });
      });
  };