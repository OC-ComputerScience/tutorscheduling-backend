const Group = require("../utils/group.js");
const Person = require("../utils/person.js");
const Session = require("../utils/session.js");
const { google } = require("googleapis");
const google_id = process.env.GOOGLE_AUDIENCE;
var jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  let googleUser = {};
  var googleToken = req.body.credential;

  const { OAuth2Client } = require("google-auth-library");
  const client = new OAuth2Client(google_id);
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: google_id,
    });
    googleUser = ticket.getPayload();
    console.log("Google payload is " + JSON.stringify(googleUser));
  }
  await verify().catch(console.error);

  let email = googleUser.email;
  let firstName = googleUser.given_name;
  let lastName = googleUser.family_name;

  let person = {};
  let session = {};
  let access = [];

  await Person.findOnePersonByEmail(email)
    .then((data) => {
      if (data != null) {
        person = data.dataValues;
      } else {
        // create a new Person and save to database
        person = {
          fName: firstName,
          lName: lastName,
          email: email,
          phoneNum: "",
          textOptIn: true,
        };
      }
    })
    .catch((err) => {
      console.log("Error finding person by email: " + err);
      res
        .status(500)
        .send({ message: "Error finding person by email: " + err });
      return;
    });

  // this lets us get the person id
  if (person.id === undefined) {
    await Person.createPerson(person)
      .then((data) => {
        console.log("Person has been registered");
        person = data.dataValues;
      })
      .catch((err) => {
        console.log("Error registering person: " + err);
        res.status(500).send({ message: "Error registering person: " + err });
        return;
      });
  } else {
    // doing this to ensure that the person's name is the one listed with Google
    person.fName = firstName;
    person.lName = lastName;
    await Person.updatePerson(person, person.id)
      .then((num) => {
        if (num == 1) {
          console.log("Updated person's name");
        } else {
          console.log(
            `Cannot update person with id = ${person.id}. Maybe Person was not found or req.body was empty!`
          );
        }
      })
      .catch((err) => {
        console.log("Error updating person with id = " + person.id + " " + err);
        res.status(500).send({
          message: "Error updating person with id = " + person.id + " " + err,
        });
        return;
      });
  }

  // sets access for user
  await Group.findGroupsForPerson(person.id)
    .then((data) => {
      for (let i = 0; i < data.length; i++) {
        let element = data[i].dataValues;
        let roles = [];

        for (let j = 0; j < element.role.length; j++) {
          let item = element.role[j];
          let role = {
            type: item.type,
            personRoleId: item.personrole[0].id,
          };
          roles.push(role);
        }

        let group = {
          name: element.name,
          roles: roles,
        };
        access.push(group);
      }
      console.log(access);
    })
    .catch((err) => {
      console.log("Error finding groups for person: " + err);
      res.status(500).send({
        message: "Error finding groups for person: " + err,
      });
      return;
    });

  // try to find session first
  await Session.findSessionByEmail(email)
    .then((data) => {
      console.log(data);
      if (data.length > 0) {
        session = data[0].dataValues;
      }
    })
    .catch((err) => {
      console.log("Some error occurred while retrieving sessions: " + err);
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving sessions: " + err,
      });
      return;
    });

  if (session.id !== undefined) {
    if (session.expirationDate < Date.now()) {
      session.token = "";
      // clear session's token if it's expired
      await Session.updateSession(session, session.id)
        .then((num) => {
          if (num == 1) {
            console.log("Successfully logged out of expired session");
          } else {
            console.log("Failed to log out expired session");
            res.send({
              message: "Failed to log out expired session",
            });
          }
        })
        .catch((err) => {
          console.log("Error logging out user: " + err);
          res.status(500).send({
            message: "Error logging out user: " + err,
          });
          return;
        });
      //reset session to be null since we need to make another one
      session = {};
    } else {
      // if the session is still valid, we don't need to make another one
      console.log("Found a session, don't need to make another one");
    }
  }

  // testing this conditional again because the previous conditional may have cleared out a session
  if (session.id === undefined) {
    // create a new Session with an expiration date and save to database
    let token = jwt.sign({ id: email }, "eaglesoftwareteam", {
      expiresIn: 86400,
    });
    let tempExpirationDate = new Date();
    tempExpirationDate.setDate(tempExpirationDate.getDate() + 1);
    session = {
      token: token,
      email: email,
      personId: person.id,
      expirationDate: tempExpirationDate,
    };

    console.log("Making a new session:");
    console.log(session);

    await Session.createSession(session).catch((err) => {
      console.log("Error creating session: " + err);
      res.status(500).send({ message: "Error creating session: " + err });
      return;
    });
  }

  let userInfo = {
    email: person.email,
    fName: person.fName,
    lName: person.lName,
    phoneNum: person.phoneNum,
    access: access,
    userID: person.id,
    token: session.token,
    sessionExpirationDate: session.expirationDate,
    refresh_token: person.refresh_token,
    expiration_date: person.expiration_date,
  };
  res.send(userInfo);
};

