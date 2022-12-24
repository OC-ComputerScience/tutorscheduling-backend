const db = require("../models");
const Request = db.request;
const Person = db.person;
const Topic = db.topic;
const Op = db.Sequelize.Op;

// Create and Save a new Request
exports.create = (req, res) => {
  // Validate request
  if (!req.body.description) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  // Create a Request
  const request = {
    id: req.body.id,
    personId: req.body.personId,
    groupId: req.body.groupId,
    topicId: req.body.topicId,
    courseNum: req.body.courseNum,
    description: req.body.description,
    status: req.body.status,
    problem: req.body.problem,
  };

  // Save Request in the database
  Request.create(request)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Request.",
      });
      console.log(err.message);
    });
};

// Retrieve all Request from the database.
exports.findAll = (req, res) => {
  const id = req.query.id;
  var condition = id ? { id: { [Op.like]: `%${id}%` } } : null;

  Request.findAll({
    where: condition,
    order: [
      ["status", "DESC"],
      ["createdAt", "ASC"],
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Request.",
      });
    });
};

// Find a single Request with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Request.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Request with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Request with id=" + id,
      });
    });
};

// Retrieve all requests for a group from the database.
exports.findAllForGroup = (req, res) => {
  const id = req.params.groupId;

  Request.findAll({
    where: { groupId: id },
    include: [
      {
        model: Person,
        as: "person",
        required: true,
      },
      {
        model: Topic,
        as: "topic",
        required: false,
      },
    ],
    order: [
      ["status", "DESC"],
      ["createdAt", "ASC"],
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving requests for group.",
      });
    });
};

// Update a Request by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Request.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Request was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Request with id=${id}. Maybe Request was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Request with id=" + id,
      });
    });
};

// Delete a Request with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Request.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Request was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Request with id=${id}. Maybe Request was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Request with id=" + id,
      });
    });
};

// Delete all PersonTopic for person from the database.
exports.deleteAllForPersonForGroup = (req, res) => {
  const personId = req.params.personId;
  const groupId = req.params.personId;

  Request.destroy({
    where: { personId: personId, groupId: groupId },
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} PersonTopic were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all PersonTopic.",
      });
    });
};

// Delete all Request from the database.
exports.deleteAll = (req, res) => {
  Request.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} Request were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all Request.",
      });
    });
};
