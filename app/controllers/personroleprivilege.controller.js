const PersonRolePrivilege = require("../utils/personroleprivilege.js");

exports.create = async (req, res) => {
  // Validate request
  if (!req.body.privilege) {
    res.status(400).send({
      message: "Privilege can not be empty!",
    });
    return;
  }

  await PersonRolePrivilege.createPrivilege(req.body)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while creating the person role privilege.",
      });
    });
};

exports.findAll = async (res) => {
  await PersonRolePrivilege.findAllPrivileges()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving personroleprivileges.",
      });
    });
};

exports.findPrivilegeByPersonRole = async (req, res) => {
  await PersonRolePrivilege.findPrivilegeByPersonRole(req.params.personroleId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving privileges for personrole.",
      });
    });
};

exports.findOne = async (req, res) => {
  await PersonRolePrivilege.findOnePrivilege(req.params.id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find person role privilege with id = ${req.params.id}.`,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message:
          "Error retrieving person role privilege with id = " + req.params.id,
      });
    });
};

exports.update = async (req, res) => {
  await PersonRolePrivilege.updatePrivilege(req.body, req.params.id)
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Person role privilege was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update person role privilege with id = ${req.params.id}. Maybe person role privilege was not found or req.body was empty!`,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message:
          "Error updating person role privilege with id = " + req.params.id,
      });
    });
};

exports.delete = async (req, res) => {
  await PersonRolePrivilege.deletePrivilege(req.params.id)
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Person role privilege was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete person role privilege with id = ${req.params.id}. Maybe person role privilege was not found!`,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message:
          "Could not delete person role privilege with id = " + req.params.id,
      });
    });
};

exports.deleteAll = async (res) => {
  await PersonRolePrivilege.deleteAllPrivileges()
    .then((nums) => {
      res.send({
        message: `${nums} person role privileges were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while removing all person role privileges.",
      });
    });
};
