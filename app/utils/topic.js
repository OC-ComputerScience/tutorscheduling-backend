const db = require("../models");
const Topic = db.topic;
const PersonTopic = db.persontopic;
const Time = require("../utils/timeFunctions.js");

exports.createTopic = async (topicData) => {
  // Create a topic
  const topic = {
    id: topicData.id,
    name: topicData.name,
    abbr: topicData.abbr,
    status: topicData.status ? topicData.status : "active",
    groupId: topicData.groupId,
  };

  // Save topic in the database
  return await Topic.create(topic)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllTopics = async () => {
  return await Topic.findAll({
    order: [
      ["status", "ASC"],
      ["name", "ASC"],
    ],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllTopicsForGroup = async (groupId) => {
  return await Topic.findAll({
    where: { groupId: groupId },
    order: [
      ["status", "ASC"],
      ["name", "ASC"],
    ],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findActiveTopicsForGroup = async (groupId) => {
  return await Topic.findAll({
    where: { groupId: groupId, status: "active" },
    order: [["name", "ASC"]],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
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
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
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
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.getTopicAppointmentHours = async (groupId, currWeek) => {
  var week = Time.getWeekFromDate(currWeek);
  var firstDay = week.first;
  var lastDay = week.last;
  return (data = await db.sequelize
    .query(
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
    )
    .then(function (data) {
      return data;
    })
    .catch((err) => {
      return err;
    }));
};

exports.findOneTopic = async (id) => {
  return await Topic.findByPk(id)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.updateTopic = async (topic, id) => {
  return await Topic.update(topic, {
    where: { id: id },
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.deleteTopic = async (id) => {
  return await Topic.destroy({
    where: { id: id },
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.deleteAllTopics = async () => {
  return await Topic.destroy({
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
