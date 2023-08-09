const Appointment = require("../sequelizeUtils/appointment.js");
const Calendar = require("../utils/calendar.js");

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

exports.findOneForInfo = async (req, res) => {
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

exports.cancel = async (req, res) => {
  await Calendar.cancelAppointment(req.params.id, req.body)
    .then(() => {
      res.send({
        message: "Appointment was canceled successfully.",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message:
          err.message ||
          "Error canceling appointment with id = " + req.params.id,
      });
    });
};

exports.update = async (req, res) => {
  await Calendar.updateAppointment(req.body)
    .then(() => {
      res.send({
        message: "Appointment was updated successfully.",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message:
          err.message ||
          "Error updating appointment with id = " + req.params.id,
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
      console.log(err);
      res.status(500).send({
        message:
          err.message ||
          "Could not delete appointment with id = " + req.params.id,
      });
    });
};

exports.deleteAll = async (req, res) => {
  await Appointment.deleteAllAppointments()
    .then((number) => {
      res.send({
        message: `${number} appointments were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all appointments.",
      });
    });
};
