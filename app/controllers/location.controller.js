const Location = require("../utils/location.js");

exports.create = async (req, res) => {
  // Validate request
  if (!req.body.name) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  await Location.createLocation(req.body)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the location.",
      });
    });
};

exports.findAll = async (res) => {
  await Location.findAllLocations()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving locations.",
      });
    });
};

exports.findAllForGroup = async (req, res) => {
  await Location.findAllLocationsForGroup(req.params.groupId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving locations for group.",
      });
    });
};

exports.findActiveForGroup = async (req, res) => {
  await Location.findActiveLocationsForGroup(req.params.groupId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving active locations for group.",
      });
    });
};

exports.findOne = async (req, res) => {
  await Location.findOneLocation(req.params.id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find location with id = ${req.params.id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving location with id = " + req.params.id,
      });
      console.log("Error finding location " + err);
    });
};

exports.update = async (req, res) => {
  await Location.updateLocation(req.body, req.params.id)
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Location was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update location with id = ${req.params.id}. Maybe location was not found or req.body was empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating location with id = " + req.params.id,
      });
      console.log("Error updating location " + err);
    });
};

exports.delete = async (req, res) => {
  await Location.deleteLocation(req.params.id)
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Location was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete location with id = ${req.params.id}. Maybe location was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete location with id = " + req.params.id,
      });
      console.log("Error deleting location " + err);
    });
};

exports.deleteAll = async (res) => {
  await Location.deleteAllLocations()
    .then((nums) => {
      res.send({ message: `${nums} locations were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all locations.",
      });
    });
};
