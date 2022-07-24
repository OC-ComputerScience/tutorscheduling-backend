module.exports = app => {
    const sms = require("../controllers/twilio.controller.js");
    const { authenticate,isAdmin} = require("../authorization/authorization.js");

    var router = require("express").Router();

    // Create a new Tutorial
    router.post("/sendMessage", [authenticate],sms.send);

    app.use('/twilio', router);
  }; 

  