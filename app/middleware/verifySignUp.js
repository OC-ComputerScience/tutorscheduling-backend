const db = require("../models");
// const ROLES = db.ROLES;
const Person = db.person;

checkDuplicateEmail = (req, res, next) => {
  // Email
    Person.findOne({
      where: {
        email: req.body.email
      }
    }).then(person => {
      if (person) {
        res.status(400).send({
          message: "Failed! Email is already in use!"
        });
        return;
      }

      next();
    });
};

const verifySignUp = {
    checkDuplicateEmail: checkDuplicateEmail,
};
  
module.exports = verifySignUp;