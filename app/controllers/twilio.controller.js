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

exports.sendApplicationMessage = async (req, res) => {
  await Twilio.sendApplicationMessage(req.body)
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
      console.log("Error sending application notification text: " + err);
      res.status(500).send({
        message: "Error sending application notification text: " + err,
      });
    });
};

exports.sendRequestMessage = async (req, res) => {
  await Twilio.sendRequestMessage(req.body)
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
      console.log("Error sending request notification text: " + err);
      res.status(500).send({
        message: "Error sending request notification text: " + err,
      });
    });
};

exports.sendPendingMessage = async (req, res) => {
  await Twilio.sendPendingMessage(req.body)
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
      console.log("Error sending pending appointment text: " + err);
      res.status(500).send({
        message: "Error sending pending appointment text: " + err,
      });
    });
};

exports.sendConfirmedMessage = async (req, res) => {
  await Twilio.sendConfirmedMessage(req.body)
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
      console.log("Error sending confirmed appointment text: " + err);
      res.status(500).send({
        message: "Error sending confirmed appointment text: " + err,
      });
    });
};

exports.sendMessageFromAdmin = async (req, res) => {
  await Twilio.sendMessageFromAdmin(req.body)
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
      console.log("Error sending notification text from admin: " + err);
      res.status(500).send({
        message: "Error sending notification text from admin: " + err,
      });
    });
};

exports.sendGroupMessage = async (req, res) => {
  await Twilio.sendGroupMessage(req.body)
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
      console.log("Error sending group appointment text: " + err);
      res.status(500).send({
        message: "Error sending group appointment text: " + err,
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
