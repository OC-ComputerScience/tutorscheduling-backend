module.exports = app => {
    const availability = require("../controllers/availability.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Availability
    router.post("/", availability.create);
  
    // Retrieve all Availability
    router.get("/", availability.findAll);
  
    // Retrieve availabilities for a specific person
    router.get("/person/:personId", availability.findAllForPerson);

    // Retrieve a single Availability with id
    router.get("/:id", availability.findOne);
  
    // Update a Availability with id
    router.put("/:id", availability.update);
  
    // Delete a Availability with id
    router.delete("/:id", availability.delete);
  
    // Delete all Availability
    router.delete("/", availability.deleteAll);
  
    app.use('/availability', router);
  };
  