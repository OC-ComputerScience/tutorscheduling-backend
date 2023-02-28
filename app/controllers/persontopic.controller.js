const PersonTopic = require("../utils/persontopic.js");
const Topic = require("../utils/topic.js");

exports.create = async (req, res) => {
  await PersonTopic.createPersonTopic(req.body)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the person topic.",
      });
    });
};

exports.findAll = async (req, res) => {
  await PersonTopic.findAllPersonTopics()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving person topics.",
      });
    });
};

exports.findAllForPerson = async (req, res) => {
  await PersonTopic.findAllPersonTopicsForPerson(req.params.personId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving person topics for person.",
      });
    });
};

exports.getTopicForPersonGroup = async (req, res) => {
  await Topic.findTopicsForPersonForGroup(
    req.params.groupId,
    req.params.personId
  )
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving topics for person for group.",
      });
    });
};

exports.findOne = async (req, res) => {
  await PersonTopic.findOnePersonTopic(req.params.id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find person topic with id = ${req.params.id}.`,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Error retrieving person topic with id = " + req.params.id,
      });
    });
};

exports.update = async (req, res) => {
  await PersonTopic.updatePersonTopic(req.body, req.params.id)
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Person topic was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update person topic with id = ${req.params.id}. Maybe person topic was not found or req.body was empty!`,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Error updating person topic with id = " + req.params.id,
      });
    });
};

exports.deleteWithTopicId = async (req, res) => {
  let disableTopics = await Topic.findAllDisabledTopics(req.params.topicId);
  if (disableTopics[0] !== undefined && disableTopics !== null) {
    for (let i = 0; i < disableTopics[0].persontopic.length; i++) {
      let personTopic = disableTopics[0].persontopic[i];
      await PersonTopic.deleteOnePersonTopic(personTopic.id).catch((err) => {
        res.status(500).send({ message: err.message });
        return;
      });
    }
  } else {
    res
      .status(200)
      .send({ message: "No person topics found for that disabled topic!" });
  }
};

exports.delete = async (req, res) => {
  await PersonTopic.deleteOnePersonTopic(req.params.id)
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Person topic was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete person topic with id = ${req.params.id}. Maybe person topic was not found!`,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Could not delete person topic with id = " + req.params.id,
      });
    });
};

exports.deleteAllForPersonForGroup = async (req, res) => {
  let disableTopics = await Topic.findTopicsForPersonForGroup(
    req.params.groupId,
    req.params.personId
  );
  if (disableTopics[0] !== undefined && disableTopics !== null) {
    for (let i = 0; i < disableTopics[0].persontopic.length; i++) {
      let personTopic = disableTopics[0].persontopic[i];
      await PersonTopic.deleteOnePersonTopic(personTopic.id).catch((err) => {
        res.status(500).send({ message: err.message });
        return;
      });
    }
  } else {
    res.status(200).send({
      message: "No person topics found for that person for that group!",
    });
  }
};

exports.deleteAll = async (req, res) => {
  await PersonTopic.deleteAllPersonTopics()
    .then((nums) => {
      res.send({ message: `${nums} person topics were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while removing all person topics.",
      });
    });
};
