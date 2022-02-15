module.exports = app => {
  const person = require("../controllers/person.controller.js");

  var router = require("express").Router();

  // Create a new Person
  router.post("/", person.create);

  // Retrieve all People
  router.get("/", person.findAll);

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