module.exports = app => {
  const person = require("../controllers/person.controller.js");

  var router = require("express").Router();

  // Create a new Person
  router.post("/", person.create);

  // Retrieve all People
  router.get("/", person.findAll);

  // Retrieve first tutor for appointment
  router.get("/appointment/:appointmentId", person.findFirstTutorForAppointment);

  // Retrieve all People for group
  router.get("/group/:groupId", person.findAllForGroup);

   // Retrieve all pending tutors for group
   router.get("/tutor/:groupId", person.findPendingTutorsForGroup);

  // Retrieve all approved tutors for group
  router.get("/appTutor/:groupId", person.findApprovedTutorsForGroup);

  // Retrieve a single Person with id
  router.get("/:id", person.findOne);

  // Update a Person with id
  router.put("/:id", person.update);

  // Delete a Person with id
  router.delete("/:id", person.delete);

  // Delete all Person
  router.delete("/", person.deleteAll);

  app.use('/person', router);
};