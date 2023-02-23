module.exports = (app) => {
  const location = require("../controllers/location.controller.js");
  const {
    authenticate,
    isAdmin,
  } = require("../authorization/authorization.js");

  var router = require("express").Router();

  // Create a new Location
  router.post("/", [authenticate, isAdmin], location.create);

  // Retrieve all Location
  router.get("/", [authenticate], location.findAll);

  // Retrieve locations for a specific group
  router.get("/group/:groupId", [authenticate], location.findAllForGroup);

  // Retrieve locations for a specific group
  router.get(
    "/active/group/:groupId",
    [authenticate],
    location.findActiveForGroup
  );

  // Retrieve a single Location with id
  router.get("/:id", [authenticate], location.findOne);

  // Update a Location with id
  router.put("/:id", [authenticate, isAdmin], location.update);

  // Delete a Location with id
  router.delete("/:id", [authenticate, isAdmin], location.delete);

  // Delete all Location
  router.delete("/", [authenticate, isAdmin], location.deleteAll);

  app.use("/location", router);
};
