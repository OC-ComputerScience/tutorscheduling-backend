module.exports = (app) => {
  const group = require("../controllers/group.controller.js");
  const {
    authenticate,
    isAdmin,
  } = require("../authorization/authorization.js");

  var router = require("express").Router();

  // Create a new Group
  router.post("/", [authenticate, isSuperAdmin], group.create);

  // Retrieve all Groups
  router.get("/", group.findAll);

  // Retrieve all Groups for a person
  router.get("/person/:personId", [authenticate], group.findAllForPerson);

  // Retrieve all active Groups for a person
  router.get(
    "/active/person/:personId",
    [authenticate],
    group.findAllActiveForPerson
  );

  // Retrieve all incomplete Groups for a person
  router.get(
    "/personNeedContracts/:personId",
    [authenticate],
    group.findContractsNeededForPerson
  );

  // Retrieve all Groups and topics for a person
  router.get(
    "/personNeedTopics/:personId",
    [authenticate],
    group.findTopicsNeededForTutor
  );

  // Retrieve Group by name
  router.get("/name/:name", [authenticate], group.findOneByName);

  // Retrieve a single Group with id
  router.get("/:id", [authenticate], group.findOne);

  // Update a Group with id
  router.put("/:id", [authenticate, isAdmin], group.update);

  // Delete a Group with id
  router.delete(
    "/:id",
    [authenticate, isSuperAdmin],
    [authenticate],
    group.delete
  );

  // Delete all Group
  router.delete("/", [authenticate, isSuperAdmin], group.deleteAll);

  app.use("/group", router);
};
