const db = require("../models");
const PersonRolePrivilege = db.personroleprivilege;
const Op = db.Sequelize.Op;

// Create and Save a new PersonRolePrivilege
exports.create = (req, res) => {
    // Validate request
    if (!req.body.status) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
      return;
    }
  
    // Create a PersonRolePrivilege
    const personroleprivilege = {
      id: req.body.id,
      personRoleId: req.body.personRoleId,
      privilege: req.body.privilege
    };
  
    // Save PersonRolePrivilege in the database
    PersonRolePrivilege.create(personroleprivilege)
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
  
    PersonRolePrivilege.findAll({ where: condition, include: ["person"] })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving personroleprivileges."
        });
      });
  };

// Find a single PersonRolePrivilege with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
  
    PersonRolePrivilege.findByPk(id)
      .then(data => {
        if (data) {
          res.send(data);
        } else {
          res.status(404).send({
            message: `Cannot find PersonRolePrivilege with id=${id}.`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error retrieving PersonRolePrivilege with id=" + id
        });
      });
  };

// Update a PersonRolePrivilege by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;
  
    PersonRolePrivilege.update(req.body, {
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "PersonRolePrivilege was updated successfully."
          });
        } else {
          res.send({
            message: `Cannot update PersonRolePrivilege with id=${id}. Maybe PersonRolePrivilege was not found or req.body is empty!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error updating PersonRolePrivilege with id=" + id
        });
      });
  };

// Delete a PersonRolePrivilege with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;
  
    PersonRolePrivilege.destroy({
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "PersonRolePrivilege was deleted successfully!"
          });
        } else {
          res.send({
            message: `Cannot delete PersonRolePrivilege with id=${id}. Maybe PersonRolePrivilege was not found!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete PersonRolePrivilege with id=" + id
        });
      });
  };

// Delete all PersonRolePrivilege from the database.
exports.deleteAll = (req, res) => {
    PersonRolePrivilege.destroy({
      where: {},
      truncate: false
    })
      .then(nums => {
        res.send({ message: `${nums} PersonRolePrivileges were deleted successfully!` });
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while removing all personroleprivileges."
        });
      });
  };
  