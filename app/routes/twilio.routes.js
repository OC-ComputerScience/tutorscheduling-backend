module.exports = (app) => {
  const twilio = require("../controllers/twilio.controller.js");
  const {
    authenticate,
    isAdmin,
  } = require("../authorization/authorization.js");

  var router = require("express").Router();

  // Create a new text
  router.post("/sendMessage", [authenticate], twilio.send);

  // send a response to unsubscribing
  router.post("/respond", twilio.respond);

  app.use("/twilio", router);
};
