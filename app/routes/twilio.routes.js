module.exports = (app) => {
  const sms = require("../controllers/twilio.controller.js");
  const {
    authenticate,
    isAdmin,
  } = require("../authorization/authorization.js");

  var router = require("express").Router();

  // Create a new text
  router.post("/sendMessage", [authenticate], sms.send);

  // send a response to unsubscribing
  router.post("/respond", [authenticate], sms.respond);

  app.use("/twilio", router);
};
