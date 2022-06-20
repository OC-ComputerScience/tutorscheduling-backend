module.exports = app => {
    const topic = require("../controllers/topic.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Topic
    router.post("/", topic.create);
  
    // Retrieve all Topic
    router.get("/", topic.findAll);

    // Retrieve topics for a specific group
    router.get("/group/:groupId", topic.findAllForGroup);

    // Retrieve topics for a specific person including persontopics
    router.get("/person/:personId", topic.findTopicForPerson);

    // Retrieve topics by group for a specific person including persontopics
    router.get("/group/:groupId/person/:personId", topic.findTopicByGroupForPerson);
  
    // Retrieve a single Topic with id
    router.get("/:id", topic.findOne);
  
    // Update a Topic with id
    router.put("/:id", topic.update);
  
    // Delete a Topic with id
    router.delete("/:id", topic.delete);
  
    // Delete all Topic
    router.delete("/", topic.deleteAll);
  
    app.use('/topic', router);
  };
  