const db = require("../models");
const Appointment = db.appointment;
const PersonAppointment = db.personappointment;
const Person = db.person;
const Group = db.group;
const Location = db.location;
const Topic = db.topic;
const PersonTopic = db.persontopic;
const Op = db.Sequelize.Op;
const Time = require("../utils/timeFunctions.js");

const { google } = require("googleapis");
let token = "";
let eventId = "";

exports.createAppointment = async (appointmentData) => {
  // Create a Appointment
  const appointment = {
    id: appointmentData.id,
    googleEventId: appointmentData.googleEventId,
    groupId: appointmentData.groupId,
    topicId: appointmentData.topicId,
    locationId: appointmentData.locationId,
    date: appointmentData.date,
    startTime: appointmentData.startTime,
    endTime: appointmentData.endTime,
    type: appointmentData.type,
    status: appointmentData.status,
    tutorStart: appointmentData.tutorStart,
    tutorEnd: appointmentData.tutorEnd,
    URL: appointmentData.URL,
    preSessionInfo: appointmentData.preSessionInfo,
  };

  // Save Appointment in the database
  return await Appointment.create(appointment)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllAppointments = async () => {
  return await Appointment.findAll({
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllForGroup = async (groupId) => {
  return await Appointment.findAll({
    where: { groupId: groupId },
    include: [
      {
        model: Location,
        as: "location",
        required: false,
      },
      {
        model: Topic,
        as: "topic",
        required: false,
      },
      {
        model: PersonAppointment,
        as: "personappointment",
        required: true,
        include: [
          {
            model: Person,
            as: "person",
            required: true,
            right: true,
            include: [
              {
                model: PersonTopic,
                as: "persontopic",
                required: false,
                include: [
                  {
                    model: Topic,
                    as: "topic",
                    required: true,
                    right: true,
                    where: { groupId: groupId },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllAppointmentsFromOneMonthAgoForGroup = async (groupId) => {
  var oneMonthAgo = new Date(
    new Date().getFullYear(),
    new Date().getMonth() - 1,
    new Date().getDate()
  );
  return await Appointment.findAll({
    where: { groupId: groupId, date: { [Op.gt]: oneMonthAgo } },
    include: [
      {
        model: Location,
        as: "location",
        required: false,
      },
      {
        model: Topic,
        as: "topic",
        required: false,
      },
      {
        model: PersonAppointment,
        as: "personappointment",
        required: true,
        include: [
          {
            model: Person,
            as: "person",
            required: true,
            right: true,
            include: [
              {
                model: PersonTopic,
                as: "persontopic",
                required: false,
                include: [
                  {
                    model: Topic,
                    as: "topic",
                    required: true,
                    right: true,
                    where: { groupId: groupId },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllForPerson = async (personId) => {
  return await Appointment.findAll({
    include: [
      {
        where: { "$personappointment.personId$": personId },
        model: PersonAppointment,
        as: "personappointment",
        required: true,
      },
    ],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllUpcomingForPerson = async (personId) => {
  const date = new Date();
  date.setHours(date.getHours() - date.getTimezoneOffset() / 60);
  date.setHours(0, 0, 0, 0);

  let checkTime = new Date();
  checkTime =
    checkTime.getHours() +
    ":" +
    checkTime.getMinutes() +
    ":" +
    checkTime.getSeconds();

  return await Appointment.findAll({
    where: {
      [Op.or]: [
        {
          [Op.and]: [
            { startTime: { [Op.gte]: checkTime } },
            { date: { [Op.eq]: date } },
          ],
        },
        {
          date: { [Op.gt]: date },
        },
      ],
      [Op.and]: [
        {
          status: { [Op.not]: "studentCancel" },
        },
        {
          status: { [Op.not]: "tutorCancel" },
        },
      ],
    },
    include: [
      {
        where: { "$personappointment.personId$": personId },
        model: PersonAppointment,
        as: "personappointment",
        required: true,
      },
    ],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllUpcomingForPersonForGroup = async (groupId, personId) => {
  const date = new Date();
  date.setHours(date.getHours() - date.getTimezoneOffset() / 60);
  date.setHours(0, 0, 0, 0);

  let checkTime = new Date();
  checkTime =
    checkTime.getHours() +
    ":" +
    checkTime.getMinutes() +
    ":" +
    checkTime.getSeconds();

  return await Appointment.findAll({
    where: {
      groupId: groupId,
      [Op.or]: [
        {
          [Op.and]: [
            { startTime: { [Op.gte]: checkTime } },
            { date: { [Op.eq]: date } },
          ],
        },
        {
          date: { [Op.gt]: date },
        },
      ],
      [Op.and]: [
        {
          status: { [Op.not]: "studentCancel" },
        },
        {
          status: { [Op.not]: "tutorCancel" },
        },
      ],
    },
    include: [
      {
        model: Location,
        as: "location",
        required: false,
      },
      {
        model: Topic,
        as: "topic",
        required: false,
      },
      {
        model: PersonAppointment,
        as: "personappointment",
        required: true,
        include: [
          {
            model: Person,
            as: "person",
            required: true,
            right: true,
            where: { id: personId },
          },
        ],
      },
    ],
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllPassedForTutorForGroup = async (groupId, personId) => {
  let endTime = date.toLocaleTimeString("it-IT");
  date.setHours(date.getHours() - date.getTimezoneOffset() / 60);
  date.setHours(0, 0, 0);

  return await Appointment.findAll({
    where: {
      groupId: groupId,
      [Op.and]: [
        { status: { [Op.notLike]: "tutorCancel" } },
        { status: { [Op.notLike]: "studentCancel" } },
      ],
      [Op.and]: [
        {
          [Op.or]: [
            { date: { [Op.lt]: date } },
            {
              [Op.and]: [
                { date: { [Op.eq]: date } },
                { endTime: { [Op.lt]: endTime } },
              ],
            },
          ],
        },
        {
          [Op.or]: [
            { status: { [Op.like]: "booked" } },
            { type: { [Op.like]: "Group" } },
          ],
        },
      ],
    },
    include: [
      {
        where: {
          "$personappointment.personId$": personId,
          feedbacknumber: { [Op.eq]: null },
          feedbacktext: { [Op.eq]: null },
        },
        model: PersonAppointment,
        as: "personappointment",
        required: true,
      },
    ],
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllPassedForStudentForGroup = async (groupId, personId) => {
  const date = new Date();

  return await Appointment.findAll({
    where: {
      groupId: groupId,
      date: { [Op.lte]: date },
      status: { [Op.like]: "complete" },
    },
    include: [
      {
        where: {
          "$personappointment.personId$": personId,
          feedbacknumber: { [Op.eq]: null },
          feedbacktext: { [Op.eq]: null },
        },
        model: PersonAppointment,
        as: "personappointment",
        required: true,
      },
    ],
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllForPersonForGroup = async (groupId, personId) => {
  return await Appointment.findAll({
    where: { groupId: groupId },
    include: [
      {
        where: { "$personappointment.personId$": personId },
        model: PersonAppointment,
        as: "personappointment",
        required: true,
      },
      {
        model: Topic,
        as: "topic",
        required: true,
      },
    ],
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllUpcomingForPersonForGroup = async (groupId, personId) => {
  return await Appointment.findAll({
    where: { groupId: groupId },
    include: [
      {
        where: { "$personappointment.personId$": personId },
        model: PersonAppointment,
        as: "personappointment",
        required: true,
      },
      {
        model: Topic,
        as: "topic",
        required: true,
      },
    ],
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllUpcomingForGroup = async (groupId) => {
  const date = new Date();

  return await Appointment.findAll({
    where: { groupId: groupId, date: { [Op.gte]: date } },
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.getAppointmentHours = async (groupId, currWeek) => {
  var week = Time.getWeekFromDate(currWeek);
  var firstDay = week.first;
  var lastDay = week.last;

  return await Appointment.findAll({
    where: {
      groupId: groupId,
      [Op.and]: [
        { date: { [Op.gte]: firstDay } },
        { date: { [Op.lte]: lastDay } },
      ],
    },
    attributes: [
      [db.sequelize.literal("COUNT(id)"), "count"],
      [
        db.sequelize.literal("SUM(TIMESTAMPDIFF(minute,startTime,endTime))"),
        "hours",
      ],
      [
        db.sequelize.literal(
          "SUM(CASE WHEN status = 'available' AND type = 'Private' THEN TIMESTAMPDIFF(minute,startTime,endTime) ELSE 0 END)"
        ),
        "available",
      ],
      [
        db.sequelize.literal(
          "SUM(CASE WHEN status = 'available' AND type = 'Group' THEN TIMESTAMPDIFF(minute,startTime,endTime) ELSE 0 END)"
        ),
        "group",
      ],
      [
        db.sequelize.literal(
          "SUM(CASE WHEN status = 'pending' THEN TIMESTAMPDIFF(minute,startTime,endTime) ELSE 0 END)"
        ),
        "pending",
      ],
      [
        db.sequelize.literal(
          "SUM(CASE WHEN status = 'booked' THEN TIMESTAMPDIFF(minute,startTime,endTime) ELSE 0 END)"
        ),
        "booked",
      ],
      [
        db.sequelize.literal(
          "SUM(CASE WHEN status = 'complete' THEN TIMESTAMPDIFF(minute,startTime,endTime) ELSE 0 END)"
        ),
        "complete",
      ],
      [
        db.sequelize.literal(
          "SUM(CASE WHEN status = 'no-show' THEN TIMESTAMPDIFF(minute,startTime,endTime) ELSE 0 END)"
        ),
        "noshow",
      ],
    ],
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

// Retrieve all Appointment from the database.
exports.findOneForText = (req, res) => {
  const id = req.params.id;

  Appointment.findAll({
    where: { id: id },
    include: [
      {
        model: Location,
        as: "location",
        required: true,
      },
      {
        model: Topic,
        as: "topic",
        required: true,
      },
      {
        model: PersonAppointment,
        as: "personappointment",
        required: true,
        include: [
          {
            model: Person,
            as: "person",
            required: true,
            right: true,
            include: [
              {
                model: PersonTopic,
                as: "persontopic",
                required: false,
                include: [
                  {
                    model: Topic,
                    as: "topic",
                    required: true,
                    right: true,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Appointments.",
      });
    });
};

exports.findFeedbackApptForPerson = (req, res) => {
  const appointmentId = req.params.appointmentId;

  Appointment.findAll({
    where: { id: appointmentId },
    include: [
      {
        model: Location,
        as: "location",
        required: true,
      },
      {
        model: Topic,
        as: "topic",
        required: true,
      },
      {
        model: Group,
        as: "group",
        required: true,
      },
      {
        model: PersonAppointment,
        as: "personappointment",
        required: true,
        include: [
          {
            model: Person,
            as: "person",
            required: true,
            right: true,
          },
        ],
      },
    ],
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving appointments.",
      });
    });
};

// Find a single Appointment with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Appointment.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Appointment with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Appointment with id=" + id,
      });
    });
};

// Update a Appointment by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Appointment.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Appointment was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Appointment with id=${id}. Maybe Appointment was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Appointment with id=" + id,
      });
    });
};

// Update an Appointment's status by the id in the request
exports.updateForGoogle = async (req, res) => {
  const id = req.params.id;

  // shouldn't need to update appointment
  if (
    req.body.type === "Group" &&
    (req.body.status === "Available" || req.body.status === "available") &&
    (req.body.googleEventId === "" ||
      req.body.googleEventId === undefined ||
      req.body.googleEventId === null)
  ) {
    await addToGoogle(id)
      .then(() => {
        console.log("successfully added appointment to google");
        res.send({
          message: "Appointment was successfully added to google.",
        });
      })
      .catch((err) => {
        console.log("Error adding apppointment to google: " + err);
        res.status(500).send({
          message: "Error adding appointment to google",
        });
      });
  }
  // all other cases should require updating
  else {
    Appointment.update(req.body, {
      where: { id: id },
    })
      .then(async (num) => {
        if (num == 1) {
          if (req.body.type === "Private") {
            // if appointment is private and booked, and there isn't a google event id, add the google event
            if (
              req.body.status === "booked" &&
              (req.body.googleEventId === "" ||
                req.body.googleEventId === undefined ||
                req.body.googleEventId === null)
            ) {
              await addToGoogle(id)
                .then(() => {
                  console.log("successfully added appointment to google");
                  res.send({
                    message: "Appointment was successfully added to google.",
                  });
                })
                .catch((err) => {
                  console.log("Error adding apppointment to google: " + err);
                  res.status(500).send({
                    message: "Error adding appointment to google",
                  });
                });
            }
            // if appointment is private and cancelled, delete the google event
            else if (
              req.body.status === "cancelled" ||
              req.body.status === "studentCancel" ||
              req.body.status === "tutorCancel"
            ) {
              await this.deleteFromGoogle(id)
                .then(() => {
                  console.log("successfully deleted appointment from google");
                  res.send({
                    message:
                      "Appointment was successfully deleted from google.",
                  });
                })
                .catch((err) => {
                  console.log(
                    "Error deleting apppointment from google: " + err
                  );
                  res.status(500).send({
                    message: "Error deleting appointment from google",
                  });
                });
            }
            // otherwise, update the google event
            else {
              await updateEvent(id)
                .then(() => {
                  console.log("successfully updated appointment with google");
                  res.send({
                    message:
                      "Appointment was successfully updated with google.",
                  });
                })
                .catch((err) => {
                  console.log("Error updating appointment with google: " + err);
                  res.status(500).send({
                    message: "Error updating appointment with google",
                  });
                });
            }
          } else if (req.body.type === "Group") {
            // if a tutor cancels, delete the google event
            if (
              req.body.status === "cancelled" ||
              req.body.status === "tutorCancel"
            ) {
              await this.deleteFromGoogle(id)
                .then(() => {
                  console.log("successfully deleted appointment from google");
                  res.send({
                    message:
                      "Appointment was successfully deleted from google.",
                  });
                })
                .catch((err) => {
                  console.log(
                    "Error deleting apppointment from google: " + err
                  );
                  res.status(500).send({
                    message: "Error deleting appointment from google",
                  });
                });
            }
            // otherwise, update the google event
            else {
              await updateEvent(id)
                .then(() => {
                  console.log("successfully updated appointment with google");
                  res.send({
                    message:
                      "Appointment was successfully updated with google.",
                  });
                })
                .catch((err) => {
                  console.log(
                    "Error updating apppointment with google: " + err
                  );
                  res.status(500).send({
                    message: "Error updating appointment with google",
                  });
                });
            }
          }
        } else {
          res.send({
            message: `Cannot update Appointment with id=${id}. Maybe Appointment was not found or req.body is empty!`,
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message:
            "Error updating Appointment with id=" + id + " error: " + err,
        });
      });
  }
};

// Delete a Appointment with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Appointment.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Appointment was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Appointment with id=${id}. Maybe Appointment was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Appointment with id=" + id,
      });
    });
};

// Delete all Appointment from the database.
exports.deleteAll = (req, res) => {
  Appointment.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} Appointment were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all Appointment.",
      });
    });
};

getAllAppointmentInfo = async (appointmentId) => {
  let appointments = [];
  await Appointment.findAll({
    where: { id: appointmentId },
    include: [
      {
        model: Location,
        as: "location",
        required: true,
      },
      {
        model: Topic,
        as: "topic",
        required: true,
      },
      {
        model: Group,
        as: "group",
        required: true,
      },
      {
        model: PersonAppointment,
        as: "personappointment",
        required: true,
        include: [
          {
            model: Person,
            as: "person",
            required: true,
            right: true,
          },
        ],
      },
    ],
    raw: true,
    nest: true,
  })
    .then((data) => {
      if (data) {
        console.log(data);
        appointments = data;
      } else {
        console.log(`Cannot find Appointment with id=${id}.`);
      }
    })
    .catch((err) => {
      console.log("Error retrieving Appointment with id=" + id);
      console.log(err);
    });

  return appointments;
};

setUpEvent = async (appointmentId) => {
  let appointments = []; // there will be multiple for each attendee
  appointments = await getAllAppointmentInfo(appointmentId);
  console.log(appointments);

  let startTime = "";
  let endTime = "";
  let group = "";
  let location = "";
  let topic = "";
  let attendees = [];
  let online = false;
  let studentName = "";
  let summary = "";

  for (let i = 0; i < appointments.length; i++) {
    let obj = appointments[i];
    if (obj.type === "Private" && !obj.personappointment.isTutor) {
      studentName =
        obj.personappointment.person.fName +
        " " +
        obj.personappointment.person.lName;
      console.log("Google student name: " + studentName);
    }
    let tempObj = {};
    tempObj.email = obj.personappointment.person.email;
    if (obj.personappointment.isTutor) tempObj.responseStatus = "accepted";
    attendees.push(tempObj);
  }

  let appointment = appointments[0];
  eventId = appointment.googleEventId;

  startTime = new Date(appointment.date).toISOString();
  let temp = startTime.slice(11, 19);
  startTime = startTime.replace(temp, appointment.startTime.toString());
  startTime = startTime.slice(0, 23);
  endTime = new Date(appointment.date).toISOString();
  temp = endTime.slice(11, 19);
  endTime = endTime.replace(temp, appointment.endTime.toString());
  endTime = endTime.slice(0, 23);
  group = appointment.group.name;
  location = appointment.location.name;
  topic = appointment.topic.name;
  if (
    appointment.location.type === "Online" ||
    appointment.location.type === "online"
  ) {
    online = true;
  }

  // set up name
  if (appointment.type === "Private") {
    summary = studentName + " - " + topic + " Tutoring";
  } else {
    summary = "Group - " + topic + " Tutoring";
  }

  const event = {
    summary: summary,
    location: location,
    description: appointment.preSessionInfo,
    start: {
      dateTime: startTime,
      timeZone: "US/Central",
    },
    end: {
      dateTime: endTime,
      timeZone: "US/Central",
    },
    attendees: attendees,
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "email", minutes: 120 },
      ],
    },
    status: "confirmed",
    transparency: "opaque",
  };

  if (online) {
    event.conferenceData = {
      createRequest: {
        conferenceSolutionKey: {
          type: "hangoutsMeet",
        },
        requestId: group + appointment.date,
      },
    };
  }

  return event;
};

addToGoogle = async (appointmentId) => {
  let auth = await getAccessToken(appointmentId);

  let event = {};
  event = await setUpEvent(appointmentId);
  console.log(event);

  const calendar = google.calendar({
    version: "v3",
    auth: auth,
  });

  // We make a request to Google Calendar API.
  calendar.events
    .insert({
      auth: auth,
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: "all",
    })
    .then(async (event) => {
      await updateAppointmentGoogleId(appointmentId, event.data.id);
      console.log("Event created: %s", event.data);
    })
    .catch((error) => {
      console.log("Some error occured", error);
      // if we get back 403 or 429, try again
      if (error.status === 403 || error.status === 429) {
        // We make a request to Google Calendar API.
        console.log("Google status is: " + error.status);
        console.log("Attempting insert again.");
        calendar.events
          .insert({
            auth: auth,
            calendarId: "primary",
            resource: event,
            conferenceDataVersion: 1,
            sendUpdates: "all",
          })
          .then(async (event) => {
            await updateAppointmentGoogleId(appointmentId, event.data.id);
            console.log("Event created: %s", event.data);
          })
          .catch((error) => {
            console.log("Some error occured", error);
            // console.log(error.response.data.error.errors);
          });
      }
    });
};

updateEvent = async (appointmentId) => {
  let auth = await getAccessToken(appointmentId);

  let event = {};
  event = await setUpEvent(appointmentId);
  console.log(event);

  const calendar = google.calendar({
    version: "v3",
    auth: auth,
  });

  // We make a request to Google Calendar API.
  calendar.events
    .update({
      auth: auth,
      calendarId: "primary",
      eventId: eventId,
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: "all",
    })
    .then(async (event) => {
      console.log("Event updated: %s", event.data);
    })
    .catch((error) => {
      console.log("Some error occured", error);
      // console.log(error.response.data.error.errors);
    });
};

updateAppointmentGoogleId = async (appointmentId, eventId) => {
  let appointment = {};

  await Appointment.findAll({ where: { id: appointmentId } })
    .then((data) => {
      appointment = data[0].dataValues;
    })
    .catch((err) => {
      console.log("Some error occurred while retrieving Appointment.");
    });

  appointment.googleEventId = eventId;

  Appointment.update(appointment, { where: { id: appointmentId } })
    .then((num) => {
      if (num == 1) {
        console.log("Appointment's google event id was updated successfully.");
      } else {
        console.log(
          `Cannot update Appointment's google event id. Maybe Appointment was not found or req.body is empty!`
        );
      }
    })
    .catch((err) => {
      console.log(
        `Cannot update Appointment's google event id. Maybe Appointment was not found or req.body is empty!`
      );
    });
};

exports.getFromGoogle = async (appointmentId) => {
  let eventId = "";

  console.log("in delete from google");

  await Appointment.findAll({ where: { id: appointmentId } })
    .then((data) => {
      eventId = data[0].dataValues.googleEventId;
    })
    .catch((err) => {
      console.log("Some error occurred while retrieving Appointment. " + err);
    });

  console.log(eventId);

  let auth = await getAccessToken(appointmentId);

  var params = {
    auth: auth,
    calendarId: "primary",
    eventId: eventId,
  };

  const calendar = google.calendar({
    version: "v3",
    auth: auth,
  });

  calendar.events.get(params, function (err) {
    if (err) {
      console.log("The API returned an error: " + err);
      if (err.includes("Not Found")) {
        // we need to delete the appointment on our side or update it to tutorCancel
      }
    }
    console.log("Event retrieved from Google calendar.");
  });
};

exports.deleteFromGoogle = async (appointmentId) => {
  let eventId = "";

  console.log("in delete from google");

  await Appointment.findAll({ where: { id: appointmentId } })
    .then((data) => {
      eventId = data[0].dataValues.googleEventId;
    })
    .catch((err) => {
      console.log("Some error occurred while retrieving Appointment.");
    });

  console.log(eventId);

  let auth = await getAccessToken(appointmentId);

  var params = {
    auth: auth,
    calendarId: "primary",
    eventId: eventId,
  };

  const calendar = google.calendar({
    version: "v3",
    auth: auth,
  });

  calendar.events.delete(params, function (err) {
    if (err) {
      console.log("The API returned an error: " + err);
      return;
    }
    console.log("Event deleted from Google calendar.");
  });
};

findFirstTutorForAppointment = async (id) => {
  const appId = id;
  console.log(id);
  await Person.findAll({
    include: [
      {
        model: PersonAppointment,
        as: "personappointment",
        required: true,
        where: { isTutor: true },
        include: [
          {
            model: Appointment,
            as: "appointment",
            required: true,
            where: { "$personappointment->appointment.id$": appId },
          },
        ],
      },
    ],
  })
    .then((data) => {
      // only need to send the first tutor in the appointment to be the organizer
      token = data[0].refresh_token;
    })
    .catch((err) => {
      console.log({ message: err.message });
    });
};

getAccessToken = async (appointmentId) => {
  const client_id = process.env.GOOGLE_AUDIENCE;
  const client_secret = process.env.CLIENT_SECRET;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    "postmessage"
  );

  await findFirstTutorForAppointment(appointmentId);

  let creds = {};
  // gets access token from refresh token
  // reference: https://zapier.com/engineering/how-to-use-the-google-calendar-api/
  var fetch = require("node-fetch"); // or fetch() is native in browsers

  var makeQuerystring = (params) =>
    Object.keys(params)
      .map((key) => {
        return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
      })
      .join("&");

  await fetch("https://www.googleapis.com/oauth2/v4/token", {
    method: "post",
    body: makeQuerystring({
      client_id: client_id,
      client_secret: client_secret,
      refresh_token: token,
      grant_type: "refresh_token",
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then((res) => res.json())
    .then((json) => (creds = json));

  console.log(creds);

  oAuth2Client.setCredentials(creds);
  return oAuth2Client;
};

function getWeekFromDate(date) {
  var year = parseInt(date.substring(0, 4));
  var month = parseInt(date.substring(5, 7));
  var day = parseInt(date.substring(8, 10));
  var curr = new Date(year, month - 1, day); // get current date
  console.log(day + ", " + month + ", " + year); // something wonky here, month is adding one each time.
  console.log("CURR " + curr);
  var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
  var last = first + 6; // last day is the first day + 6

  var firstday = new Date(curr.setDate(first));
  var lastday = new Date(curr.setDate(last));

  return toSQLDate(firstday, lastday);
}

function toSQLDate(date1, date2) {
  first = date1.toISOString().slice(0, 19).replace("T", " ");
  last = date2.toISOString().slice(0, 19).replace("T", " ");
  return { first, last };
}
