const Role = require("../utils/role.js");

exports.create = async (req, res) => {
  // Validate request
  if (!req.body.type) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  await Role.createRole(req.body)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the role.",
      });
    });
};

exports.findAll = async (req, res) => {
  await Role.findAllRoles()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving roles.",
      });
    });
};

exports.findAllForGroup = async (req, res) => {
  await Role.findAllRolesForGroup(req.params.groupId)
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

exports.findRoleByGroupForPerson = async (req, res) => {
  await Role.findRolesForPersonForGroup(req.params.groupId, req.params.personId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.findRoleByGroupForType = async (req, res) => {
  await Role.findRolesForTypeForGroup(req.params.groupId, req.params.type)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.findRoleForPerson = async (req, res) => {
  await Role.findRolesForPerson(req.params.personId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.findIncompleteRoleForPerson = async (req, res) => {
  await Role.findIncompleteRolesForPerson(req.params.personId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.findOne = async (req, res) => {
  await Role.findOneRole(req.params.id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find role with id = ${req.params.id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving role with id = " + req.params.id,
      });
      console.log("Could not find role: " + err);
    });
};

exports.update = async (req, res) => {
  await Role.updateRole(req.body, req.params.id)
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Role was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update role with id = ${req.params.id}. Maybe role was not found or req.body was empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating role with id = " + req.params.id,
      });
      console.log("Could not update role: " + err);
    });
};

exports.delete = async (req, res) => {
  await Role.deleteRole(req.params.id)
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Role was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete role with id = ${req.params.id}. Maybe role was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete role with id = " + req.params.id,
      });
      console.log("Could not delete role: " + err);
    });
};

exports.deleteAll = async (req, res) => {
  await Role.deleteAllRoles()
    .then((nums) => {
      res.send({ message: `${nums} roles were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all roles.",
      });
      console.log("Could not delete roles: " + err);
    });
};
