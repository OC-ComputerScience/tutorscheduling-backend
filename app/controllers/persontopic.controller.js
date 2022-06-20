const { persontopic } = require("../models");
const db = require("../models");
const PersonTopic = db.persontopic;
const Topic = db.topic;
const Op = db.Sequelize.Op;

// Create and Save a new PersonTopic
exports.create = (req, res) => {
    // Validate request
    if (!req.body.skillLevel) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
      return;
    }
  
    // Create a PersonTopic
    const persontopic = {
      id: req.body.id,
      personId: req.body.personId,
      topicId: req.body.topicId,
      skillLevel: req.body.skillLevel
    };
  
    // Save PersonTopic in the database
    PersonTopic.create(persontopic)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the PersonTopic."
        });
      });
  };

// Retrieve all PersonTopic from the database.
exports.findAll = (req, res) => {
    const id = req.query.id;
    var condition = id ? { id: { [Op.like]: `%${id}%` } } : null;
  
    PersonTopic.findAll({ where: condition })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving PersonTopic."
        });
      });
  };

  // Retrieve all Person Topics for a person from the database.
exports.findAllForPerson = (req, res) => {
  const id = req.params.personId;

  PersonTopic.findAll({ where: {personId: id} })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving persontopics for person."
      });
    });
};

  // Retrieve all Person Topics for a person from the database.
  exports.getTopicForPersonGroup = (req, res) => {
    const personId = req.params.personId;
    const groupId = req.params.groupId;
  
    Topic.findAll({
       include: [ 
        {
        model: persontopic, 
        as: 'persontopic',
        required: true,
        where: {personId: personId},
          include: [ {
            model: Topic, 
            as: 'topic',
            required: true,
            where: { groupId: groupId}
          }]
        }]
      })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving topics for person."
        });
      });
  };

// Find a single PersonTopic with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
  
    PersonTopic.findByPk(id)
      .then(data => {
        if (data) {
          res.send(data);
        } else {
          res.status(404).send({
            message: `Cannot find PersonTopic with id=${id}.`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error retrieving PersonTopic with id=" + id
        });
      });
  };

// Update a PersonTopic by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;
  
    PersonTopic.update(req.body, {
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "PersonTopic was updated successfully."
          });
        } else {
          res.send({
            message: `Cannot update PersonTopic with id=${id}. Maybe PersonTopic was not found or req.body is empty!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error updating PersonTopic with id=" + id
        });
      });
  };

// Delete a PersonTopic with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;
  
    PersonTopic.destroy({
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "PersonTopic was deleted successfully!"
          });
        } else {
          res.send({
            message: `Cannot delete PersonTopic with id=${id}. Maybe PersonTopic was not found!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete PersonTopic with id=" + id
        });
      });
  };

// Delete all PersonTopic from the database.
exports.deleteAll = (req, res) => {
    PersonTopic.destroy({
      where: {},
      truncate: false
    })
      .then(nums => {
        res.send({ message: `${nums} PersonTopic were deleted successfully!` });
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while removing all PersonTopic."
        });
      });
  };
  