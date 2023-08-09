const db = require("../models");
const Request = db.request;
const Person = db.person;
const Topic = db.topic;

exports.createRequest = async (requestData) => {
  if (requestData.problem === undefined) {
    const error = new Error("Problem cannot be empty for request!");
    error.statusCode = 400;
    throw error;
  } else if (requestData.description === undefined) {
    const error = new Error("Description cannot be empty for request!");
    error.statusCode = 400;
    throw error;
  } else if (requestData.groupId === undefined) {
    const error = new Error("Group ID cannot be empty for request!");
    error.statusCode = 400;
    throw error;
  } else if (requestData.personId === undefined) {
    const error = new Error("Person ID cannot be empty for request!");
    error.statusCode = 400;
    throw error;
  }

  // Create a request
  const request = {
    id: requestData.id,
    courseNum: requestData.courseNum,
    description: requestData.description,
    status: requestData.status ? requestData.status : "Received",
    problem: requestData.problem,
    groupId: requestData.groupId,
    personId: requestData.personId,
    topicId: requestData.topicId,
  };

  // Save request in the database
  return await Request.create(request);
};

exports.findAllRequests = async () => {
  return await Request.findAll({
    order: [
      ["status", "DESC"],
      ["createdAt", "ASC"],
    ],
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
      [db.sequelize.literal("FIELD('received','in-progress','completed')")],
      ["status", "DESC"],
      ["createdAt", "ASC"],
    ],
  });
};

exports.findOneRequest = async (id) => {
  return await Request.findByPk(id);
};

exports.updateRequest = async (request, id) => {
  return await Request.update(request, {
    where: { id: id },
  });
};

exports.deleteRequest = async (id) => {
  return await Request.destroy({
    where: { id: id },
  });
};

exports.deleteRequestForPersonForGroup = async (groupId, personId) => {
  return await Request.destroy({
    where: { personId: personId, groupId: groupId },
    truncate: false,
  });
};

exports.deleteAllRequests = async () => {
  return await Request.destroy({
    where: {},
    truncate: false,
  });
};
