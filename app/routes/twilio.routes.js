module.exports = (app) => {
  const twilio = require("../controllers/twilio.controller.js");
  const {
    authenticate,
    isAdmin,
  } = require("../authorization/authorization.js");

  var router = require("express").Router();

  // send a general message
  router.post("/sendMessage", [authenticate], twilio.send);

  // send an application message
  router.post(
    "/sendApplication",
    [authenticate],
    twilio.sendApplicationMessage
  );

  // send a request message
  router.post("/sendRequest", [authenticate], twilio.sendRequestMessage);

  // send a response to unsubscribing
  router.post("/respond", twilio.respond);

  app.use("/twilio", router);
};
