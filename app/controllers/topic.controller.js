const Topic = require("../sequelizeUtils/topic.js");
const PersonTopic = require("../sequelizeUtils/persontopic.js");

exports.create = async (req, res) => {
  await Topic.createTopic(req.body)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the topic.",
      });
    });
};

exports.findAll = async (req, res) => {
  await Topic.findAllTopics()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving topics.",
      });
    });
};

exports.findAllForGroup = async (req, res) => {
  await Topic.findAllTopicsForGroup(req.params.groupId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving topics for group.",
      });
    });
};

exports.findActiveForGroup = async (req, res) => {
  await Topic.findActiveTopicsForGroup(req.params.groupId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving active topics for group.",
      });
    });
};

exports.findTopicByGroupForPerson = async (req, res) => {
  await Topic.findTopicsForPersonForGroup(
    req.params.groupId,
    req.params.personId
  )
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.findTopicForPerson = async (req, res) => {
  await Topic.findTopicsForPerson(req.params.personId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.getAppointmentHourCount = async (req, res) => {
  await Topic.getTopicAppointmentHours(req.params.groupId, req.params.currWeek)
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: err.message });
    });
};

exports.findOne = async (req, res) => {
  await Topic.findOneTopic(req.params.id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find topic with id = ${req.params.id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving topic with id = " + req.params.id,
      });
      console.log("Could not find topic: " + err);
    });
};

exports.update = async (req, res) => {
  if (req.body.status === "disabled") {
    await PersonTopic.deletePersonTopicsForTopic(req.body.id).catch((err) => {
      res.status(500).send({ message: err.message });
      return;
    });
  }
  await Topic.updateTopic(req.body, req.params.id)
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Topic was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update topic with id = ${req.params.id}. Maybe topic was not found or req.body was empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating topic with id = " + id,
      });
      console.log("Could not update topic: " + err);
    });
};

exports.delete = async (req, res) => {
  await Topic.deleteTopic(req.params.id)
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Topic was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete topic with id = ${req.params.id}. Maybe topic was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete topic with id = " + id,
      });
      console.log("Could not delete topic: " + err);
    });
};

exports.deleteAll = async (req, res) => {
  await Topic.deleteAllTopics()
    .then((nums) => {
      res.send({ message: `${nums} topics were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all topics.",
      });
    });
};
