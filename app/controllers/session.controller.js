const db = require("../models");
const Session = db.session;
const Op = db.Sequelize.Op;

// Create and Save a new session
exports.create = (req, res) => {
  // Validate request
  if (!req.body.type) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  // Create a session
  const session = {
    id: req.body.id,
    groupId: req.body.groupId,
    type: req.body.type,
  };

  // Save session in the database
  Session.create(session)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the session.",
      });
    });
};

// Retrieve all sessions from the database.
exports.findAll = (req, res) => {
  const id = req.query.id;
  var condition = id ? { id: { [Op.like]: `%${id}%` } } : null;

  Session.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving sessions.",
      });
    });
};

// Find a single session with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Session.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find session with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving session with id=" + id,
      });
    });
};

// Update a session by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Session.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "session was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update session with id=${id}. Maybe Person was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating session with id=" + id,
      });
    });
};

// Delete a session with the specified id in the request
exports.delete = (req, res) => {
  const token = req.body.token;

  Session.destroy({
    where: { token: token },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "session was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete session with id=${token}. Maybe session was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete session with id=" + token,
      });
    });
};

// Delete all sessions from the database.
exports.deleteAll = (req, res) => {
  Session.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} sessions were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all sessions.",
      });
    });
};
