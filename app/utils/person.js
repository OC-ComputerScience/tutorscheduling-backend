const db = require("../models");
const Time = require("./timeFunctions.js");
const Person = db.person;
const PersonRole = db.personrole;
const PersonTopic = db.persontopic;
const PersonAppointment = db.personappointment;
const Appointment = db.appointment;
const Role = db.role;
const Topic = db.topic;

exports.createPerson = async (personData) => {
  if (!personData.fName) {
    const error = new Error("First name cannot be empty for person!");
    error.statusCode = 400;
    throw error;
  } else if (!personData.lName) {
    const error = new Error("Last name cannot be empty for person!");
    error.statusCode = 400;
    throw error;
  } else if (!personData.email) {
    const error = new Error("Email cannot be empty for person!");
    error.statusCode = 400;
    throw error;
  }

  // make sure we don't create a duplicate value
  let existingPerson = await this.findOnePersonByEmail(personData.email);

  if (existingPerson !== undefined) {
    return existingPerson.dataValues;
  } else {
    // Create a person
    const person = {
      id: personData.id,
      fName: personData.fName,
      lName: personData.lName,
      email: personData.email,
      phoneNum: personData.phoneNum,
      textOptIn: req.body.textOptIn ? req.body.textOptIn : true,
      refresh_token: personData.refresh_token,
      expiration_date: personData.expiration_date,
    };

    // Save person in the database
    return await Person.create(person);
  }
};

exports.findAllPeople = async () => {
  return await Person.findAll({
    order: [
      ["lName", "ASC"],
      ["fName", "ASC"],
    ],
  });
};

exports.findAllPeopleByGroup = async (groupId) => {
  return await Person.findAll({
    include: [
      {
        model: PersonRole,
        as: "personrole",
        required: true,
        include: [
          {
            model: Role,
            as: "role",
            required: true,
            where: { "$personrole->role.groupId$": groupId },
          },
        ],
      },
    ],
    order: [
      ["lName", "ASC"],
      ["fName", "ASC"],
    ],
  });
};

exports.findPendingTutorsForGroup = async (groupId) => {
  return await Person.findAll({
    include: [
      {
        model: PersonRole,
        as: "personrole",
        required: true,
        where: { "$personrole.status$": "applied" },
        include: [
          {
            model: Role,
            as: "role",
            required: true,
            where: {
              "$personrole->role.groupId$": groupId,
              "$personrole->role.type$": "Tutor",
            },
          },
        ],
      },
      {
        model: PersonTopic,
        as: "persontopic",
        required: false,
        include: [
          {
            model: Topic,
            as: "topic",
            required: true,
            where: { "$persontopic->topic.groupId$": groupId },
          },
        ],
      },
    ],
    order: [
      ["createdAt", "ASC"],
      ["lName", "ASC"],
      ["fName", "ASC"],
    ],
  });
};

exports.findApprovedTutorsForGroup = async (groupId) => {
  return await Person.findAll({
    include: [
      {
        model: PersonRole,
        as: "personrole",
        required: true,
        where: { "$personrole.status$": "approved" },
        include: [
          {
            model: Role,
            as: "role",
            required: true,
            where: {
              "$personrole->role.groupId$": groupId,
              "$personrole->role.type$": "Tutor",
            },
          },
        ],
      },
    ],
    order: [
      ["lName", "ASC"],
      ["fName", "ASC"],
    ],
  });
};

