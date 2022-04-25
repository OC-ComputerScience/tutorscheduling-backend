const db = require("../models");
const Appointment = db.appointment;
const PersonAppointment = db.personappointment;
const Person = db.person;
const Group = db.group;
const Location = db.location;
const Topic = db.topic;
const Op = db.Sequelize.Op;

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
const { google } = require("googleapis");
const fs = require('fs');
let code = '';
let currentPersonId = 0;
let currentPerson = {};

// Create and Save a new Appointment
exports.create = (req, res) => {
    // Validate request
    if (!req.body.date) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
      return;
    }
  
    // Create a Appointment
    const appointment = {
      id: req.body.id,
      groupId: req.body.groupId,
      topicId: req.body.topicId,
      locationId: req.body.locationId,
      date: req.body.date,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      type: req.body.type,
      status: req.body.status,
      tutorStart: req.body.tutorStart,
      tutorEnd: req.body.tutorEnd,
      URL: req.body.URL,
      tutorFeedback: req.body.tutorFeedback,
      studentFeedback: req.body.studentFeedback,
      preSessionInfo: req.body.preSessionInfo
    };
  
    // Save Appointment in the database
    Appointment.create(appointment)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Appointment."
        });
      });
  };

// Retrieve all Appointment from the database.
exports.findAll = (req, res) => {
    const id = req.query.id;
    var condition = id ? { id: { [Op.like]: `%${id}%` } } : null;
  
    Appointment.findAll({ where: condition })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Appointment."
        });
      });
  };

    // Retrieve all upcoming appointments for a person for a group from the database.
exports.findAllUpcomingForPersonForGroup = (req, res) => {
  const personId = req.params.personId;
  const groupId = req.params.groupId;
  const date = new Date();

  Appointment.findAll({ 
    where: {groupId: groupId, date: { [Op.gte]: date }},
    include: [{
      where: { '$personappointment.personId$': personId },
      model: PersonAppointment,
      as: 'personappointment',
      required: true
    }]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving appointments for person for group."
      });
    });
};


  // Retrieve all appointments for a person for a group from the database.
exports.findAllForPersonForGroup = (req, res) => {
  const personId = req.params.personId;
  const groupId = req.params.groupId;

  Appointment.findAll({ 
    where: {groupId: groupId},
    include: [{
      where: { '$personappointment.personId$': personId },
      model: PersonAppointment,
      as: 'personappointment',
      required: true
    },
    {
      model: Topic,
      as: 'topic',
      required: true
    }]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving appointments for person for group."
      });
    });
};

  // Retrieve all appointments for a person for a group from the database.
  exports.findAllUpcomingForGroup = (req, res) => {
    const groupId = req.params.groupId;
    const date = new Date();
    // const time = date.toLocaleTimeString('en-US', { hour12: false });
  
    Appointment.findAll({ where: { 
                            groupId: groupId, 
                            date: { [Op.gte]: date }
                        }})
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving appointments for group."
        });
      });
  };

  // Retrieve all appointments for a person for a group from the database.
  exports.findAllForGroup = (req, res) => {
    const groupId = req.params.groupId;
  
    Appointment.findAll({ 
        where: {groupId: groupId},
        include: [{
          model: Location,
          as: 'location',
          required: true
        },
        {
          model: Topic,
          as: 'topic',
          required: true
        },
        {
          model: PersonAppointment,
          as: 'personappointment',
          required: true
        }] 
      })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving appointments for group."
        });
      });
  };

  // Retrieve all Appointments for a person from the database.
exports.findAllForPerson = (req, res) => {
  const id = req.params.personId;

  Appointment.findAll({ 
    include: [{
      where: { '$personappointment.personId$': id },
      model: PersonAppointment,
      as: 'personappointment',
      required: true
    }]
  })
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving appointments."
    });
  });
};

// Find a single Appointment with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
  
    Appointment.findByPk(id)
      .then(data => {
        if (data) {
          res.send(data);
        } else {
          res.status(404).send({
            message: `Cannot find Appointment with id=${id}.`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error retrieving Appointment with id=" + id
        });
      });
  };

// Update a Appointment by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Appointment.update(req.body, {
    where: { id: id }
  })
  .then(num => {
    if (num == 1) {
      res.send({
        message: "Appointment was updated successfully."
      });
    } 
    else {
      res.send({
        message: `Cannot update Appointment with id=${id}. Maybe Appointment was not found or req.body is empty!`
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Error updating Appointment with id=" + id
    });
  });
};

