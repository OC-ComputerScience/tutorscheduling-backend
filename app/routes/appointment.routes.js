module.exports = app => {
    const appointment = require("../controllers/appointment.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Appointment
    router.post("/", appointment.create);
  
    // Retrieve all Appointment
    router.get("/", appointment.findAll);

    // Retrieve all Appointment
    router.get("/person/:personId", appointment.findAllForPerson);

    // Retrieve all Appointment
    router.get("/group/:groupId", appointment.findAllForGroup);

    // Retrieve all Appointment
    router.get("/group/:groupId/person/:personId", appointment.findAllForPersonForGroup);
  
    // Retrieve a single Appointment with id
    router.get("/:id", appointment.findOne);
  
    // Update a Appointment with id
    router.put("/:id", appointment.update);
  
    // Delete a Appointment with id
    router.delete("/:id", appointment.delete);
  
    // Delete all Appointment
    router.delete("/", appointment.deleteAll);
  
    app.use('/appointment', router);
  };