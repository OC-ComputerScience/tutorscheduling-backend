const Availability = require("../sequelizeUtils/availability.js");

exports.create = async (req, res) => {
  await Availability.createAvailability(req.body)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the availability.",
      });
    });
};

exports.findAll = async (req, res) => {
  await Availability.findAllAvailabilities()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving availabilities.",
      });
    });
};

exports.findAllForPerson = async (req, res) => {
  await Availability.findAllAvailabilitiesForPerson(req.params.personId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving availabilities for person.",
      });
    });
};

exports.findAllUpcomingForPerson = async (req, res) => {
  await Availability.findAllUpcomingForPerson(req.params.personId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving upcoming availabilities for person.",
      });
    });
};

exports.findOne = async (req, res) => {
  await Availability.findOneAvailability(req.params.id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find availability with id = ${req.params.id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving availability with id = " + req.params.id,
      });
      console.log("Could not find availability: " + err);
    });
};

exports.update = async (req, res) => {
  await Availability.updateAvailability(req.body, req.params.id)
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Availability was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update availability with id = ${req.params.id}. Maybe availability was not found or req.body was empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating availability with id = " + id,
      });
      console.log("Could not update availability: " + err);
    });
};

exports.delete = async (req, res) => {
  await Availability.deleteAvailability(req.params.id)
    .then(() => {
      res.send({
        message: "Availability was deleted successfully!",
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete availability with id = " + id,
      });
      console.log("Could not delete availability: " + err);
    });
};

exports.deleteAll = async (req, res) => {
  await Availability.deleteAllAvailabilities()
    .then((nums) => {
      res.send({
        message: `${nums} availabilities were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while removing all availabilities.",
      });
    });
};
