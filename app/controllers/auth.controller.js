const db = require("../models");
const authconfig = require("../config/auth.config");
const Person = db.person;
const Session = db.session;
const PersonRole = db.personrole;
const Role = db.role;

const googleAud = process.env.GOOGLE_AUDIENCE;
const {google} = require('googleapis');

const Op = db.Sequelize.Op;

let googleUser = {};

const { group } = require("../models");
//const { person } = require("../models");

exports.login = async (req, res) => {
    console.log(req.body)

    var jwt = req.body.credential;

    const {OAuth2Client} = require('google-auth-library');
    const client = new OAuth2Client(googleAud);
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: jwt,
            audience: googleAud
        });
        googleUser = ticket.getPayload();
        console.log('Google payload is '+JSON.stringify(googleUser));
    }
    await verify().catch(console.error);

    let email = googleUser.email;
    let firstName = googleUser.given_name;
    let lastName = googleUser.family_name;

    console.log(lastName)
    
    let person = {};
    let access = [];

    await Person.findOne({
        where: {
          email: email
        }
    })
    .then(data => {
        if(data != null) {
            person = data.dataValues;
        }
        else {
            // create a new Person and save to database
            person = {
                fName: firstName,
                lName: lastName,
                email: email,
                phoneNum: '',
            }
        }
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });

    // this lets us get the person id
    if (person.id === undefined) {
        console.log("need to get person's id")
        console.log(person)
        await Person.create(person)
        .then(data => {
            console.log("person was registered")
            person = data.dataValues
            // res.send({ message: "Person was registered successfully!" });
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
    }
    else {
        console.log(person)
        // doing this to ensure that the person's name is the one listed with Google
        person.fName = firstName;
        person.lName = lastName;
        console.log(person)
        await Person.update(person, { where: { id: person.id } })
        .then(num => {
            if (num == 1) {
                console.log("updated person's name")
            } else {
                console.log(`Cannot update Person with id=${person.id}. Maybe Person was not found or req.body is empty!`)
            }
        })
        .catch(err => {
            console.log("Error updating Person with id=" + person.id + " " + err)
        });
    }

    // sets access for user
    await group.findAll({
        include: [{
            model: Role,
            include: [ {
                where: { '$role->personrole.personId$': person.id },
                model: PersonRole, 
                as: 'personrole',
                required: true
            } ],
            as: 'role',
            required: true
        }]
    })
    .then((data) => {
        for (let i = 0; i < data.length; i++) {
            let element = data[i].dataValues;
            let roles = [];

            for (let j = 0; j < element.role.length; j++) {
                let item = element.role[j];
                let role = item.type;
                roles.push(role);
            }
            let group = {
                name: element.name,
                roles: roles
            }
            access.push(group);
        }
        console.log(access);
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });

    // create a new Session with an expiration date and save to database
    let findExpirationDate = new Date();
    findExpirationDate.setDate(findExpirationDate.getDate() + 1);
    const session = {
        token : jwt,
        email : email,
        personId : person.id,
        expirationDate : findExpirationDate
    }

    console.log(session)
    
    Session.create(session)
    .then(() => {
        let userInfo = {
            email : person.email,
            fName : person.fName,
            lName : person.lName,
            phoneNum : person.phoneNum,
            access : access,
            userID : person.id
        }
        console.log(userInfo)
        res.send(userInfo);
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

exports.authorize = async (req, res) => {
    console.log(req)
    
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_AUDIENCE,
        process.env.CLIENT_SECRET,
        'postmessage'
    );

    // Get access and refresh tokens (if access_type is offline)
    let { tokens } = await oauth2Client.getToken(req.body.code);
    oauth2Client.setCredentials(tokens);
    console.log(tokens)
    console.log(oauth2Client)
};

exports.logout = async (req, res) => {
    // invalidate session -- delete token out of session table
    let session = {};
    await Session.findAll({ where: { token : req.body.token} })
      .then(data => {
        session = data[0];
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving sessions."
        });
      });
  
      
    Session.destroy({
        where: { id: session.id }
      })
        .then(num => {
          if (num == 1) {
              console.log("successfully logged out")
            res.send({
              message: "Session was deleted successfully and user has been logged out!"
            });
          } else {
              console.log("failed");
            res.send({
              message: `Cannot delete session with id=${id}. Maybe session was not found!`
            });
          }
        })
        .catch(err => {
          console.log(err)
          res.status(500).send({
            message: "Could not delete session with session=" + session.id
          });
    });
};
