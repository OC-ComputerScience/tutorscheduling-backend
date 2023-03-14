module.exports = (app) => {
  const appointment = require("../controllers/appointment.controller.js");
  const {
    authenticate,
    isAdmin,
  } = require("../authorization/authorization.js");

  var router = require("express").Router();

  // Create a new Appointment
  router.post("/", [authenticate], appointment.create);

  // Retrieve all Appointment
  router.get("/", [authenticate], appointment.findAll);

  // Retrieve all Appointment for reporting (literally all)
  router.get("/group/:groupId", [authenticate], appointment.findAllForGroup);

  // Retrieve all Appointment for calendar (one month behind)
  router.get("/allGroup/:groupId", [authenticate], appointment.findAllForGroup);

  // Retrieve all upcoming Appointment
  router.get(
    "/upGroup/:groupId",
    [authenticate],
    appointment.findAllUpcomingForGroup
  );

  // Retrieve all Appointment
  router.get("/person/:personId", [authenticate], appointment.findAllForPerson);

  // Retrieve all upcoming Appointments for a person
  router.get(
    "/upcoming/person/:personId",
    [authenticate],
    appointment.findAllUpcomingForPerson
  );

  // Retrieve all upcoming Appointment
  router.get(
    "/upcoming/tutor/:groupId/person/:personId",
    [authenticate],
    appointment.findAllUpcomingForTutor
  );

  // Retrieve all upcoming Appointment
  router.get(
    "/upcoming/student/:groupId/person/:personId",
    [authenticate],
    appointment.findAllUpcomingForStudent
  );

  // Retrieve all upcoming Appointment
  router.get(
    "/passed/tutor/:groupId/person/:personId",
    [authenticate],
    appointment.findAllPassedForTutor
  );

  // Retrieve all upcoming Appointment
  router.get(
    "/passed/student/:groupId/person/:personId",
    [authenticate],
    appointment.findAllPassedForStudent
  );

  // Retrieve all Appointment
  router.get(
    "/group/:groupId/person/:personId",
    [authenticate],
    appointment.findAllForPersonForGroup
  );

  // Retrieve appointment for feedback
  router.get(
    "/feedback/:appointmentId",
    [authenticate],
    appointment.findFeedbackApptForPerson
  );

  // Retrieve all appointment hour count
  router.get(
    "/group/:groupId/hours/week/:currWeek",
    [authenticate],
    appointment.getAppointmentHourCount
  );

  router.get("/text/:id", [authenticate], appointment.findOneForText);

  // Retrieve a single Appointment with id
  router.get("/:id", [authenticate], appointment.findOne);

  // cancel an appointment
  router.post("/cancel/:id", [authenticate], appointment.cancel);

  // Update a Appointment with id
  router.put("/:id", [authenticate], appointment.update);

  // Delete a Appointment with id
  router.delete("/:id", [authenticate], appointment.delete);

  // Delete all Appointment
  router.delete("/", [authenticate], appointment.deleteAll);

  app.use("/appointment", router);
};
