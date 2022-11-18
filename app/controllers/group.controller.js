const db = require("../models");
const Group = db.group;
const Role = db.role;
const PersonRole = db.personrole;
const Topic = db.topic;
const PersonTopic = db.persontopic;
const Op = db.Sequelize.Op;

// Create and Save a new Group
exports.create = (req, res) => {
  // Validate request
  if (!req.body.name) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  // Create a Group
  const group = {
    id: req.body.id,
    name: req.body.name,
    description: req.body.description,
    timeInterval: req.body.timeInterval,
    bookPastMinutes: req.body.bookPastMinutes,
    allowSplittingAppointments: req.body.allowSplittingAppointments,
  };

  // Save Group in the database
  Group.create(group)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Group.",
      });
    });
};

// Retrieve all Groups from the database.
exports.findAll = (req, res) => {
  const id = req.query.id;
  var condition = id ? { id: { [Op.like]: `%${id}%` } } : null;

  Group.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving groups.",
      });
    });
};

// Retrieve all Groups from the database.
exports.findOneByName = (req, res) => {
  const name = req.params.name;

  Group.findAll({ where: { name: name } })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving group by name.",
      });
    });
};

// Retrieve all Groups for a person from the database.
exports.findAllForPerson = (req, res) => {
  const id = req.params.personId;

  Group.findAll({
    include: [
      {
        model: Role,
        include: [
          {
            where: { "$role->personrole.personId$": id },
            model: PersonRole,
            as: "personrole",
            required: true,
          },
        ],
        as: "role",
        required: true,
      },
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving groups.",
      });
    });
};

// Retrieve all Groups for a person from the database.
exports.findAllIncompleteForPerson = (req, res) => {
  const id = req.params.personId;

  Group.findAll({
    include: [
      {
        model: Role,
        include: [
          {
            where: {
              "$role->personrole.personId$": id,
              "$role->personrole.agree$": false,
            },
            model: PersonRole,
            as: "personrole",
            required: true,
          },
        ],
        as: "role",
        required: true,
      },
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving groups.",
      });
    });
};

// Retrieve all Groups and topics for a person from the database.
exports.findAllTopicsForTutor = (req, res) => {
  const id = req.params.personId;

  Group.findAll({
    include: [
      {
        model: Topic,
        include: [
          {
            where: { "$topic->persontopic.personId$": id },
            model: PersonTopic,
            as: "persontopic",
            required: true,
          },
        ],
        as: "topic",
        required: false,
      },
      {
        model: Role,
        include: [
          {
            where: { "$role->personrole.personId$": id },
            model: PersonRole,
            as: "personrole",
            required: true,
          },
        ],
        as: "role",
        where: { "$role.type$": "Tutor" },
        required: true,
      },
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving groups.",
      });
    });
};

// Find a single Group with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Group.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Group with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Group with id=" + id,
      });
    });
};

// Update a Group by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Group.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Group was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Group with id=${id}. Maybe Group was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Group with id=" + id,
      });
    });
};

// Delete a Group with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Group.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Group was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Group with id=${id}. Maybe Person was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Group with id=" + id,
      });
    });
};

// Delete all Groups from the database.
exports.deleteAll = (req, res) => {
  Group.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} Group were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all groups.",
      });
    });
};
