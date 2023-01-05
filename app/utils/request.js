const db = require("../models");
const Request = db.request;
const Person = db.person;
const Topic = db.topic;

exports.createRequest = async (requestData) => {
  // Create a request
  const request = {
    id: requestData.id,
    personId: requestData.personId,
    groupId: requestData.groupId,
    topicId: requestData.topicId,
    courseNum: requestData.courseNum,
    description: requestData.description,
    status: requestData.status,
    problem: requestData.problem,
  };

  // Save request in the database
  return await Request.create(request)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllRequests = async () => {
  return await Request.findAll({
    order: [
      ["status", "DESC"],
      ["createdAt", "ASC"],
    ],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllRequestsForGroup = async (groupId) => {
  return await Request.findAll({
    where: { groupId: groupId },
    include: [
      {
        model: Person,
        as: "person",
        required: true,
      },
      {
        model: Topic,
        as: "topic",
        required: false,
      },
    ],
    order: [
      ["status", "DESC"],
      ["createdAt", "ASC"],
    ],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findOneRequest = async (id) => {
  return await Request.findByPk(id)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.updateRequest = async (request, id) => {
  return await Request.update(request, {
    where: { id: id },
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.deleteRequest = async (id) => {
  return await Request.destroy({
    where: { id: id },
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.deleteRequestForPersonForGroup = async (groupId, personId) => {
  return await Request.destroy({
    where: { personId: personId, groupId: groupId },
    truncate: false,
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.deleteAllRequests = async () => {
  return await Request.destroy({
    where: {},
    truncate: false,
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};
