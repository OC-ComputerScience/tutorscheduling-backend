module.exports = app => {
    const personrole = require("../controllers/personrole.controller.js");
  
    var router = require("express").Router();
  
    // Create a new PersonRole
    router.post("/", personrole.create);
  
    // Retrieve all PersonRole
    router.get("/", personrole.findAll);
  
    // Retrieve a single PersonRole with id
    router.get("/:id", personrole.findOne);

    // Retrieve a single PersonRole with role and person
    router.get("/person/:personId/role/:roleId", personrole.findOneForType);

    // Retrieve personroles for a specific person
    router.get("/person/:personId", personrole.findAllForPerson);
  
    // Update a PersonRole with id
    router.put("/:id", personrole.update);
  
    // Delete a PersonRole with id
    router.delete("/:id", personrole.delete);
  
    // Delete all PersonRole
    router.delete("/", personrole.deleteAll);
  
    app.use('/personrole', router);
  };
  