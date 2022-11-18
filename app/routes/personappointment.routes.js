module.exports = (app) => {
  const personappointment = require("../controllers/personappointment.controller.js");
  const {
    authenticate,
    isAdmin,
  } = require("../authorization/authorization.js");

  var router = require("express").Router();

  // Create a new PersonAppointment
  router.post("/", [authenticate], personappointment.create);

  // Retrieve all PersonAppointment
  router.get("/", [authenticate], personappointment.findAll);

  // Retrieve a single PersonAppointment with appointment and person
  router.get(
    "/person/:personId/appointment/:appointmentId",
    [authenticate],
    personappointment.findPersonAppointmentByPersonAndAppointment
  );

  // Retrieve personappointments for a specific person
  router.get(
    "/person/:personId",
    [authenticate],
    personappointment.findAllForPerson
  );

  // Retrieve a single PersonAppointment with id
  router.get("/:id", [authenticate], personappointment.findOne);

  // Retrieve personappointments for a specific person
  router.get(
    "/person/:personId",
    [authenticate],
    personappointment.findAllForPerson
  );

  // Retrieve personappointments for a specific person
  router.get(
    "/appointment/:appointmentId",
    [authenticate],
    personappointment.findStudentDataForTable
  );

  // Retrieve personappointments for a specific person
  router.get(
    "/appointmentTutor/:appointmentId",
    [authenticate],
    personappointment.findTutorDataForTable
  );

  // Update a PersonAppointment with id
  router.put("/:id", [authenticate], personappointment.update);

  // Delete a PersonAppointment with id
  router.delete("/:id", [authenticate], personappointment.delete);

  // Delete all PersonAppointment
  router.delete("/", [authenticate], personappointment.deleteAll);

  app.use("/personappointment", router);
};
