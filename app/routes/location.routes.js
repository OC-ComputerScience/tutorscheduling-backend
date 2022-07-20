module.exports = app => {
    const location = require("../controllers/location.controller.js");
    const { authenticate,isAdmin} = require("../authorization/authorization.js");
  
    var router = require("express").Router();
  
    // Create a new Location
    router.post("/", [authenticate],[authenticate],location.create);
  
    // Retrieve all Location
    router.get("/", [authenticate],location.findAll);
  
    // Retrieve a single Location with id
    router.get("/:id", [authenticate],location.findOne);

    // Retrieve locations for a specific group
    router.get("/group/:groupId", [authenticate],location.findAllForGroup);
  
    // Update a Location with id
    router.put("/:id", [authenticate],location.update);
  
    // Delete a Location with id
    router.delete("/:id", [authenticate],location.delete);
  
    // Delete all Location
    router.delete("/", [authenticate],location.deleteAll);
  
    app.use('/location', router);
  };
  