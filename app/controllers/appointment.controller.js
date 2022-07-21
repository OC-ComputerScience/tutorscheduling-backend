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
const { google } = require("googleapis");
let token = {};

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

// Retrieve all Appointment from the database.
exports.findAppointmentsForGroup = (req, res) => {
  const groupId = req.params.groupId;

  Appointment.findAll({ 
    where: { 
      groupId: groupId 
    }
  })
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
    where: { groupId: groupId, date: { [Op.gte]: date }, 
      [Op.and]: [
        {
            status: { [Op.not]: "cancelled" }
        }, 
        {
            status: { [Op.not]: "studentCancel" }
        }, 
        {
            status: { [Op.not]: "tutorCancel" }
        }
      ] },
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

// Retrieve all passed appointments for a person for a group from the database.
exports.findAllPassedForPersonForGroupTutor = (req, res) => {
  const personId = req.params.personId;
  const groupId = req.params.groupId;
  let date = new Date();
  let endTime = date.toLocaleTimeString('it-IT')
  date.setHours(date.getHours() - (date.getTimezoneOffset()/60))
  date.setHours(0,0,0);

  Appointment.findAll({
    where: { groupId: groupId, 
            date: { [Op.lte]: date }, 
            endTime: { [Op.lt]: endTime }, 
            [Op.and]: [{status: {[Op.notLike]: "tutorCancel"}}, {status: { [Op.notLike]: "studentCancel"}}],
            [Op.or]: [{ status: {[Op.like]: "booked" }}, {type: { [Op.like]: "Group" }}] },
    include: [{
      where: { '$personappointment.personId$': personId, feedbacknumber: { [Op.eq]: null }, feedbacktext: { [Op.eq]: null } },
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
// Retrieve all passed appointments for a person for a group from the database.
exports.findAllPassedForPersonForGroupStudent = (req, res) => {
  const personId = req.params.personId;
  const groupId = req.params.groupId;
  const date = new Date();

  Appointment.findAll({
    where: { groupId: groupId, date: { [Op.lte]: date }, status: { [Op.like]: "complete" }},
    include: [{
      where: { '$personappointment.personId$': personId, feedbacknumber: { [Op.eq]: null }, feedbacktext: { [Op.eq]: null } },
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
    where: { groupId: groupId },
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
exports.getTutorForAppointment = (req, res) => {
  //const personId = req.params.personId;
  //const groupId = req.params.groupId;
  const appId = req.params.id;

  Person.findOne({
    include: [{
      model: PersonAppointment,
      as: 'personappointment',
      required: true,
      where: { isTutor: true, appointmentId: appId },

    }/*,
      {
        model: Topic,
        as: 'topic',
        required: true
      }*/]
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

  Appointment.findAll({
    where: {
      groupId: groupId,
      date: { [Op.gte]: date }
    }
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

// Retrieve all appointments for a person for a group from the database.
exports.findAllForGroup = (req, res) => {
  const groupId = req.params.groupId;

  Appointment.findAll({
    where: { groupId: groupId },
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
        if (req.body.status === "booked") {
          addToGoogle(id);
        }
        else if (req.body.status === "cancelled") {
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
    where: { id: id },
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
        authorize(addEvent, data);
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

  for (let i = 0; i < data.length; i++) {
    let obj = data[i];
    let tempObj = {};
    tempObj.email = obj.personappointment.person.email;
    attendees.push(tempObj);
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

  if (online) {
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
    .then((event) => console.log('Event created: %s', event))
    .catch((error) => {
      console.log('Some error occured', error)
      // console.log(error.response.data.error.errors);
    });
}

async function findFirstTutorForAppointment(id) {
  const appId = id;
  console.log(id)
  await Person.findAll({
    include: [{
      model: PersonAppointment,
      as: 'personappointment',
      required: true,
      where: { isTutor: true },
      include: [{
        model: Appointment,
        as: 'appointment',
        required: true,
        where: { '$personappointment->appointment.id$': appId }
      }]
    }]
  })
    .then((data) => {
      // only need to send the first tutor in the appointment to be the organizer
      //console.log(data[0])
      //res.send(data[0]);
      token.access_token = data[0].access_token;
      token.scope = SCOPES;
      token.token_type = data[0].token_type;
      token.expiry_date = data[0].expiry_date;
    })
    .catch(err => {
      console.log({ message: err.message });
    });
};

/**
 * Create an OAuth2 client with the credentials in the .env file, and then execute the
 * given callback function.
 * @param {function} callback The callback to call with the authorized client.
 */
async function authorize(callback, data) {
  const client_id = process.env.GOOGLE_AUDIENCE;
  const client_secret = process.env.CLIENT_SECRET;
  const redirect_url = process.env.REDIRECT_URL;
  
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_url);

  await findFirstTutorForAppointment(data[0].id);
  console.log(token)

  oAuth2Client.setCredentials(token);
  callback(oAuth2Client, data);

}

