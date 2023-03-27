const Request = require("../utils/request.js");

exports.create = async (req, res) => {
  await Request.createRequest(req.body)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the request.",
      });
      console.log(err.message);
    });
};

exports.findAll = async (req, res) => {
  await Request.findAllRequests()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving requests.",
      });
    });
};

exports.findAllForGroup = async (req, res) => {
  await Request.findAllRequestsForGroup(req.params.groupId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving requests for group.",
      });
    });
};

exports.findOne = async (req, res) => {
  await Request.findOneRequest(req.params.id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find request with id = ${req.params.id}.`,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Error retrieving request with id = " + req.params.id,
      });
    });
};

exports.update = async (req, res) => {
  await Request.updateRequest(req.body, req.params.id)
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Request was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update request with id = ${req.params.id}. Maybe request was not found or req.body was empty!`,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Error updating request with id = " + req.params.id,
      });
    });
};

exports.delete = async (req, res) => {
  await Request.deleteRequest(req.params.id)
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Request was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete request with id = ${req.params.id}. Maybe request was not found!`,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Could not delete request with id = " + req.params.id,
      });
    });
};

exports.deleteAll = async (req, res) => {
  await Request.deleteAllRequests()
    .then((nums) => {
      res.send({ message: `${nums} requests were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all requests.",
      });
    });
};
