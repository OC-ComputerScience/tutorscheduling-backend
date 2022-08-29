module.exports = app => {
    const personrole = require("../controllers/personrole.controller.js");
    const { authenticate,isAdmin} = require("../authorization/authorization.js");
  
    var router = require("express").Router();
  
    // Create a new PersonRole
    router.post("/", [authenticate],personrole.create);
  
    // Retrieve all PersonRole
    router.get("/", [authenticate],personrole.findAll);
  
    // Retrieve a group and role based on a PersonRole
    router.get("/group/:id", [authenticate],personrole.findGroupByPersonRole);

    // Retrieve a single PersonRole with id
    router.get("/:id", [authenticate],personrole.findOne);

    // Retrieve a single PersonRole with role and person
    router.get("/person/:personId/role/:roleId",[authenticate], personrole.findOneForType);

    // Retrieve personroles for a specific person
    router.get("/person/:personId", [authenticate],personrole.findAllForPerson);
  
    // Update a PersonRole with id
    router.put("/:id", [authenticate],personrole.update);
  
    // Delete a PersonRole with id
    router.delete("/:id", [authenticate],personrole.delete);
  
    // Delete all PersonRole
    router.delete("/", [authenticate],personrole.deleteAll);
  
    app.use('/personrole', router);
  };
  