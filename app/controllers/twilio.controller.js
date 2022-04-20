require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN1 + process.env.TWILIO_AUTH_TOKEN2;
const phoneNum = process.env.TWILIO_NUMBER;
const client = require('twilio')(accountSid, authToken);

exports.findAll = (req, res) => {
    client.messages
      .create({
        body: req.body.message,
        from: phoneNum,
        to: req.body.phoneNum
      })
      .then(message => console.log(message.sid));
  
}