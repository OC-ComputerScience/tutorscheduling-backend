const db = require("../models");
const authconfig = require("../config/auth.config");
const Person = db.person;
const Session = db.session;
const PersonRole = db.personrole;
const Role = db.role;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
const { group } = require("../models");

const google_id = process.env.GOOGLE_AUDIENCE;

exports.login = async (req, res) => {
    console.log(req)
    console.log(req.body)
    const {OAuth2Client} = require('google-auth-library');
    const client = new OAuth2Client(google_id);
   
    const ticket = await client.verifyIdToken({
        idToken: req.body.idToken,
        audience: google_id
    });
    const payload= ticket.getPayload();
    console.log('Google payload is '+JSON.stringify(payload));
    let email = payload['email'];
    let firstName = payload['given_name'];
    let lastName = payload['family_name'];
    let googleToken = req.body.token;
    let token = null;
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
                access_token: googleToken.access_token,
                token_type: googleToken.token_type,
                expiry_date: googleToken.expiry_date
            }
        }
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });

    // this lets us get the person id
    if (person.id === undefined) {
        console.log("need to get person's id")
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
    // else update accessToken
    else {
        console.log(person)
        // doing this to ensure that the person's name is the one listed with Google
        person.fName = firstName;
        person.lName = lastName;
        person.access_token = googleToken.access_token;
        person.token_type = googleToken.token_type;
        person.expiry_date = googleToken.expiry_date;
        console.log(person)
        await Person.update(person, { where: { id: person.id } })
        .then(num => {
            if (num == 1) {
                console.log("updated person's google token")
            // res.send({
            //     message: "Person was updated successfully."
            // });
            } else {
                console.log(`Cannot update Person with id=${person.id}. Maybe Person was not found or req.body is empty!`)
            // res.send({
            //     message: `Cannot update Person with id=${person.id}. Maybe Person was not found or req.body is empty!`
            // });
            }
        })
        .catch(err => {
            console.log("Error updating Person with id=" + person.id + " " + err)
            // res.status(500).send({
            // message: "Error updating Person with id=" + person.id
            // });
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
            //console.log(element)
            for (let j = 0; j < element.role.length; j++) {
                let item = element.role[j];
                //console.log(item)
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
    .then(() => {
        let userInfo = {
            token : token,
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

exports.logout = async (req, res) => {
    // invalidate session -- delete token out of session table
    let session = {};
    await Session.findAll({ where: { token : req.body.token} })
      .then(data => {
        session = data[0].dataValues;
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
          res.status(500).send({
            message: "Could not delete session with session=" + session.id
          });
    });
};
