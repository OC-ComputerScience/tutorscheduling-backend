const db = require("../models");
const Group = db.group;
const Role = db.role;
const PersonRole = db.personrole;
const Topic = db.topic;
const PersonTopic = db.persontopic;

exports.createGroup = async (groupData) => {
  if (!groupData.name) {
    const error = new Error("Name cannot be empty for group!");
    error.statusCode = 400;
    throw error;
  }

  // Create a Group
  const group = {
    id: groupData.id,
    name: groupData.name,
    description: groupData.description,
    timeInterval: groupData.timeInterval ? groupData.timeInterval : 30,
    minApptTime: groupData.minApptTime ? groupData.minApptTime : 30,
    bookPastMinutes: groupData.bookPastMinutes ? groupData.bookPastMinutes : 0,
    allowSplittingAppointments: groupData.allowSplittingAppointments
      ? groupData.allowSplittingAppointments
      : true,
  };

  // Save Group in the database
  return await Group.create(group)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllGroups = async () => {
  return await Group.findAll({ order: [["name", "ASC"]] });
};

exports.findGroupsForPerson = async (personId) => {
  return await Group.findAll({
    include: [
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
        required: true,
      },
    ],
    order: [["name", "ASC"]],
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
              status: { [Op.ne]: "disabled" },
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
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
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
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
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
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findGroupByName = async (name) => {
  return await Group.findAll({
    where: { name: name },
    order: [["name", "ASC"]],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findOneGroup = async (id) => {
  return await Group.findByPk(id)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.updateGroup = async (group, id) => {
  return await Group.update(group, {
    where: { id: id },
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.deleteGroup = async (id) => {
  return await Group.destroy({
    where: { id: id },
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.deleteAllGroups = async () => {
  return await Group.destroy({
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
