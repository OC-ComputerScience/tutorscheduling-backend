module.exports = (app) => {
  const role = require("../controllers/role.controller.js");
  const {
    authenticate,
    isAdmin,
    isSuperAdmin,
  } = require("../authorization/authorization.js");

  var router = require("express").Router();

  // Create a new Role
  router.post("/", [authenticate, isSuperAdmin], role.create);

  // Retrieve all Role
  router.get("/", [authenticate], role.findAll);

  // Retrieve roles for a specific group
  router.get("/group/:groupId", [authenticate], role.findAllForGroup);

  // Retrieve roles by group for a specific person including personroles
  router.get(
    "/group/:groupId/person/:personId",
    [authenticate],
    role.findRoleByGroupForPerson
  );

  // Retrieve roles by group for a specific type
  router.get(
    "/group/:groupId/type/:type",
    [authenticate],
    role.findRoleByGroupForType
  );

  // Retrieve roles for a specific person including personrole
  router.get("/person/:personId", [authenticate], role.findRoleForPerson);

  // Retrieve incomplete roles for a specific person including personrole
  router.get(
    "/personIn/:personId",
    [authenticate],
    role.findIncompleteRoleForPerson
  );

  // Retrieve a single Role with id
  router.get("/:id", [authenticate], role.findOne);

  // Update a Role with id
  router.put("/:id", [authenticate, isSuperAdmin], role.update);

  // Delete a Role with id
  router.delete("/:id", [authenticate, isSuperAdmin], role.delete);

  // Delete all Roles
  router.delete("/", [authenticate, isSuperAdmin], role.deleteAll);

  app.use("/role", router);
};
