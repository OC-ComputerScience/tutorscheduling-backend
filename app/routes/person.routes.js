module.exports = (app) => {
  const person = require("../controllers/person.controller.js");
  const {
    authenticate,
    isAdmin,
  } = require("../authorization/authorization.js");
  var router = require("express").Router();

  // Create a new Person
  router.post("/", [authenticate], person.create);

  // Retrieve all People
  router.get("/", [authenticate], person.findAll);

  // Retrieve all People for group
  router.get("/group/:groupId", [authenticate], person.findAllForGroup);

  // Retrieve all pending tutors for group
  router.get(
    "/tutor/:groupId",
    [authenticate],
    person.findPendingTutorsForGroup
  );

  // Retrieve all approved tutors for group
  router.get(
    "/appTutor/:groupId",
    [authenticate],
    person.findApprovedTutorsForGroup
  );

  // Retrieve all appointment hour count
  router.get(
    "/group/:groupId/hours/week/:currWeek",
    person.getAppointmentHourCount
  );

  // Retrieve first tutor for appointment
  router.get(
    "/appointment/:appointmentId",
    [authenticate],
    person.findFirstTutorForAppointment
  );

  // retrieve person for email
  router.get("/email/:email", [authenticate], person.findByEmail);

  // retrieve person for phoneNum
  router.get("/phoneNum/:phoneNum", [authenticate], person.findByPhoneNumber);

  // Retrieve a single Person with id
  router.get("/:id", [authenticate], person.findOne);

  // Update a Person with id
  router.put("/:id", [authenticate], person.update);

  // Delete a Person with id
  router.delete("/:id", [authenticate], person.delete);

  // Delete all Person
  router.delete("/", [authenticate], person.deleteAll);

  app.use("/person", router);
};
