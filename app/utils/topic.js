const db = require("../models");
const Topic = db.topic;
const PersonTopic = db.persontopic;
const Time = require("./timeFunctions.js");

exports.createTopic = async (topicData) => {
  if (!topicData.name) {
    const error = new Error("Name cannot be empty for topic!");
    error.statusCode = 400;
    throw error;
  }

  // Create a topic
  const topic = {
    id: topicData.id,
    name: topicData.name,
    abbr: topicData.abbr,
    status: topicData.status ? topicData.status : "active",
    groupId: topicData.groupId,
  };

  // Save topic in the database
  return await Topic.create(topic);
};

exports.findAllTopics = async () => {
  return await Topic.findAll({
    order: [
      ["status", "ASC"],
      ["name", "ASC"],
    ],
  });
};

exports.findAllTopicsForGroup = async (groupId) => {
  return await Topic.findAll({
    where: { groupId: groupId },
    order: [
      ["status", "ASC"],
      ["name", "ASC"],
    ],
  });
};

exports.findActiveTopicsForGroup = async (groupId) => {
  return await Topic.findAll({
    where: { groupId: groupId, status: "active" },
    order: [["name", "ASC"]],
  });
};

exports.findAllDisabledTopics = async (id) => {
  return await Topic.findAll({
    where: { "$persontopic.topicId$": id, status: "disabled" },
    include: [
      {
        model: PersonTopic,
        as: "persontopic",
      },
    ],
    order: [["name", "ASC"]],
  });
};

exports.findTopicsForPersonForGroup = async (groupId, personId) => {
  return await Topic.findAll({
    where: {
      "$persontopic.personId$": personId,
      groupId: groupId,
    },
    include: [
      {
        model: PersonTopic,
        as: "persontopic",
        right: true,
      },
    ],
    order: [
      ["status", "ASC"],
      ["name", "ASC"],
    ],
  });
};

exports.findTopicsForPerson = async (personId) => {
  return await Topic.findAll({
    where: { "$persontopic.personId$": personId },
    include: [
      {
        model: PersonTopic,
        as: "persontopic",
        right: true,
      },
    ],
    order: [["name", "ASC"]],
  });
};

exports.getTopicAppointmentHours = async (groupId, currWeek) => {
  var week = Time.getWeekFromDate(currWeek);
  var firstDay = week.first;
  var lastDay = week.last;
  return (data = await db.sequelize.query(
    "SELECT DISTINCT t.name, " +
      "(SELECT SUM(CASE WHEN a.groupId = " +
      groupId +
      " AND t.id = a.topicId AND t.groupId = " +
      groupId +
      " AND a.date >= '" +
      firstDay +
      "' AND a.date <= '" +
      lastDay +
      "' THEN TIMESTAMPDIFF(minute, a.startTime, a.endTime) ELSE 0 END) " +
      "FROM appointments a " +
      "WHERE a.groupId = " +
      groupId +
      " AND t.groupId = " +
      groupId +
      " AND t.id = a.topicId AND a.date >= '" +
      firstDay +
      "' AND a.date <= '" +
      lastDay +
      "' " +
      ") AS hours, " +
      " (SELECT SUM(CASE WHEN a.groupId = " +
      groupId +
      " AND a.topicId IS NULL AND a.type = 'Private' AND pa.appointmentId = a.id AND pt.topicId = t.id " +
      "AND a.date >= '" +
      firstDay +
      "' AND a.date <= '" +
      lastDay +
      "'  THEN TIMESTAMPDIFF(minute, a.startTime, a.endTime) ELSE 0 END) " +
      "FROM appointments a JOIN personappointments pa on a.id = pa.appointmentId JOIN persontopics pt on pt.personId = pa.personId) AS potentialHours " +
      "FROM topics as t WHERE t.groupId = " +
      groupId +
      " AND t.status = 'active' ORDER BY t.name ASC;",
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  ));
};

exports.findOneTopic = async (id) => {
  return await Topic.findByPk(id);
};

exports.updateTopic = async (topic, id) => {
  return await Topic.update(topic, {
    where: { id: id },
  });
};

exports.deleteTopic = async (id) => {
  return await Topic.destroy({
    where: { id: id },
  });
};

exports.deleteAllTopics = async () => {
  return await Topic.destroy({
    where: {},
    truncate: false,
  });
};
