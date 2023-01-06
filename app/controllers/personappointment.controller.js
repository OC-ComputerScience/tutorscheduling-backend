const PersonAppointment = require("../utils/personappointment.js");

// Create and Save a new PersonAppointment
exports.create = async (req, res) => {
  await PersonAppointment.createPersonAppointment(req.body)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while creating the person appointment.",
      });
    });
};

exports.findAll = async (req, res) => {
  await PersonAppointment.findAllPersonAppointments()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving person appointments.",
      });
    });
};

exports.findAllForPerson = async (req, res) => {
  await PersonAppointment.findAllPersonAppointmentsForPerson(
    req.params.personId
  )
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving person appointments for person.",
      });
    });
};

exports.findPersonAppointmentByPersonAndAppointment = async (req, res) => {
  await PersonAppointment.findPersonAppointmentForPersonForAppointment(
    req.params.appointmentId,
    req.params.personId
  )
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving person appointments for person for appointment.",
      });
    });
};

exports.findStudentDataForTable = async (req, res) => {
  await PersonAppointment.findStudentDataForTable(req.params.appointmentId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving student data based on an appointment id.",
      });
    });
};

exports.findTutorDataForTable = async (req, res) => {
  await PersonAppointment.findTutorDataForTable(req.params.appointmentId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving tutor data based on an appointment id.",
      });
    });
};

exports.findOne = async (req, res) => {
  await PersonAppointment.findOnePersonAppointment(req.params.id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find person appointment with id = ${req.params.id}.`,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message:
          "Error retrieving person appointment with id = " + req.params.id,
      });
    });
};

exports.update = async (req, res) => {
  await PersonAppointment.updatePersonAppointment(req.body, req.params.id)
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Person appointment was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update person appointment with id = ${req.params.id}. Maybe person appointment was not found or req.body was empty!`,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Error updating person appointment with id = " + req.params.id,
      });
    });
};

exports.delete = async (req, res) => {
  await PersonAppointment.deletePersonAppointment(req.params.id)
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Person appointment was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete person appointment with id = ${req.params.id}. Maybe person appointment was not found!`,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Could not delete person appointment with id = " + id,
      });
    });
};

exports.deleteAll = async (req, res) => {
  await PersonAppointment.deleteAllPersonAppointments()
    .then((nums) => {
      res.send({
        message: `${nums} person appointments were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while removing all person appointments.",
      });
    });
};
