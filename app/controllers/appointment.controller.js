const Appointment = require("../utils/appointment.js");
const GoogleCalendar = require("../utils/googleCalendar");
const Group = require("../utils/group.js");
const Time = require("../utils/timeFunctions.js");

exports.create = async (req, res) => {
  await Appointment.createAppointment(req.body)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the appointment.",
      });
    });
};

exports.findAll = async (req, res) => {
  await Appointment.findAllAppointments()
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

exports.findAllForGroup = async (req, res) => {
  await Appointment.findAllAppointmentsForGroup(req.params.groupId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving appointments for group.",
      });
    });
};

exports.findAllFutureUpcomingForGroup = async (req, res) => {
  await Appointment.findAllUpcomingForGroup(req.params.groupId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving upcoming appointments for group.",
      });
    });
};

exports.findAllUpcomingForGroup = async (req, res) => {
  await Appointment.findAllAppointmentsFromOneMonthAgoForGroup(
    req.params.groupId
  )
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving upcoming appointments for group.",
      });
    });
};

exports.findAllForPerson = async (req, res) => {
  await Appointment.findAllForPerson(req.params.personId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving appointments for person.",
      });
    });
};

exports.findAllUpcomingForPerson = async (req, res) => {
  await Appointment.findAllUpcomingForPerson(req.params.personId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving upcoming appointments for person.",
      });
    });
};

exports.findAllUpcomingForTutor = async (req, res) => {
  let group = await Group.findOneGroup(req.params.groupId);

  let delTime = new Date().toLocaleTimeString("it-IT");
  console.log(delTime);
  console.log(group.bookPastMinutes);

  // need to get appointments outside of the book past minutes buffer
  let checkTime = Time.subtractMinsFromTime(group.bookPastMinutes, delTime);
  console.log(checkTime);

  await Appointment.findAllUpcomingForTutor(
    checkTime,
    req.params.groupId,
    req.params.personId
  )
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving upcoming appointments for person for group while considering group's book past start time.",
      });
    });
};

exports.findAllUpcomingForStudent = async (req, res) => {
  let group = await Group.findOneGroup(req.params.groupId);

  let delTime = new Date().toLocaleTimeString("it-IT");
  console.log(delTime);
  console.log(group.bookPastMinutes);

  // need to get appointments outside of the book past minutes buffer
  let checkTime = Time.subtractMinsFromTime(group.bookPastMinutes, delTime);
  console.log(checkTime);

  await Appointment.findAllUpcomingForStudent(
    checkTime,
    req.params.groupId,
    req.params.personId
  )
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving upcoming appointments for person for group while considering group's book past start time.",
      });
    });
};

exports.findAllPassedForTutor = async (req, res) => {
  await Appointment.findAllPassedForTutor(
    req.params.groupId,
    req.params.personId
  )
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving passed appointments for tutor for group.",
      });
    });
};

exports.findAllPassedForStudent = async (req, res) => {
  await Appointment.findAllPassedForStudent(
    req.params.groupId,
    req.params.personId
  )
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving passed appointments for student for group.",
      });
    });
};

exports.findAllForPersonForGroup = async (req, res) => {
  await Appointment.findAllForPersonForGroup(
    req.params.groupId,
    req.params.personId
  )
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving appointments for person for group.",
      });
    });
};

exports.findFeedbackApptForPerson = async (req, res) => {
  await Appointment.findFeedbackApptForPerson(req.params.appointmentId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving feedback appointment for person.",
      });
    });
};

exports.getAppointmentHourCount = async (req, res) => {
  await Appointment.getAppointmentHours(req.params.groupId, req.params.currWeek)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message,
      });
    });
};

exports.findOneForText = async (req, res) => {
  await Appointment.findOneAppointmentInfo(req.params.id)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving information for one appointment.",
      });
    });
};

