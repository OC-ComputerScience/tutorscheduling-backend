module.exports = app => {
    const personappointment = require("../controllers/personappointment.controller.js");
  
    var router = require("express").Router();
  
    // Create a new PersonAppointment
    router.post("/", personappointment.create);
  
    // Retrieve all PersonAppointment
    router.get("/", personappointment.findAll);
  
    // Retrieve a single PersonAppointment with id
    router.get("/:id", personappointment.findOne);
  
    // Update a PersonAppointment with id
    router.put("/:id", personappointment.update);
  
    // Delete a PersonAppointment with id
    router.delete("/:id", personappointment.delete);
  
    // Delete all PersonAppointment
    router.delete("/", personappointment.deleteAll);
  
    app.use('/personappointment', router);
  };