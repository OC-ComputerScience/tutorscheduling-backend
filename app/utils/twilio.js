const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken =
  process.env.TWILIO_AUTH_TOKEN1 + process.env.TWILIO_AUTH_TOKEN2;
const phoneNum = process.env.TWILIO_NUMBER;
const client = require("twilio")(accountSid, authToken);

exports.sendText = async (message, phone) => {
  return await client.messages
    .create({
      body: message,
      to: phone,
      from: phoneNum,
    })
    .then((message) => {
      return message;
    })
    .catch((err) => {
      return err;
    });
};
