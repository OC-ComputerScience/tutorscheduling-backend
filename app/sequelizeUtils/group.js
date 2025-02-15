const db = require("../models");
const Group = db.group;
const Role = db.role;
const Appointment = db.appointment;
const Person = db.person;
const PersonAppointment = db.personappointment;
const PersonRole = db.personrole;
const Topic = db.topic;
const PersonTopic = db.persontopic;
const Op = db.Sequelize.Op;

exports.createGroup = async (groupData) => {
  if (groupData.name === undefined) {
    const error = new Error("Name cannot be empty for group!");
    error.statusCode = 400;
    throw error;
  }

  // make sure we don't create a duplicate value
  let existingGroup = await this.findGroupByName(groupData.name);

  if (existingGroup[0] !== undefined) {
    return existingGroup[0].dataValues;
  } else {
    // Create a Group
    const group = {
      id: groupData.id,
      name: groupData.name,
      description: groupData.description,
      timeInterval: groupData.timeInterval ? groupData.timeInterval : 30,
      minApptTime: groupData.minApptTime ? groupData.minApptTime : 30,
      bookPastMinutes: groupData.bookPastMinutes
        ? groupData.bookPastMinutes
        : 0,
      allowSplittingAppointments: groupData.allowSplittingAppointments
        ? groupData.allowSplittingAppointments
        : true,
      status: groupData.status ? groupData.status : "active",
    };
    // Save Group in the database
    return await Group.create(group);
  }
};

exports.findAllGroups = async () => {
  return await Group.findAll({ 
    where: { status: "active" },
    order: [["name", "ASC"]] });
};

exports.findGroupsForPerson = async (personId) => {
  return await Group.findAll({
    include: [
      {
        model: Role,
        include: [
          {
            where: {
              [Op.and]: [
                { "$role->personrole.personId$": personId }, 
                {status: ["approved" ,"disabled", "applied"]},
              ]
            },
            
            model: PersonRole,
            as: "personrole",
            required: true,
          },
        ],
        as: "role",
        required: true,
      },
    ],
    order: [
      ["name", "ASC"],
      [db.sequelize.literal("FIELD(role.type,'Admin','Tutor','Student')")],
    ],
  });
};

exports.findActiveGroupsForPerson = async (personId) => {
  return await Group.findAll({
    include: [
      {
        model: Role,
        include: [
          {
            where: {
              "$role->personrole.personId$": personId,
              status: ['approved','pending']
            },
            model: PersonRole,
            as: "personrole",
            required: true,
          },
        ],
        as: "role",
        required: true,
      },
    ],
    order: [["name", "ASC"]],
  });
};

exports.findGroupsWithMissingContractsForPerson = async (personId) => {
  return await Group.findAll({
    include: [
      {
        model: Role,
        as: "role",
        required: true,
        include: [
          {
            where: {
              "$role->personrole.personId$": personId,
              "$role->personrole.agree$": false,
            },
            model: PersonRole,
            as: "personrole",
            required: true,
          },
        ],
      },
    ],
    order: [["name", "ASC"]],
  });
};

exports.findGroupsWithMissingTopicsForTutor = async (personId) => {
  return await Group.findAll({
    include: [
      {
        model: Topic,
        include: [
          {
            where: { "$topic->persontopic.personId$": personId },
            model: PersonTopic,
            as: "persontopic",
            required: true,
          },
        ],
        as: "topic",
        required: false,
      },
      {
        model: Role,
        include: [
          {
            where: { "$role->personrole.personId$": personId },
            model: PersonRole,
            as: "personrole",
            required: true,
          },
        ],
        as: "role",
        where: { "$role.type$": "Tutor" },
        required: true,
      },
    ],
    order: [["name", "ASC"]],
  });
};

exports.findPassedAppointmentsByGroupAndRole = async () => {
  let date = new Date();
  let endTime = date.toLocaleTimeString("it-IT");
  date.setHours(date.getHours() - date.getTimezoneOffset() / 60);
  date.setHours(0, 0, 0);
  return await Group.findAll({
    include: [
      {
        model: Role,
        as: "role",
        where: { "$role.type$": { [Op.ne]: "Admin" } },
        required: true,
        include: [
          {
            model: PersonRole,
            as: "personrole",
            required: true,
            include: [
              {
                model: Person,
                as: "person",
                required: true,
                include: [
                  {
                    model: PersonAppointment,
                    as: "personappointment",
                    required: true,
                    where: {
                      feedbacktext: null,
                      isTutor: [
                        db.sequelize.literal("IF(role.type = 'Tutor', 1, 0)"),
                      ],
                    },
                    include: [
                      {
                        model: Appointment,
                        as: "appointment",
                        required: true,
                        where: {
                          groupId: [db.sequelize.literal("`group`.`id`")],
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
                                {
                                  status: [
                                    db.sequelize.literal(
                                      "IF(role.type = 'Student' , 'complete', false)"
                                    ),
                                  ],
                                },
                                {
                                  status: [
                                    db.sequelize.literal(
                                      "IF(role.type = 'Tutor', 'pending', false)"
                                    ),
                                  ],
                                },
                                {
                                  status: [
                                    db.sequelize.literal(
                                      "IF(role.type = 'Tutor', 'booked', false)"
                                    ),
                                  ],
                                },
                                {
                                  status: [
                                    db.sequelize.literal(
                                      "IF(role.type = 'Tutor' and  `role->personrole->person->personappointment->appointment`.`type` = 'Group', 'available', false)"
                                    ),
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    order: [["name", "ASC"]],
  });
};

exports.findGroupByName = async (name) => {
  return await Group.findAll({
    where: { name: name },
    order: [["name", "ASC"]],
  });
};

exports.findOneGroup = async (id) => {
  return await Group.findByPk(id);
};

exports.updateGroup = async (group, id) => {
  return await Group.update(group, {
    where: { id: id },
  });
};

exports.deleteGroup = async (id) => {
  return await Group.destroy({
    where: { id: id },
  });
};

exports.deleteAllGroups = async () => {
  return await Group.destroy({
    where: {},
    truncate: false,
  });
};
