const Twilio = require("../utils/twilio.js");

exports.send = async (req, res) => {
  await Twilio.sendText(req.body.message, req.body.phoneNum)
    .then((message) => {
      console.log("sent " + message.sid);
      res.send({ message: "sent " + message.sid });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message:
          "Error sending text message."
      });
    });
};

exports.respond = async (req, res) => {
  await Twilio.respondToStop(req.body.Body, req.body.From)
  .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while responding to a STOP message.",
      });
    });
}