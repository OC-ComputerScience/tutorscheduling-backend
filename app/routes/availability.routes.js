module.exports = (app) => {
  const availability = require("../controllers/availability.controller.js");
  const {
    authenticate,
    isAdmin,
  } = require("../authorization/authorization.js");

  var router = require("express").Router();

  // Create a new Availability
  router.post("/", [authenticate], availability.create);

  // Retrieve all Availability
  router.get("/", [authenticate], availability.findAll);

  // Retrieve availabilities for a specific person
  router.get(
    "/person/:personId",
    [authenticate],
    availability.findAllForPerson
  );

  // Retrieve upcoming availabilities for a specific person
  router.get(
    "/upcoming/person/:personId",
    [authenticate],
    availability.findAllUpcomingForPerson
  );

  // Retrieve a single Availability with id
  router.get("/:id", [authenticate], availability.findOne);

  // Update a Availability with id
  router.put("/:id", [authenticate], availability.update);

  // Delete a Availability with id
  router.delete("/:id", [authenticate], availability.delete);

  // Delete all Availability
  router.delete("/", [authenticate], availability.deleteAll);

  app.use("/availability", router);
};
