module.exports = app => {
    const sms = require("../controllers/twilio.controller.js");
    //const auth = require("../controllers/util.controller.js");

    var router = require("express").Router();

    // Create a new Tutorial
    router.post("/sendMessage", sms.findAll);

    app.use('/twilio', router);
  }; 
