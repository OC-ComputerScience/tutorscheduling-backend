module.exports = app => {
    const group = require("../controllers/group.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Group
    router.post("/", group.create);
  
    // Retrieve all Groups
    router.get("/", group.findAll);

    // Retrieve all Groups for a person
    router.get("/person/:personId", group.findAllForPerson);

    // Retrieve all incomplete Groups for a person
    router.get("/personIn/:personId", group.findAllIncompleteForPerson);
  
    // Retrieve a single Group with id
    router.get("/:id", group.findOne);
  
    // Update a Group with id
    router.put("/:id", group.update);
  
    // Delete a Group with id
    router.delete("/:id", group.delete);
  
    // Delete all Group
    router.delete("/", group.deleteAll);
  
    app.use('/group', router);
  };