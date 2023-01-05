const MessagingResponse = require("twilio/lib/twiml/MessagingResponse");
const db = require("../models");
const Op = db.Sequelize.Op;
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
  let prefix = "OC Tutor Scheduling:\n";
  let postfix = "\nReply STOP to unsubscribe.";
  let message = prefix + req.body.message + postfix;

  await getPersonByPhoneNum(req.body.phoneNum);

  console.log(person)
  console.log(message)

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
  else {
    res.status(200).send({
      message: "Person has opted out of texts.",
    });
  }
};

exports.respond = async (req, res) => {
  console.log("twilio request")
  console.log(req.body)
  if (req.body.Body === "STOP") {
    let phoneNum = req.body.From.substring(2);
    //we need to update person to opt out of texts
    await getPersonByPhoneNum(phoneNum);
    person.textOptIn = false;
    console.log(person)
    await Person.update(person.dataValues, {
      where: { id: person.id },
    }).catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Error updating person's text opt in",
      });
    });

    const twiml = new MessagingResponse();

    twiml.message(
      "You have successfully unsubscribed from OC Tutor Scheduling text notifications."
    );

    res.type("text/xml").send(twiml.toString());
    
  }
  else {
    res.status(200).send({
      message: "No need to update person's text opt in",
    });
  }
}