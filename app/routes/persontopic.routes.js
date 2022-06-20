module.exports = app => {
    const persontopic = require("../controllers/persontopic.controller.js");
  
    var router = require("express").Router();
  
    // Create a new PersonTopic
    router.post("/", persontopic.create);
  
    // Retrieve all PersonTopic
    router.get("/", persontopic.findAll);
  
    // Retrieve a single PersonTopic with id
    router.get("/:id", persontopic.findOne);
  
    // Retrieve personroles for a specific person
    router.get("/person/:personId", persontopic.findAllForPerson);

    // Retrieve all topics for tutor from a certain group
    router.get("/group/:groupId/person/:personId", persontopic.getTopicForPersonGroup);

    // Update a PersonTopic with id
    router.put("/:id", persontopic.update);
  
    // Delete a PersonTopic with id
    router.delete("/:id", persontopic.delete);
  
    // Delete all PersonTopic
    router.delete("/", persontopic.deleteAll);
  
    app.use('/persontopic', router);
  };
  