const db = require("../models");
const config = require("../config/auth.config");
const Person = db.person;
const Session = db.session;
const Role = db.role;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");

exports.signup = (req, res) => {
    const {OAuth2Client} = require('google-auth-library');
    const client = new OAuth2Client('705829709643-vkhieqifai726sk7elkk7ucg8q3a7ebb.apps.googleusercontent.com');
    const ticket = await client.verifyIdToken({
        idToken: req.body.accessToken,
        audience: '705829709643-vkhieqifai726sk7elkk7ucg8q3a7ebb.apps.googleusercontent.com'
    });
    const payload= ticket.getPayload();
    console.log('Google payload is '+JSON.stringify(payload));
    let email = payload['email'];
    let fName = payload['given_name'];
    let lName = payload['family_name'];
    let token = null;

    Person.findByEmail({
        where: {
          email: email
        }
    })
    .then(person => {
        if (!person) {
            // create a new Person and save to database
            Person.create({
                fName: fName,
                lName: lName,
                email: email,
                phoneNum: req.body.phoneNum
            })
            .then(data => {
                res.send({ message: "Person was registered successfully!" });
            })
            .catch(err => {
                res.status(500).send({ message: err.message });
            });

            // create userInfo to send back to frontend
            const userInfo = {
                token : token,
                email : email,
                fName : fName,
                lName : lName,
                role : null,
                userID : null
            }

            // create a new Session with a token and save to database
            token = jwt.sign({ id:email }, authconfig.secret, {expiresIn: 86400});
            let findExpirationDate = new Date();
            findExpirationDate.setDate(findExpirationDate.getDate() + 1);
            Session.create({
                token : token,
                email: email,
                expirationDate : findExpirationDate
            })
            .then(data => {
                res.send(userInfo);
            })
            .catch(err => {
                res.status(500).send({ message: err.message });
            });
        }
        return res.send({ message: "Person already has an account!" });
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
    const {OAuth2Client} = require('google-auth-library');
    const client = new OAuth2Client('705829709643-vkhieqifai726sk7elkk7ucg8q3a7ebb.apps.googleusercontent.com');
    const ticket = await client.verifyIdToken({
        idToken: req.body.accessToken,
        audience: '705829709643-vkhieqifai726sk7elkk7ucg8q3a7ebb.apps.googleusercontent.com'
    });
    const payload= ticket.getPayload();
    console.log('Google payload is '+JSON.stringify(payload));
    let email = payload['email'];
    let fName = payload['given_name'];
    let lName = payload['family_name'];
    let token = null;

    Person.findByEmail({
        where: {
          email: email
        }
    })
    .then(person => {
        if (!person) {
            return res.status(404).send({ message: "Person needs to make an account!" });
        }
        let user = person;

        // create userInfo to send back to frontend
        const userInfo = {
            token : token,
            email : email,
            fName : fName,
            lName : lName,
            role : null,
            userID : person.id
        }

        // create a new Session with a token and save to database
        token = jwt.sign({ id:email }, authconfig.secret, {expiresIn: 86400});
        let findExpirationDate = new Date();
        findExpirationDate.setDate(findExpirationDate.getDate() + 1);
        Session.create({
            token : token,
            email : email,
            personId : person.id,
            expirationDate : findExpirationDate
        })
        .then(data => {
            res.send(userInfo);
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });

  User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      var authorities = [];
      user.getRoles().then(roles => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }
        res.status(200).send({
          id: user.id,
          username: user.username,
          email: user.email,
          roles: authorities,
          accessToken: token
        });
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};