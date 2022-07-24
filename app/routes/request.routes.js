module.exports = app => {
    const request = require("../controllers/request.controller.js");
    const { authenticate,isAdmin} = require("../authorization/authorization.js");
  
    var router = require("express").Router();
  
    // Create a new Request
    router.post("/", [authenticate],request.create);
  
    // Retrieve all Request
    router.get("/", [authenticate],request.findAll);
  
    // Retrieve a single Request with id
    router.get("/:id", [authenticate],request.findOne);

    // Retrieve requests for a specific group
    router.get("/group/:groupId", [authenticate],request.findAllForGroup);
  
    // Update a Request with id
    router.put("/:id", [authenticate],request.update);
  
    // Delete a Request with id
    router.delete("/:id", [authenticate],request.delete);
  
    // Delete all Request
    router.delete("/", [authenticate],request.deleteAll);
  
    app.use('/request', router);
  };
  