module.exports = app => {
    const topic = require("../controllers/topic.controller.js");
    const { authenticate,isAdmin} = require("../authorization/authorization.js");

  
    var router = require("express").Router();
  
    // Create a new Topic
    router.post("/",[authenticate,isAdmin], topic.create);
  
    // Retrieve all Topic
    router.get("/", [authenticate],topic.findAll);

    // Retrieve topics for a specific group
    router.get("/group/:groupId",[authenticate], topic.findAllForGroup);

    // Retrieve topics for a specific person including persontopics
    router.get("/person/:personId", [authenticate],topic.findTopicForPerson);

    // Retrieve topics by group for a specific person including persontopics
    router.get("/group/:groupId/person/:personId",[authenticate], topic.findTopicByGroupForPerson);
  
    // Retrieve all appointment hour count
    router.get("/group/:groupId/hours/week/:currWeek", topic.getAppointmentHourCount);

    // Retrieve a single Topic with id
    router.get("/:id",[authenticate], topic.findOne);
  
    // Update a Topic with id
    router.put("/:id", [authenticate,isAdmin],topic.update);
  
    // Delete a Topic with id
    router.delete("/:id",[authenticate,isAdmin], topic.delete);
  
    // Delete all Topic
    router.delete("/", [authenticate,isAdmin],topic.deleteAll);
  
    app.use('/topic', router);
  };
  