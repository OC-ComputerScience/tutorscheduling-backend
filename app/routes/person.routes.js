module.exports = app => {
  const person = require("../controllers/person.controller.js");
  const { authenticate,isAdmin} = require("../authorization/authorization.js");
  var router = require("express").Router();

  // Create a new Person
  router.post("/", [authenticate],person.create);

  // Retrieve all People
  router.get("/", [authenticate],person.findAll);

  // Retrieve first tutor for appointment
  router.get("/appointment/:appointmentId", [authenticate],person.findFirstTutorForAppointment);

  // Retrieve all People for group
  router.get("/group/:groupId", [authenticate],person.findAllForGroup);

  // retrieve person for email
  router.get("/email/:email", [authenticate],person.findByEmail);

  // Retrieve all pending tutors for group
  router.get("/tutor/:groupId", [authenticate],person.findPendingTutorsForGroup);

  // Retrieve all approved tutors for group
  router.get("/appTutor/:groupId", [authenticate],person.findApprovedTutorsForGroup);

  // Retrieve a single Person with id
  router.get("/:id", [authenticate],person.findOne);

  // Update a Person with id
  router.put("/:id", [authenticate],person.update);

  // Delete a Person with id
  router.delete("/:id", [authenticate],person.delete);

  // Delete all Person
  router.delete("/",[authenticate], person.deleteAll);

  app.use('/person', router);
};
