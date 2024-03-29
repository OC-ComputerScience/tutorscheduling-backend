const PersonRole = require("../sequelizeUtils/personrole.js");
const Disabling = require("../utils/disabling.js");

exports.create = async (req, res) => {
  await PersonRole.createPersonRole(req.body)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the person role.",
      });
    });
};

exports.findAll = async (req, res) => {
  await PersonRole.findAllPersonRoles()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving person roles.",
      });
    });
};

exports.findAllForPerson = async (req, res) => {
  await PersonRole.findAllPersonRolesForPerson(req.params.personId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving person roles for person.",
      });
    });
};

exports.findGroupByPersonRole = async (req, res) => {
  await PersonRole.findGroupByPersonRole(req.params.id)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving person roles for group.",
      });
    });
};

exports.findOneForType = async (req, res) => {
  await PersonRole.findOneForPersonForRole(
    req.params.personId,
    req.params.roleId
  )
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving person roles for person and role.",
      });
    });
};

exports.findOne = async (req, res) => {
  await PersonRole.findOnePersonRole(req.params.id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find person role with id = ${req.params.id}.`,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Error retrieving person role with id = " + req.params.id,
      });
    });
};

exports.update = async (req, res) => {
  await PersonRole.updatePersonRole(req.body, req.params.id)
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Person role was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update person role with id = ${req.params.id}. Maybe person role was not found or req.body was empty!`,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Error updating person role with id = " + req.params.id,
      });
    });
};

exports.disablePersonRole = async (req, res) => {
  await Disabling.disablePersonRole(req.body).then((data) => {
    if (data) {
      res.send({
        message: "Person role was disabled successfully.",
      });
    } else {
      res.send({
        message: `Cannot disable person role.`,
      });
    }
  }).catch((err) => {
    console.log(err);
    res.status(500).send({
      message: "Error disabling person role",
    });
  });
}

exports.delete = async (req, res) => {
  await PersonRole.deletePersonRole(req.params.id)
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Person role was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete person role with id = ${req.params.id}. Maybe person role was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete person role with id = " + req.params.id,
      });
    });
};

exports.deleteAll = async (req, res) => {
  await PersonRole.deleteAllPersonRoles()
    .then((nums) => {
      res.send({ message: `${nums} person roles were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all person roles.",
      });
    });
};