exports.findOne = async (req, res) => {
  await Appointment.findOneAppointment(req.params.id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find appointment with id = ${req.params.id}.`,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Error retrieving appointment with id = " + req.params.id,
      });
    });
};

exports.updateForGoogle = async (req, res) => {
  // shouldn't need to update appointment
  if (
    req.body.type === "Group" &&
    req.body.status === "available" &&
    (req.body.googleEventId === "" ||
      req.body.googleEventId === undefined ||
      req.body.googleEventId === null)
  ) {
    await GoogleCalendar.addAppointmentToGoogle(req.params.id)
      .then((response) => {
        console.log("Successfully added appointment to Google");
        res.send(response);
        // res.send({
        //   message: "Appointment was successfully added to Google.",
        // });
      })
      .catch((err) => {
        console.log("Error adding appointment to Google: " + err);
        res.status(500).send({
          message: "Error adding appointment to Google",
        });
      });
  }
  // all other cases should require updating
  else {
    await Appointment.updateAppointment(req.body, req.params.id)
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
              await GoogleCalendar.addAppointmentToGoogle(req.params.id)
                .then((response) => {
                  console.log("Successfully added appointment to Google");
                  res.send(response);
                  // res.send({
                  //   message: "Appointment was successfully added to Google.",
                  // });
                })
                .catch((err) => {
                  console.log("Error adding appointment to Google: " + err);
                  res.status(500).send({
                    message: "Error adding appointment to Google",
                  });
                });
            }
            // if appointment is private and cancelled, delete the google event
            else if (
              req.body.status === "studentCancel" ||
              req.body.status === "tutorCancel"
            ) {
              await GoogleCalendar.deleteFromGoogle(req.params.id)
                .then((response) => {
                  console.log("Successfully deleted appointment from Google");
                  res.send(response);
                  // res.send({
                  //   message: "Appointment was successfully deleted from Google.",
                  // });
                })
                .catch((err) => {
                  console.log("Error deleting appointment from Google: " + err);
                  res.status(500).send({
                    message: "Error deleting appointment from Google",
                  });
                });
            }
            // otherwise, update the google event
            else {
              await GoogleCalendar.updateEventForGoogle(req.params.id)
                .then((response) => {
                  console.log("Successfully updated appointment with Google");
                  res.send(response);
                  // res.send({
                  //   message: "Appointment was successfully updated with Google.",
                  // });
                })
                .catch((err) => {
                  console.log("Error updating appointment with Google: " + err);
                  res.status(500).send({
                    message: "Error updating appointment with Google",
                  });
                });
            }
          } else if (req.body.type === "Group") {
            // if a tutor cancels, delete the google event
            if (req.body.status === "tutorCancel") {
              await GoogleCalendar.deleteFromGoogle(req.params.id)
                .then((response) => {
                  console.log("Successfully deleted appointment from Google");
                  res.send(response);
                  // res.send({
                  //   message: "Appointment was successfully deleted from Google.",
                  // });
                })
                .catch((err) => {
                  console.log("Error deleting appointment from Google: " + err);
                  res.status(500).send({
                    message: "Error deleting appointment from Google",
                  });
                });
            }
            // otherwise, update the google event
            else {
              await GoogleCalendar.updateEventForGoogle(req.params.id)
                .then((response) => {
                  console.log("Successfully updated appointment with Google");
                  res.send(response);
                  // res.send({
                  //   message: "Appointment was successfully updated with Google.",
                  // });
                })
                .catch((err) => {
                  console.log("Error updating appointment with Google: " + err);
                  res.status(500).send({
                    message: "Error updating appointment with Google",
                  });
                });
            }
          }
        } else {
          res.send({
            message: `Cannot update appointment for Google with id = ${req.params.id}. Maybe appointment was not found or req.body was empty!`,
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message:
            "Error updating appointment for Google with id = " +
            req.params.id +
            " error: " +
            err,
        });
      });
  }
};

exports.update = async (req, res) => {
  await Appointment.updateAppointment(req.body, req.params.id)
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Appointment was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update appointment with id = ${req.params.id}. Maybe appointment was not found or req.body was empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating appointment with id = " + req.params.id,
      });
    });
};

exports.delete = async (req, res) => {
  await Appointment.deleteAppointment(req.params.id)
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Appointment was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete appointment with id = ${req.params.id}. Maybe appointment was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete appointment with id = " + req.params.id,
      });
    });
};

exports.deleteAll = async (req, res) => {
  await Appointment.deleteAllAppointments()
    .then((nums) => {
      res.send({ message: `${nums} appointments were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all appointments.",
      });
    });
};
