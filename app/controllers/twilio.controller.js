const Twilio = require("../utils/twilio.js");

exports.send = async (req, res) => {
  await Twilio.sendText(req.body.message, req.body.phoneNum)
    .then((message) => {
      if (message.sid !== undefined) {
        console.log("Sent text " + message.sid);
        res.send({ message: "Sent Text " + message.sid });
      } else {
        console.log(message);
        res.send({ message: message });
      }
    })
    .catch((err) => {
      console.log("Error sending text message: " + err);
      res.status(500).send({
        message: "Error sending text message: " + err,
      });
    });
};

exports.respond = async (req, res) => {
  await Twilio.respondToStop(req.body.Body, req.body.From)
    .then((data) => {
      console.log("finished the response");
      res.type("text/xml").send(data);
    })
    .catch((err) => {
      console.log("Error responding to STOP message: " + err);
      res.status(500).send({
        message: "Error responding to STOP message: " + err,
      });
    });
};