exports.authorize = async (req, res) => {
  if (
    req.body.code !== "undefined" &&
    req.body.code !== undefined &&
    req.body.code !== null
  ) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_AUDIENCE,
      process.env.CLIENT_SECRET,
      "postmessage"
    );

    // Get access and refresh tokens (if access_type is offline)
    let { tokens } = await oauth2Client.getToken(req.body.code);
    oauth2Client.setCredentials(tokens);

    let person = {};

    await Person.findOnePerson(req.params.id)
      .then((data) => {
        if (data != null) {
          person = data.dataValues;
        }
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
        return;
      });

    person.refresh_token = tokens.refresh_token;

    let tempExpirationDate = new Date();
    // set to expire in 100 days
    tempExpirationDate.setDate(tempExpirationDate.getDate() + 100);
    person.expiration_date = tempExpirationDate;

    await Person.updatePerson(person, person.id)
      .then((num) => {
        if (num == 1) {
          console.log("Updated person's Google calendar token.");
        } else {
          console.log(
            `Cannot update person's Google calendar token with id = ${person.id}. Maybe person was not found or req.body was empty!`
          );
        }
        let userInfo = {
          refresh_token: person.refresh_token,
          expiration_date: person.expiration_date,
        };
        res.send({
          userInfo: userInfo,
          message:
            "You have successfully authorized Tutor Scheduling to link your Google calendar to ours.",
        });
      })
      .catch((err) => {
        console.log("Error updating person's Google calendar token: " + err);
        res.status(500).send({
          message: "Error updating person's Google calendar token: " + err,
        });
      });
  } else {
    res.send({
      message:
        "You did not authorize us to access your Google Calendar. Please try again.",
    });
  }
};

exports.logout = async (req, res) => {
  if (req.body === null) {
    res.send({
      message: "User has already been successfully logged out!",
    });
    return;
  }

  // invalidate session -- delete token out of session table
  let session = {};

  await Session.findAllSessionsByToken(req.body.token)
    .then((data) => {
      if (data[0] !== undefined) session = data[0].dataValues;
    })
    .catch((err) => {
      console.log(
        "Some error occurred while retrieving sessions for token: " + err
      );
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving sessions for token: " + err,
      });
      return;
    });

  session.token = "";

  // session won't be null but the id will if no session was found
  if (session.id !== undefined) {
    await Session.updateSession(session, session.id)
      .then((num) => {
        if (num == 1) {
          console.log("User has been successfully logged out!");
          res.send({
            message: "User has been successfully logged out!",
          });
        } else {
          console.log("Error logging out user.");
          res.send({
            message: "Error logging out user.",
          });
        }
      })
      .catch((err) => {
        console.log("Error logging out user: " + err);
        res.status(500).send({
          message: "Error logging out user: " + err,
        });
      });
  } else {
    console.log("User has already been successfully logged out!");
    res.send({
      message: "User has already been successfully logged out!",
    });
  }
};
