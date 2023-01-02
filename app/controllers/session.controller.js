const Session = require("../utils/session.js");

exports.create = async (req, res) => {
  // Validate request
  if (!req.body.type) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  await Session.createSession(req.body)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the session.",
      });
    });
};

exports.findAll = async (req, res) => {
  await Session.findAllSessions()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving sessions.",
      });
    });
};

exports.findOne = async (req, res) => {
  await Session.findOneSession(req.params.id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find session with id = ${req.params.id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving session with id = " + req.params.id,
      });
      console.log("Could not find session: " + err);
    });
};

exports.update = async (req, res) => {
  await Session.updateSession(req.body, req.params.id)
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "session was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update session with id = ${req.params.id}. Maybe session was not found or req.body was empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating session with id = " + req.params.id,
      });
      console.log("Could not update session: " + err);
    });
};

exports.delete = async (req, res) => {
  await Session.deleteSession(req.params.id)
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Session was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete session with token = ${req.params.token}. Maybe session was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete session with token = " + req.params.token,
      });
      console.log("Could not delete session: " + err);
    });
};

exports.deleteAll = async (req, res) => {
  await Session.deleteAllSessions()
    .then((nums) => {
      res.send({ message: `${nums} sessions were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all sessions.",
      });
    });
};
