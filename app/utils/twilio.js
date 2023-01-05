const Person = require("./person.js")
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken =
  process.env.TWILIO_AUTH_TOKEN1 + process.env.TWILIO_AUTH_TOKEN2;
const phoneNum = process.env.TWILIO_NUMBER;
const client = require("twilio")(accountSid, authToken);
const MessagingResponse = require("twilio/lib/twiml/MessagingResponse");

exports.sendText = async (message, phone) => {
  let prefix = "OC Tutor Scheduling:\n";
  let postfix = "\nReply STOP to unsubscribe.";
  let finalMessage = prefix + message + postfix;

  let person = await Person.findOnePersonByPhoneNumber(phone);

  if (person.textOptIn) {
    return await client.messages
    .create({
      body: finalMessage,
      to: phone,
      from: phoneNum,
    })
    .then((message) => {
      return message;
    })
    .catch((err) => {
      return err;
    });
  }
  else {
    return "Person has opted out of texts.";
  }
};

exports.respondToStop = async (body, from) => {
  console.log("twilio request")
  console.log(body)
  if (body === "STOP") {
    let phoneNum = from.substring(2);
    console.log(phoneNum)
    //we need to update person to opt out of texts
    let person = await Person.findOnePersonByPhoneNumber(phoneNum);
    person.textOptIn = false;
    console.log(person)
    await Person.updatePerson(person.dataValues, person.id);

    const twiml = new MessagingResponse();

    twiml.message(
      "You have successfully unsubscribed from OC Tutor Scheduling text notifications."
    );

    return twiml.toString();

    // res.type("text/xml").send(twiml.toString());
    // return;
  }
  else {
    return "No need to update person's text opt in.";
  }
};