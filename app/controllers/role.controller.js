const db = require("../models");
const Role = db.role;
const Person = db.person;
const PersonRole = db.personrole;
const PersonRolePrivilege = db.personroleprivilege;
const Op = db.Sequelize.Op;

// Create and Save a new Role
exports.create = (req, res) => {
  // Validate request
  if (!req.body.type) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  // Create a Role
  const role = {
    id: req.body.id,
    groupId: req.body.groupId,
    type: req.body.type,
  };

  // Save Role in the database
  Role.create(role)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Role.",
      });
    });
};

// Retrieve all Roles from the database.
exports.findAll = (req, res) => {
  const id = req.query.id;
  var condition = id ? { id: { [Op.like]: `%${id}%` } } : null;

  Role.findAll({
    where: condition,
    include: ["group"],
    order: [["type", "ASC"]],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving roles.",
      });
    });
};

// Retrieve all Roles for a group from the database.
exports.findAllForGroup = (req, res) => {
  const id = req.params.groupId;

  Role.findAll({ where: { groupId: id }, order: [["type", "ASC"]] })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving roles for group.",
      });
    });
};

// Retrieve roles per group for personroles for a specific person
exports.findRoleByGroupForPerson = (req, res) => {
  const personId = req.params.personId;
  const groupId = req.params.groupId;

  Role.findAll({
    where: { "$personrole.personId$": personId, groupId: groupId },
    include: [
      {
        model: PersonRole,
        as: "personrole",
        right: true,
        include: [
          {
            model: PersonRolePrivilege,
            as: "personroleprivilege",
          },
        ],
      },
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

// Retrieve roles per group for personroles for a specific type
exports.findRoleByGroupForType = (req, res) => {
  const type = req.params.type;
  const groupId = req.params.groupId;

  Role.findAll({
    where: { type: type, groupId: groupId },
    include: [
      {
        model: PersonRole,
        as: "personrole",
        right: true,
        include: [
          {
            model: PersonRolePrivilege,
            as: "personroleprivilege",
          },
          {
            model: Person,
            as: "person",
            right: true,
          },
        ],
      },
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

// Retrieve a role for a personrole for a specific person
exports.findRoleForPerson = (req, res) => {
  const id = req.params.personId;

  Role.findAll({
    where: { "$personrole.personId$": id },
    include: [
      {
        model: PersonRole,
        as: "personrole",
        right: true,
      },
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

// Retrieve a role for a personrole for a specific person
exports.findIncompleteRoleForPerson = (req, res) => {
  const id = req.params.personId;

  Role.findAll({
    where: { "$personrole.personId$": id, "$personrole.agree$": false },
    include: [
      {
        model: PersonRole,
        as: "personrole",
        right: true,
      },
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

// Find a single Role with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Role.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Role with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Role with id=" + id,
      });
    });
};

// Update a Role by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Role.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Role was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Role with id=${id}. Maybe Person was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Role with id=" + id,
      });
    });
};

// Delete a Role with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Role.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Role was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Role with id=${id}. Maybe Role was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Role with id=" + id,
      });
    });
};

// Delete all Roles from the database.
exports.deleteAll = (req, res) => {
  Role.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} Roles were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all roles.",
      });
    });
};
