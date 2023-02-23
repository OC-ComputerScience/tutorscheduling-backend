module.exports = (app) => {
  const persontopic = require("../controllers/persontopic.controller.js");
  const {
    authenticate,
    isAdmin,
  } = require("../authorization/authorization.js");

  var router = require("express").Router();

  // Create a new PersonTopic
  router.post("/", [authenticate], persontopic.create);

  // Retrieve all PersonTopic
  router.get("/", [authenticate], persontopic.findAll);

  // Retrieve personroles for a specific person
  router.get("/person/:personId", [authenticate], persontopic.findAllForPerson);

  // Retrieve all topics for tutor from a certain group
  router.get(
    "/group/:groupId/person/:personId",
    [authenticate],
    persontopic.getTopicForPersonGroup
  );

  // Retrieve a single PersonTopic with id
  router.get("/:id", [authenticate], persontopic.findOne);

  // Update a PersonTopic with id
  router.put("/:id", [authenticate], persontopic.update);

  // Delete a PersonTopic with topic id
  router.delete(
    "/topic/:topicId",
    [authenticate],
    persontopic.deleteWithTopicId
  );

  // Delete a PersonTopic with id
  router.delete("/:id", [authenticate], persontopic.delete);

  // Delete all PersonTopic for person
  router.delete(
    "/person/:personId/group/:groupId",
    [authenticate],
    persontopic.deleteAllForPersonForGroup
  );

  // Delete all PersonTopic
  router.delete("/", [authenticate], persontopic.deleteAll);

  app.use("/persontopic", router);
};
