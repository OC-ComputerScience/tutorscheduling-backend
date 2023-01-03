const db = require("../models");
const Person = db.person;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken =
  process.env.TWILIO_AUTH_TOKEN1 + process.env.TWILIO_AUTH_TOKEN2;
const phoneNum = process.env.TWILIO_NUMBER;
const client = require("twilio")(accountSid, authToken);

let person = {};

getPersonByPhoneNum = async (phoneNumber) => {
  await Person.findOne({
    where: {
      phoneNum: phoneNumber,
    },
  })
    .then((data) => {
      person = data;
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message:
          "Error retrieving Person with phone number =" + req.body.phoneNum,
      });
    });
};

exports.send = async (req, res) => {
  let prefix = "OC Tutor Scheduling: ";
  let postfix = "\nReply STOP to unsubscribe.";
  let message = prefix + req.body.message + postfix;
  let person = {};

  await getPersonByPhoneNum(req.body.phoneNum);

  if (person.textOptIn) {
    client.messages
      .create({
        body: message,
        from: phoneNum,
        to: req.body.phoneNum,
      })
      .then((message) => {
        console.log("sent " + message.sid);
        res.send({ message: "sent " + message.sid });
      })
      .catch((err) => {
        console.log("Could not send message" + err);
        res.status(500).send({
          message: err.message || "Could not send message: " + err,
        });
      });
  }
};

exports.respond = async (req, res) => {
  if (req.OptOutType === "STOP") {
    //we need to update person to opt out of texts
    await getPersonByPhoneNum(req.From);
    person.textOptIn = false;
    await Person.updatePerson(person, person.id).catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Error updating person's text opt in",
      });
    });
  }

  const twiml = new MessagingResponse();

  twiml.message(
    "You have successfully unsubscribed from OC Tutor Scheduling text notifications."
  );

  res.type("text/xml").send(twiml.toString());
};
