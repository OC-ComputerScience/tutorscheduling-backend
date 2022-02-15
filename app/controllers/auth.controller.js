const db = require("../models");
const authconfig = require("../config/auth.config");
const Person = db.person;
const Session = db.session;
const Role = db.role;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
const { person } = require("../models");

exports.login = async (req, res) => {
    const {OAuth2Client} = require('google-auth-library');
    const client = new OAuth2Client('158532899975-5qk486rajjjb3dqrdbp4h86a65l997ab.apps.googleusercontent.com');
    const ticket = await client.verifyIdToken({
        idToken: req.body.accessToken,
        audience: '158532899975-5qk486rajjjb3dqrdbp4h86a65l997ab.apps.googleusercontent.com'
    });
    const payload= ticket.getPayload();
    console.log('Google payload is '+JSON.stringify(payload));
    let email = payload['email'];
    let firstName = payload['given_name'];
    let lastName = payload['family_name'];
    let token = null;

    console.log(email + ' ' + firstName + ' ' + lastName);

    await Person.findOne({
        where: {
          email: email
        }
    })
    .then(data => {
        let person = {};
        if(data != null) {
            person = data.dataValues;
        }
        
        // create a new Session with a token and save to database
        token = jwt.sign({ id:email }, authconfig.secret, {expiresIn: 86400});
        let findExpirationDate = new Date();
        findExpirationDate.setDate(findExpirationDate.getDate() + 1);
        const session = {
            token : token,
            email : email,
            personId : person.id,
            expirationDate : findExpirationDate
        }
        
        Session.create(session)
        .then(data => {
            let userInfo = {
                token : token,
                email : email,
                fName : firstName,
                lName : lastName,
                phoneNum : '',
                role : '',
                userID : person.id
            }
            res.send(userInfo);
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
    })
    .catch(err => {
        // create a new Person and save to database
        const person = {
            fName: firstName,
            lName: lastName,
            email: email,
            phoneNum: ''
        }

        Person.create(person)
        .then(data => {
            //res.send({ message: "Person was registered successfully!" });
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });

        // create a new Session with a token and save to database
        token = jwt.sign({ id:email }, authconfig.secret, {expiresIn: 86400});
        let findExpirationDate = new Date();
        findExpirationDate.setDate(findExpirationDate.getDate() + 1);
        const session = {
            token : token,
            email : email,
            personId : person.id,
            expirationDate : findExpirationDate
        }
        
        Session.create(session)
        .then(data => {
            let userInfo = {
                token : token,
                email : email,
                fName : firstName,
                lName : lastName,
                phoneNum : '',
                role : '',
                userID : person.id
            }
            res.send(userInfo);
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
    });
};

exports.logout = async (req, res) => {
    // invalidate session -- delete token out of session table
    Session.removeByToken(req.params.token, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
              res.status(404).send({
                message: `Not found Session with token "${req.params.token}".`
              });
            } else {
              res.status(500).send({
                message: "Could not delete Session with token " + req.params.token
              });
            }
          } else res.send({ message: `Session was deleted successfully!` });
    })
    return;
};