// Update an Appointment's status by the id in the request
exports.updateStatus = (req, res) => {
  const id = req.params.id;

  Appointment.update(req.body, {
    where: { id: id }
  })
  .then(num => {
    if (num == 1) {
      if(req.body.status === "booked") {
        addToGoogle(id);
      }
      else if(req.body.status === "cancelled") {
        deleteFromGoogle(id);
      }

      res.send({
        message: "Appointment was updated successfully."
      });
    } 
    else {
      res.send({
        message: `Cannot update Appointment with id=${id}. Maybe Appointment was not found or req.body is empty!`
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Error updating Appointment with id=" + id
    });
  });
};

// Delete a Appointment with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;
  
    Appointment.destroy({
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Appointment was deleted successfully!"
          });
        } else {
          res.send({
            message: `Cannot delete Appointment with id=${id}. Maybe Appointment was not found!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete Appointment with id=" + id
        });
      });
  };

// Delete all Appointment from the database.
exports.deleteAll = (req, res) => {
    Appointment.destroy({
      where: {},
      truncate: false
    })
      .then(nums => {
        res.send({ message: `${nums} Appointment were deleted successfully!` });
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while removing all Appointment."
        });
      });
  };

addToGoogle = (id) => {
  Appointment.findAll({ 
    where: {id: id},
    include: [{
      model: Location,
      as: 'location',
      required: true
    },
    {
      model: Topic,
      as: 'topic',
      required: true
    },
    {
      model: Group,
      as: 'group',
      required: true
    },
    {
      model: PersonAppointment,
      as: 'personappointment',
      required: true,
      include: [{
        model: Person,
        as: 'person',
        required: true,
        right: true
      }]
    }],
    raw: true,
    nest: true
  })
  .then(data => {
    if (data) {
      console.log("successfully to google calendar steps")

      // Load client secrets from a local file.
      fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Calendar API.
        authorize(JSON.parse(content), addEvent, data);
      });
    } 
    else {
      console.log(`Cannot find Appointment with id=${id}.`)
      // res.status(404).send({
      //   message: `Cannot find Appointment with id=${id}.`
      // });
    }
  })
  .catch(err => {
    console.log("Error retrieving Appointment with id=" + id)
    console.log(err)
    // res.status(500).send({
    //   message: "Error retrieving Appointment with id=" + id
    // });
  });
}

function addEvent(auth, data) {
  const calendar = google.calendar({
    version: 'v3',
    auth: auth
  });

  let startTime = '';
  let endTime = '';
  let group = ''; 
  let location = '';
  let topic = '';
  let attendees = [];
  let online = false;
  
  for(let i = 0; i < data.length; i++) {
    let obj = data[i];
    let tempObj = {};
    tempObj.email = obj.personappointment.person.email;
    console.log(tempObj);
    attendees.push(tempObj);
    console.log(obj);
    startTime = new Date(obj.date).toISOString();
    let temp = startTime.slice(11, 19);
    startTime = startTime.replace(temp, obj.startTime.toString());
    startTime = startTime.slice(0, 23);
    endTime = new Date(obj.date).toISOString();
    temp = endTime.slice(11, 19);
    endTime = endTime.replace(temp, obj.endTime.toString());
    endTime = endTime.slice(0, 23)
    group = obj.group.name;
    location = obj.location.name;
    topic = obj.topic.name;
    if (obj.location.type === "Online" || obj.location.type === "online") {
      online = true;
    }
  }

  const event = {
    summary: group + ' Tutoring: ' + topic,
    location: location,
    description: data.preSessionInfo,
    start: {
      dateTime: startTime,
      timeZone: 'US/Central',
    },
    end: {
      dateTime: endTime,
      timeZone: 'US/Central',
    },
    attendees: attendees,
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 30 },
      ],
    },
  };

  if(online) {
    event.conferenceData = {
      createRequest: {
        conferenceSolutionKey: {
          type: 'hangoutsMeet'
        },
        requestId: group + data.date
      }
    }
  }

  // We make a request to Google Calendar API.
  calendar.events.insert({
    auth: auth,
    calendarId: "primary",
    resource: event,
    conferenceDataVersion: 1,
  })
  .then((event) =>  console.log('Event created: %s', event))
  .catch((error) => {
    console.log('Some error occured', error)
    console.log(error.response.data.error.errors);
  });
}

async function findFirstTutorForAppointment(id) {
  const appId = id;
  console.log(id)
    await Person.findAll({
      include: [ {
          model: PersonAppointment, 
          as: 'personappointment',
          required: true,
          where: { isTutor: true },
          include: [ {
            model: Appointment, 
            as: 'appointment',
            required: true,
            where: { '$personappointment->appointment.id$': appId}
        }]
      }]
    })
    .then((data) => {
      // only need to send the first tutor in the appointment to be the organizer
      //console.log(data[0])
        //res.send(data[0]);
        code = data[0].googleToken;
        currentPersonId = data[0].id;
    })
    .catch(err => {
        console.log({ message: err.message });
    });
  };

  // async function updatePersonToken(id) {
  //   await Person.update(this.currentPerson, {
  //     where: { id: id }
  //   })
  //     .then(num => {
  //       if (num == 1) {
  //         res.send({
  //           message: "Person was updated successfully."
  //         });
  //       } else {
  //         res.send({
  //           message: `Cannot update Person with id=${id}. Maybe Person was not found or req.body is empty!`
  //         });
  //       }
  //     })
  //     .catch(err => {
  //       res.status(500).send({
  //         message: "Error updating Person with id=" + id
  //       });
  //     });
  // };

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
 function authorize(credentials, callback, data) {
   //console.log(credentials);
  const {client_secret, client_id, redirect_uris} = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback, data);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client, data);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
 async function getAccessToken(oAuth2Client, callback, data) {
  //const authUrl = oAuth2Client.generateAuthUrl({
    //access_type: 'offline',
    //scope: SCOPES,
  //});
  //console.log('Authorize this app by visiting this url:', authUrl);
  // const rl = readline.createInterface({
  //   input: process.stdin,
  //   output: process.stdout,
  // });
  await findFirstTutorForAppointment(data[0].id);
  console.log(code)
  // if the person doesn't have a google token code, get one from google
  if(code === '' || code === null) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
  }
  oAuth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err);
    oAuth2Client.setCredentials(token);
    // Store the token to disk for later program executions
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
      if (err) return console.error(err);
      console.log('Token stored to', TOKEN_PATH);
    });
    callback(oAuth2Client, data);
  });
}

  // Open google cal token page for user
  exports.openGoogleCalPage = (req, res) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    res.send(authUrl)
  };
