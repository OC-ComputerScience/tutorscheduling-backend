const db = require("../models");
const authconfig = require("../config/auth.config");
const Person = db.person;
const Session = db.session;
const Personrole = db.personrole;

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

    await Person.findOne({
        where: {
          email: email
        }
    })
    .then(data => {
        console.log("person found");
        let person = {};
        let admin = false;
        if(data != null) {
            person = data.dataValues;
            // set if person is admin
            // Personrole.findAllForPerson(person.id)
            // .then((response) => {
            //     console.log(response.data)
            //     response.data.forEach(role => {
            //         if(role.type.toLowerCase() === "admin")
            //             admin = true;
            //         console.log(admin);
            //     })
            // })
            // .catch(err => {
            //     res.status(500).send({ message: err.message });
            // });
        }
        else {
            // create a new Person and save to database
            person = {
                fName: firstName,
                lName: lastName,
                email: email,
                phoneNum: ''
            }

            Person.create(person)
            .then(data => {
                console.log("person was registered")
                //res.send({ message: "Person was registered successfully!" });
            })
            .catch(err => {
                res.status(500).send({ message: err.message });
            });
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
                email : person.email,
                fName : person.fName,
                lName : person.lName,
                phoneNum : person.phoneNum,
                admin: admin,
                userID : person.id
            }
            res.send(userInfo);
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
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