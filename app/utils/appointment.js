const db = require("../models");
const Appointment = db.appointment;
const PersonAppointment = db.personappointment;
const Person = db.person;
const Group = db.group;
const Location = db.location;
const Topic = db.topic;
const PersonTopic = db.persontopic;
const Op = db.Sequelize.Op;
const Time = require("./timeFunctions.js");

exports.createAppointment = async (appointmentData) => {
  if (!appointmentData.date) {
    const error = new Error("Date cannot be empty for appointment!");
    error.statusCode = 400;
    throw error;
  } else if (!appointmentData.startTime) {
    const error = new Error("Start time cannot be empty for appointment!");
    error.statusCode = 400;
    throw error;
  } else if (!appointmentData.endTime) {
    const error = new Error("End time cannot be empty for appointment!");
    error.statusCode = 400;
    throw error;
  } else if (!appointmentData.type) {
    const error = new Error("Type cannot be empty for appointment!");
    error.statusCode = 400;
    throw error;
  } else if (!appointmentData.status) {
    const error = new Error("Status cannot be empty for appointment!");
    error.statusCode = 400;
    throw error;
  }

  // Create a Appointment
  const appointment = {
    id: appointmentData.id,
    date: appointmentData.date,
    startTime: appointmentData.startTime,
    endTime: appointmentData.endTime,
    type: appointmentData.type,
    status: appointmentData.status,
    tutorStart: appointmentData.tutorStart,
    tutorEnd: appointmentData.tutorEnd,
    URL: appointmentData.URL,
    preSessionInfo: appointmentData.preSessionInfo,
    googleEventId: appointmentData.googleEventId,
    groupId: appointmentData.groupId,
    locationId: appointmentData.locationId,
    topicId: appointmentData.topicId,
  };

  // Save Appointment in the database
  return await Appointment.create(appointment);
};

exports.findAllAppointments = async () => {
  return await Appointment.findAll({
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
  });
};

exports.findAllToDeleteForGroup = async (group) => {
  let delDate = new Date().setHours(0, 0, 0);
  let delTime = new Date().toLocaleTimeString("it-IT");
  let delTimePlusBuffer = Time.subtractMinsFromTime(
    group.bookPastMinutes,
    delTime
  );
  console.log(delTimePlusBuffer);

  // here we are finding private available and group available with no students

  return await Appointment.findAll({
    where: {
      [Op.or]: [
        { type: "Private" },
        {
          [Op.and]: [
            { type: "Group" },
            {
              id: {
                [Op.in]: db.sequelize.literal(
                  "(SELECT COUNT(spa.id) FROM roles AS sr, personroles as spr, personappointments as spa, appointments a WHERE spr.roleId = sr.id AND spr.personId = spa.personId AND spa.id = a.id AND sr.type = 'Student') = 0"
                ),
              },
            },
          ],
        },
      ],
      status: "available",
      date: { [Op.eq]: delDate },
      startTime: { [Op.lt]: delTimePlusBuffer },
      groupId: group.id,
    },
    include: [
      {
        model: Group,
        as: "group",
        required: true,
        where: { id: group.id },
      },
    ],
  });
};

exports.findAllNeedingGoogleId = async () => {
  return await Appointment.findAll({
    where: {
      googleEventId: null,
      [Op.or]: [{ status: "booked" }, { type: "Group" }],
    },
  });
};

exports.findAllWithGoogleId = async () => {
  return await Appointment.findAll({
    where: {
      googleEventId: {
        [Op.ne]: null,
      },
    },
    include: [
      {
        model: Location,
        as: "location",
        required: true,
      },
      {
        model: Topic,
        as: "topic",
        required: true,
      },
      {
        model: PersonAppointment,
        as: "personappointment",
        required: true,
        include: [
          {
            model: Person,
            as: "person",
            required: true,
            right: true,
          },
        ],
      },
    ],
  });
};

