module.exports = app => {
    const personroleprivilege = require("../controllers/personroleprivilege.controller.js");
    const { authenticate,isAdmin} = require("../authorization/authorization.js");
  
    var router = require("express").Router();
  
    // Create a new personrole privilege
    router.post("/", [authenticate],personroleprivilege.create);
  
    // Retrieve all personrole privilege
    router.get("/", [authenticate],personroleprivilege.findAll);
  
    // Retrieve a single personrole privilege with id
    router.get("/:id", [authenticate],personroleprivilege.findOne);

    // Update a personrole privilege with id
    router.put("/:id", [authenticate],personroleprivilege.update);
  
    // Delete a personrole privilege with id
    router.delete("/:id", [authenticate],personroleprivilege.delete);
  
    // Delete all personrole privilege
    router.delete("/", [authenticate],personroleprivilege.deleteAll);
  
    app.use('/personroleprivilege', router);
  };
  