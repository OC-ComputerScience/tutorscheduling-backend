const Group = require("../utils/group.js");

exports.create = async (req, res) => {
  // Validate request
  if (!req.body.name) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  await Group.createGroup(req.body)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the group.",
      });
    });
};

exports.findAll = async (res) => {
  await Group.findAllGroups()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving groups.",
      });
    });
};

exports.findAllForPerson = async (req, res) => {
  await Group.findGroupsForPerson(req.params.personId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving groups for person.",
      });
    });
};

exports.findContractsNeededForPerson = async (req, res) => {
  await Group.findGroupsWithMissingContractsForPerson(req.params.personId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving groups with missing contracts for person.",
      });
    });
};

exports.findTopicsNeededForTutor = async (req, res) => {
  await Group.findGroupsWithMissingTopicsForTutor(req.params.personId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving groups with missing topics for tutor.",
      });
    });
};

exports.findOneByName = async (req, res) => {
  await Group.findGroupByName(req.params.name)
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

exports.findOne = async (req, res) => {
  await Group.findOneGroup(req.paramms.id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find group with id = ${req.params.id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving group with id = " + req.params.id,
      });
      console.log("Error finding group " + err);
    });
};

exports.update = async (req, res) => {
  await Group.updateGroup(req.params.id)
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Group was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update group with id = ${req.params.id}. Maybe group was not found or req.body was empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating group with id = " + req.params.id,
      });
      console.log("Error updating group " + err);
    });
};

exports.delete = async (req, res) => {
  await Group.deleteGroup(req.params.id)
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Group was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete group with id = ${req.params.id}. Maybe group was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete group with id = " + req.params.id,
      });
      console.log("Error deleting group " + err);
    });
};

exports.deleteAll = async (res) => {
  await Group.deleteAllGroups()
    .then((nums) => {
      res.send({ message: `${nums} groups were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all groups.",
      });
      console.log("Error deleting groups " + err);
    });
};
