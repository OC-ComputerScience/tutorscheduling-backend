module.exports = app => {
    const group = require("../controllers/group.controller.js");
    const { authenticate,isAdmin} = require("../authorization/authorization.js");
  
    var router = require("express").Router();
  
    // Create a new Group
    router.post("/", [authenticate,isSuperAdmin],group.create);
  
    // Retrieve all Groups
    router.get("/",group.findAll);

    // Retrieve Group by name
    router.get("/name/:name", [authenticate],group.findOneByName);

    // Retrieve all Groups for a person
    router.get("/person/:personId", [authenticate],group.findAllForPerson);

    // Retrieve all incomplete Groups for a person
    router.get("/personIn/:personId", [authenticate],group.findAllIncompleteForPerson);

    // Retrieve all Groups and topics for a person
    router.get("/personT/:personId", [authenticate],group.findAllTopicsForTutor);
  
    // Retrieve a single Group with id
    router.get("/:id", [authenticate],group.findOne);
  
    // Update a Group with id
    router.put("/:id", [authenticate,isSuperAdmin],group.update);
  
    // Delete a Group with id
    router.delete("/:id", [authenticate,isSuperAdmin],[authenticate],group.delete);
  
    // Delete all Group
    router.delete("/", [authenticate,isSuperAdmin],group.deleteAll);
  
    app.use('/group', router);
  };
  