exports.getPersonAppointmentHours = async (groupId, currWeek) => {
  var week = Time.getWeekFromDate(currWeek);
  var firstDay = week.first.slice(0, 10);
  var lastDay = week.last.slice(0, 10);
  return (data = await db.sequelize.query(
    "SELECT DISTINCT p.fName,p.lName, " +
      "(SELECT SUM(CASE WHEN a.groupId = " +
      groupId +
      " AND pa.appointmentId = a.id AND pa.personId = p.id AND a.date >= '" +
      firstDay +
      "' AND a.date <= '" +
      lastDay +
      "'" +
      " THEN TIMESTAMPDIFF(minute, a.startTime, a.endTime) ELSE 0 END) " +
      " FROM appointments a, personappointments pa, roles r, personroles pr WHERE pr.roleId = r.id AND pa.personId = p.id AND pr.personId = p.id AND r.groupId = " +
      groupId +
      " AND r.type = 'Tutor' ) AS hours, " +
      " (SELECT COUNT(DISTINCT IF(a.groupId = " +
      groupId +
      " AND pa.appointmentId = a.id AND pa.personId = p.id AND a.date >= '" +
      firstDay +
      "' AND a.date <= '" +
      lastDay +
      "', a.id,  NULL)) " +
      " FROM appointments a, personappointments pa, roles r, personroles pr WHERE pr.roleId = r.id AND pa.personId = p.id AND pr.personId = p.id AND r.groupId = " +
      groupId +
      " AND r.type = 'Tutor') AS apptCount , " +
      " (SELECT SUM(CASE WHEN a.groupId = " +
      groupId +
      " AND pa.appointmentId = a.id AND pa.personId = p.id AND ((a.status = 'booked' AND a.type = 'Private') OR " +
      " (a.status = 'available' AND a.type = 'Group' AND (SELECT COUNT(spa.id) FROM roles AS sr, personroles as spr, personappointments as spa WHERE a.groupId = " +
      groupId +
      " AND spr.roleId = sr.id AND spr.personId = spa.personId AND spa.id = a.id AND " +
      " sr.groupId = " +
      groupId +
      " AND sr.type = 'Student' AND a.date >= '" +
      firstDay +
      "' AND a.date <= '" +
      lastDay +
      "') > 0) OR (a.status = 'complete')) AND a.date >= '" +
      firstDay +
      "' AND a.date <= '" +
      lastDay +
      "' THEN TIMESTAMPDIFF(minute, a.startTime, a.endTime) ELSE 0 END) " +
      " FROM appointments a, personappointments pa, roles r, personroles pr WHERE pr.roleId = r.id AND pa.personId = p.id AND pr.personId = p.id AND r.groupId = " +
      groupId +
      " and r.type = 'Tutor') AS payingHours  " +
      " FROM roles as r, people as p, personroles as pr WHERE pr.roleId = r.id AND p.id = pr.personId AND r.groupId = " +
      groupId +
      " AND r.type = 'Tutor' ORDER BY p.lName ASC, p.fName ASC;",
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  ));
};

exports.findFirstTutorForAppointment = async (appointmentId) => {
  return await Person.findAll({
    include: [
      {
        model: PersonAppointment,
        as: "personappointment",
        required: true,
        where: { isTutor: true },
        include: [
          {
            model: Appointment,
            as: "appointment",
            required: true,
            where: { "$personappointment->appointment.id$": appointmentId },
          },
        ],
      },
    ],
    order: [
      ["lName", "ASC"],
      ["fName", "ASC"],
    ],
  });
};

exports.findFirstStudentForAppointment = async (appointmentId) => {
  return await Person.findAll({
    include: [
      {
        model: PersonAppointment,
        as: "personappointment",
        required: true,
        where: { isTutor: false },
        include: [
          {
            model: Appointment,
            as: "appointment",
            required: true,
            where: { "$personappointment->appointment.id$": appointmentId },
          },
        ],
      },
    ],
    order: [
      ["lName", "ASC"],
      ["fName", "ASC"],
    ],
  });
};

exports.findOnePersonByEmail = async (email) => {
  return await Person.findOne({
    where: {
      email: email,
    },
  });
};

exports.findOnePersonByPhoneNumber = async (phoneNumber) => {
  return await Person.findOne({
    where: {
      phoneNum: phoneNumber,
    },
  });
};

exports.findOnePerson = async (id) => {
  return await Person.findByPk(id);
};

exports.updatePerson = async (person, id) => {
  return await Person.update(person, {
    where: { id: id },
  });
};

exports.deletePerson = async (id) => {
  return await Person.destroy({
    where: { id: id },
  });
};

exports.deleteAllPeople = async () => {
  return await Person.destroy({
    where: {},
    truncate: false,
  });
};