exports.findAllAppointmentsForGroup = async (groupId) => {
  return await Appointment.findAll({
    where: { groupId: groupId },
    include: [
      {
        model: Location,
        as: "location",
        required: false,
      },
      {
        model: Topic,
        as: "topic",
        required: false,
      },
      {
        model: PersonAppointment,
        as: "personappointment",
        required: true,
        include: [
          {
            model: Person,
            as: "person",
            required: true,
            right: true,
            include: [
              {
                model: PersonTopic,
                as: "persontopic",
                required: false,
                include: [
                  {
                    model: Topic,
                    as: "topic",
                    required: true,
                    right: true,
                    where: { groupId: groupId },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
  });
};

exports.findAllUpcomingForGroup = async (groupId) => {
  const date = new Date();

  return await Appointment.findAll({
    where: { groupId: groupId, date: { [Op.gte]: date } },
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
  });
};

exports.findAllAppointmentsFromOneMonthAgoForGroup = async (groupId) => {
  var oneMonthAgo = new Date(
    new Date().getFullYear(),
    new Date().getMonth() - 1,
    new Date().getDate()
  );
  return await Appointment.findAll({
    where: { groupId: groupId, date: { [Op.gt]: oneMonthAgo } },
    include: [
      {
        model: Location,
        as: "location",
        required: false,
      },
      {
        model: Topic,
        as: "topic",
        required: false,
      },
      {
        model: PersonAppointment,
        as: "personappointment",
        required: true,
        include: [
          {
            model: Person,
            as: "person",
            required: true,
            right: true,
            include: [
              {
                model: PersonTopic,
                as: "persontopic",
                required: false,
                include: [
                  {
                    model: Topic,
                    as: "topic",
                    required: true,
                    right: true,
                    where: { groupId: groupId },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
  });
};

exports.findAllForPerson = async (personId) => {
  return await Appointment.findAll({
    include: [
      {
        where: { "$personappointment.personId$": personId },
        model: PersonAppointment,
        as: "personappointment",
        required: true,
      },
    ],
  });
};

exports.findAllUpcomingForPerson = async (personId) => {
  const date = new Date();
  date.setHours(date.getHours() - date.getTimezoneOffset() / 60);
  date.setHours(0, 0, 0, 0);

  let checkTime = new Date();
  checkTime =
    checkTime.getHours() +
    ":" +
    checkTime.getMinutes() +
    ":" +
    checkTime.getSeconds();

  return await Appointment.findAll({
    where: {
      [Op.or]: [
        {
          [Op.and]: [
            { startTime: { [Op.gte]: checkTime } },
            { date: { [Op.eq]: date } },
          ],
        },
        {
          date: { [Op.gt]: date },
        },
      ],
      [Op.and]: [
        {
          status: { [Op.not]: "studentCancel" },
        },
        {
          status: { [Op.not]: "tutorCancel" },
        },
      ],
    },
    include: [
      {
        where: { "$personappointment.personId$": personId },
        model: PersonAppointment,
        as: "personappointment",
        required: true,
      },
    ],
  });
};

exports.findAllUpcomingForPersonForGroup = async (
  checkTime,
  groupId,
  personId
) => {
  const date = new Date();
  date.setHours(date.getHours() - date.getTimezoneOffset() / 60);
  date.setHours(0, 0, 0, 0);

  return await Appointment.findAll({
    where: {
      groupId: groupId,
      [Op.or]: [
        {
          [Op.and]: [
            { startTime: { [Op.gte]: checkTime } },
            { date: { [Op.eq]: date } },
          ],
        },
        {
          date: { [Op.gt]: date },
        },
      ],
      [Op.and]: [
        {
          status: { [Op.not]: "studentCancel" },
        },
        {
          status: { [Op.not]: "tutorCancel" },
        },
      ],
    },
    include: [
      {
        model: Location,
        as: "location",
        required: false,
      },
      {
        model: Topic,
        as: "topic",
        required: false,
      },
      {
        model: PersonAppointment,
        as: "personappointment",
        required: true,
        include: [
          {
            model: Person,
            as: "person",
            required: true,
            right: true,
            where: { id: personId },
          },
        ],
      },
    ],
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
  });
};

exports.findAllPassedForTutorForGroup = async (groupId, personId) => {
  let endTime = date.toLocaleTimeString("it-IT");
  date.setHours(date.getHours() - date.getTimezoneOffset() / 60);
  date.setHours(0, 0, 0);

  return await Appointment.findAll({
    where: {
      groupId: groupId,
      [Op.and]: [
        { status: { [Op.notLike]: "tutorCancel" } },
        { status: { [Op.notLike]: "studentCancel" } },
      ],
      [Op.and]: [
        {
          [Op.or]: [
            { date: { [Op.lt]: date } },
            {
              [Op.and]: [
                { date: { [Op.eq]: date } },
                { endTime: { [Op.lt]: endTime } },
              ],
            },
          ],
        },
        {
          [Op.or]: [
            { status: { [Op.like]: "booked" } },
            { type: { [Op.like]: "Group" } },
          ],
        },
      ],
    },
    include: [
      {
        where: {
          "$personappointment.personId$": personId,
          feedbacknumber: { [Op.eq]: null },
          feedbacktext: { [Op.eq]: null },
        },
        model: PersonAppointment,
        as: "personappointment",
        required: true,
      },
    ],
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
  });
};

exports.findAllPassedForStudentForGroup = async (groupId, personId) => {
  const date = new Date();

  return await Appointment.findAll({
    where: {
      groupId: groupId,
      date: { [Op.lte]: date },
      status: { [Op.like]: "complete" },
    },
    include: [
      {
        where: {
          "$personappointment.personId$": personId,
          feedbacknumber: { [Op.eq]: null },
          feedbacktext: { [Op.eq]: null },
        },
        model: PersonAppointment,
        as: "personappointment",
        required: true,
      },
    ],
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
  });
};

exports.findAllForPersonForGroup = async (groupId, personId) => {
  return await Appointment.findAll({
    where: { groupId: groupId },
    include: [
      {
        where: { "$personappointment.personId$": personId },
        model: PersonAppointment,
        as: "personappointment",
        required: true,
      },
      {
        model: Topic,
        as: "topic",
        required: true,
      },
    ],
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
  });
};

exports.findFeedbackApptForPerson = async (id) => {
  return await Appointment.findAll({
    where: { id: id },
    include: [
      {
        model: Location,
        as: "location",
        required: true,
      },
      {
        model: Topic,
        as: "topic",
        required: true,
      },
      {
        model: Group,
        as: "group",
        required: true,
      },
      {
        model: PersonAppointment,
        as: "personappointment",
        required: true,
        include: [
          {
            model: Person,
            as: "person",
            required: true,
            right: true,
          },
        ],
      },
    ],
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
  });
};

exports.getAppointmentHours = async (groupId, currWeek) => {
  var week = Time.getWeekFromDate(currWeek);
  var firstDay = week.first;
  var lastDay = week.last;

  return await Appointment.findAll({
    where: {
      groupId: groupId,
      [Op.and]: [
        { date: { [Op.gte]: firstDay } },
        { date: { [Op.lte]: lastDay } },
      ],
    },
    attributes: [
      [db.sequelize.literal("COUNT(id)"), "count"],
      [
        db.sequelize.literal("SUM(TIMESTAMPDIFF(minute,startTime,endTime))"),
        "hours",
      ],
      [
        db.sequelize.literal(
          "SUM(CASE WHEN status = 'available' AND type = 'Private' THEN TIMESTAMPDIFF(minute,startTime,endTime) ELSE 0 END)"
        ),
        "available",
      ],
      [
        db.sequelize.literal(
          "SUM(CASE WHEN status = 'available' AND type = 'Group' THEN TIMESTAMPDIFF(minute,startTime,endTime) ELSE 0 END)"
        ),
        "group",
      ],
      [
        db.sequelize.literal(
          "SUM(CASE WHEN status = 'pending' THEN TIMESTAMPDIFF(minute,startTime,endTime) ELSE 0 END)"
        ),
        "pending",
      ],
      [
        db.sequelize.literal(
          "SUM(CASE WHEN status = 'booked' THEN TIMESTAMPDIFF(minute,startTime,endTime) ELSE 0 END)"
        ),
        "booked",
      ],
      [
        db.sequelize.literal(
          "SUM(CASE WHEN status = 'complete' THEN TIMESTAMPDIFF(minute,startTime,endTime) ELSE 0 END)"
        ),
        "complete",
      ],
      [
        db.sequelize.literal(
          "SUM(CASE WHEN status = 'no-show' THEN TIMESTAMPDIFF(minute,startTime,endTime) ELSE 0 END)"
        ),
        "noshow",
      ],
    ],
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
  });
};

exports.findOneAppointmentInfo = async (id) => {
  return await Appointment.findAll({
    where: { id: id },
    include: [
      {
        model: Location,
        as: "location",
        required: true,
      },
      {
        model: Topic,
        as: "topic",
        required: true,
      },
      {
        model: PersonAppointment,
        as: "personappointment",
        required: true,
        include: [
          {
            model: Person,
            as: "person",
            required: true,
            right: true,
            include: [
              {
                model: PersonTopic,
                as: "persontopic",
                required: false,
                include: [
                  {
                    model: Topic,
                    as: "topic",
                    required: true,
                    right: true,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
  });
};

exports.findRawAppointmentInfo = async (id) => {
  return await Appointment.findAll({
    where: { id: id },
    include: [
      {
        model: Location,
        as: "location",
        required: true,
      },
      {
        model: Topic,
        as: "topic",
        required: true,
      },
      {
        model: Group,
        as: "group",
        required: true,
      },
      {
        model: PersonAppointment,
        as: "personappointment",
        required: true,
        include: [
          {
            model: Person,
            as: "person",
            required: true,
            right: true,
          },
        ],
      },
    ],
    raw: true,
    nest: true,
  });
};

exports.findOneAppointment = async (id) => {
  return await Appointment.findByPk(id);
};

exports.updateAppointment = async (appointment, id) => {
  return await Appointment.update(appointment, {
    where: { id: id },
  });
};

exports.deleteAppointment = async (id) => {
  return await Appointment.destroy({
    where: { id: id },
  });
};

exports.deleteAllAppointments = async () => {
  return await Appointment.destroy({
    where: {},
    truncate: false,
  });
};
