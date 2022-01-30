module.exports = app => {
    const session = require("../controllers/session.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Session
    router.post("/", session.create);
  
    // Retrieve all Session
    router.get("/", session.findAll);
  
    // Retrieve a single Session with id
    router.get("/:id", session.findOne);
  
    // Update a Session with id
    router.put("/:id", session.update);
  
    // Delete a Session with id
    router.delete("/:id", session.delete);
  
    // Delete all Session
    router.delete("/", session.deleteAll);
  
    app.use('/api/session', router);
  };