module.exports = app => {
    const request = require("../controllers/request.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Request
    router.post("/", request.create);
  
    // Retrieve all Request
    router.get("/", request.findAll);
  
    // Retrieve a single Request with id
    router.get("/:id", request.findOne);

    // Retrieve requests for a specific group
    router.get("/group/:groupId", request.findAllForGroup);
  
    // Update a Request with id
    router.put("/:id", request.update);
  
    // Delete a Request with id
    router.delete("/:id", request.delete);
  
    // Delete all Request
    router.delete("/", request.deleteAll);
  
    app.use('/request', router);
  };