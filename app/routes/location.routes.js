module.exports = app => {
    const location = require("../controllers/location.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Location
    router.post("/", location.create);
  
    // Retrieve all Location
    router.get("/", location.findAll);
  
    // Retrieve a single Location with id
    router.get("/:id", location.findOne);

    // Retrieve locations for a specific group
    router.get("/group/:groupId", location.findAllForGroup);
  
    // Update a Location with id
    router.put("/:id", location.update);
  
    // Delete a Location with id
    router.delete("/:id", location.delete);
  
    // Delete all Location
    router.delete("/", location.deleteAll);
  
    app.use('/location', router);
  };