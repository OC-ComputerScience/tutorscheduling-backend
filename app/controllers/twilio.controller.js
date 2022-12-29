const Twilio = require("../utils/twilio.js");

exports.send = async (req, res) => {
  await Twilio.sendText(req.body.message, req.body.phoneNum)
    .then((message) => {
      console.log("sent" + message.sid);
    })
    .catch((err) => {
      console.log("Could not send messsage" + err);
      res.status(500).send({
        message: err.message || "Could not send messsage: " + err,
      });
    });
};
