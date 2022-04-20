const db = require("../models");
const Topic = db.topic;
const PersonTopic = db.persontopic;
const Op = db.Sequelize.Op;

// Create and Save a new Topic
exports.create = (req, res) => {
    // Validate request
    if (!req.body.name) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
      return;
    }
  
    // Create a Topic
    const topic = {
      id: req.body.id,
      groupId: req.body.groupId,
      name: req.body.name,
      abbr: req.body.abbr
    };
  
    // Save Topic in the database
    Topic.create(topic)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Topic."
        });
      });
  };

// Retrieve all Topic from the database.
exports.findAll = (req, res) => {
    const id = req.query.id;
    var condition = id ? { id: { [Op.like]: `%${id}%` } } : null;
  
    Topic.findAll({ where: condition })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Topic."
        });
      });
  };

// Retrieve all Topics for a group from the database.
exports.findAllForGroup = (req, res) => {
  const id = req.params.groupId;

  Topic.findAll({ where: {groupId: id} })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving topics for group."
      });
    });
};

// Retrieve topics per group for persontopics for a specific person
exports.findTopicByGroupForPerson = (req, res) => {
  const personId = req.params.personId;
  const groupId = req.params.groupId;

  Topic.findAll({
    where: { '$persontopic.personId$': personId, groupId: groupId },
    include: [ {
        model: PersonTopic, 
        as: 'persontopic',
        right: true
    } ]
  })
  .then((data) => {
      res.send(data);
  })
  .catch(err => {
      res.status(500).send({ message: err.message });
  });

}

// Retrieve a topic for a persontopic for a specific person
exports.findTopicForPerson = (req, res) => {
  const id = req.params.personId;

  Topic.findAll({
    where: { '$persontopic.personId$': id },
    include: [ {
        model: PersonTopic, 
        as: 'persontopic',
        right: true
    } ]
  })
  .then((data) => {
      res.send(data);
  })
  .catch(err => {
      res.status(500).send({ message: err.message });
  });

}

// Find a single Topic with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
  
    Topic.findByPk(id)
      .then(data => {
        if (data) {
          res.send(data);
        } else {
          res.status(404).send({
            message: `Cannot find Topic with id=${id}.`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error retrieving Topic with id=" + id
        });
      });
  };

// Update a Topic by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;
  
    Topic.update(req.body, {
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Topic was updated successfully."
          });
        } else {
          res.send({
            message: `Cannot update Topic with id=${id}. Maybe Topic was not found or req.body is empty!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error updating Topic with id=" + id
        });
      });
  };

// Delete a Topic with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;
  
    Topic.destroy({
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Topic was deleted successfully!"
          });
        } else {
          res.send({
            message: `Cannot delete Topic with id=${id}. Maybe Topic was not found!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete Topic with id=" + id
        });
      });
  };

// Delete all Topic from the database.
exports.deleteAll = (req, res) => {
    Topic.destroy({
      where: {},
      truncate: false
    })
      .then(nums => {
        res.send({ message: `${nums} Topic were deleted successfully!` });
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while removing all Topic."
        });
      });
  };