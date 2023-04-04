const Person = require("../sequelizeUtils/person.js");

exports.create = async (req, res) => {
  await Person.createPerson(req.body)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the person.",
      });
    });
};

exports.findAll = async (req, res) => {
  await Person.findAllPeople()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving all people.",
      });
    });
};

exports.findAllForGroup = async (req, res) => {
  await Person.findAllPeopleByGroup(req.params.groupId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.findPendingTutorsForGroup = async (req, res) => {
  await Person.findPendingTutorsForGroup(req.params.groupId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.findApprovedTutorsForGroup = async (req, res) => {
  await Person.findApprovedTutorsForGroup(req.params.groupId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.getAppointmentHourCount = async (req, res) => {
  await Person.getPersonAppointmentHours(
    req.params.groupId,
    req.params.currWeek
  )
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.findFirstTutorForAppointment = async (req, res) => {
  await Person.findFirstTutorForAppointment(req.params.appointmentId)
    .then((data) => {
      // only need to send the first tutor in the appointment to be the organizer
      res.send(data[0]);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.findStudentForPersonForGroup = async (req, res) => {
  await Person.findStudentForPersonForGroup(
    req.params.email,
    req.params.groupId
  )
    .then((data) => {
      if (data) {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.findByEmail = async (req, res) => {
  await Person.findOnePersonByEmail(req.params.email)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.send({ email: "not found" });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving person with email = " + email,
      });
      console.log("Could not find person: " + err);
    });
};

exports.findByPhoneNumber = async (req, res) => {
  await Person.findOnePersonByEmail(req.params.phoneNum)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.send({ phoneNum: "not found" });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving person with phone number = " + phoneNumber,
      });
      console.log("Could not find person: " + err);
    });
};

exports.findOne = async (req, res) => {
  await Person.findOnePerson(req.params.id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find person with id = ${req.params.id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving person with id = " + req.params.id,
      });
      console.log("Could not find person: " + err);
    });
};

exports.update = async (req, res) => {
  await Person.updatePerson(req.body, req.params.id)
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Person was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update person with id = ${req.params.id}. Maybe person was not found or req.body was empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating person with id = " + req.params.id,
      });
      console.log("Could not update person: " + err);
    });
};

exports.delete = async (req, res) => {
  await Person.deletePerson(req.params.id)
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Person was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete person with id = ${req.params.id}. Maybe Pperson was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete person with id = " + req.params.id,
      });
      console.log("Could not delete person: " + err);
    });
};

// Delete all People from the database.
exports.deleteAll = async (req, res) => {
  await Person.deleteAllPeople()
    .then((nums) => {
      res.send({ message: `${nums} people were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all people.",
      });
    });
};
