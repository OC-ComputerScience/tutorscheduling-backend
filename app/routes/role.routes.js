module.exports = app => {
    const role = require("../controllers/role.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Role
    router.post("/", role.create);
  
    // Retrieve all Role
    router.get("/", role.findAll);
  
    // Retrieve a single Role with id
    router.get("/:id", role.findOne);

    // Retrieve students for a specific advisor
    router.get("/group/:groupId", role.findAllForGroup);
  
    // Update a Role with id
    router.put("/:id", role.update);
  
    // Delete a Role with id
    router.delete("/:id", role.delete);
  
    // Delete all Roles
    router.delete("/", role.deleteAll);
  
    app.use('/role', router);
  };