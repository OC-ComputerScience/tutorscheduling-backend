const PersonAppointment = require("../utils/personappointment.js");

// Create and Save a new PersonAppointment
exports.create = async (req, res) => {
  // Validate request
  if (!req.body.personId) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

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

exports.findAll = async (res) => {
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

exports.findAllForPerson = async (req, res) => {
  const id = req.params.personId;

  PersonAppointment.findAll({ where: { personId: id } })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving personroles for person.",
      });
    });
};

// Find a single PersonAppointment with a personId and a appointment
exports.findPersonAppointmentByPersonAndAppointment = async (req, res) => {
  const personId = req.params.personId;
  const appointmentId = req.params.appointmentId;

  PersonAppointment.findOne({
    where: { personId: personId, appointmentId: appointmentId },
    include: [
      {
        model: Appointment,
        as: "appointment",
        required: true,
      },
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving personroles for person and role.",
      });
    });
};

// Retrieve all upcoming appointments for a person for a group from the database.
exports.findStudentDataForTable = async (req, res) => {
  const appointmentId = req.params.appointmentId;

  PersonAppointment.findAll({
    where: { appointmentId: appointmentId, isTutor: false },
    include: [
      {
        model: Person,
        as: "person",
        required: true,
      },
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving appointments for person for group.",
      });
    });
};

// Retrieve all upcoming appointments for a person for a group from the database.
exports.findTutorDataForTable = async (req, res) => {
  const appointmentId = req.params.appointmentId;

  PersonAppointment.findAll({
    where: { appointmentId: appointmentId, isTutor: true },
    include: [
      {
        model: Person,
        as: "person",
        required: true,
      },
    ],
  })
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

exports.findOne = async (req, res) => {
  const id = req.params.id;

  PersonAppointment.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find PersonAppointment with id = ${req.params.id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving PersonAppointment with id = " + id,
      });
    });
};

// Update a PersonAppointment by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;

  PersonAppointment.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "PersonAppointment was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update PersonAppointment with id = ${req.params.id}. Maybe PersonAppointment was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating PersonAppointment with id = " + id,
      });
    });
};

// Delete a PersonAppointment with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;

  PersonAppointment.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "PersonAppointment was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete PersonAppointment with id = ${req.params.id}. Maybe PersonAppointment was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete PersonAppointment with id = " + id,
      });
    });
};

// Delete all PersonAppointment from the database.
exports.deleteAll = async (req, res) => {
  PersonAppointment.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} PersonAppointment were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while removing all PersonAppointment.",
      });
    });
};
