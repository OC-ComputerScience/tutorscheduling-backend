const db = require("../models");
const Role = db.role;
const Person = db.person;
const PersonRole = db.personrole;
const PersonRolePrivilege = db.personroleprivilege;

exports.createRole = async (roleData) => {
  if (!roleData.type) {
    const error = new Error("Type cannot be empty for role!");
    error.statusCode = 400;
    throw error;
  }

  // Create a role
  const role = {
    id: roleData.id,
    type: roleData.type,
    groupId: roleData.groupId,
  };

  // Save role in the database
  return await Role.create(role);
};

exports.findAllRoles = async () => {
  return await Role.findAll({
    include: ["group"],
    order: [["type", "ASC"]],
  });
};

exports.findAllRolesForGroup = async (groupId) => {
  return await Role.findAll({
    where: { groupId: groupId },
    order: [["type", "ASC"]],
  });
};

exports.findRolesForPersonForGroup = async (groupId, personId) => {
  return await Role.findAll({
    where: { "$personrole.personId$": personId, groupId: groupId },
    include: [
      {
        model: PersonRole,
        as: "personrole",
        right: true,
        include: [
          {
            model: PersonRolePrivilege,
            as: "personroleprivilege",
          },
        ],
      },
    ],
  });
};

exports.findRolesForTypeForGroup = async (groupId, type) => {
  return await Role.findAll({
    where: { type: type, groupId: groupId },
    include: [
      {
        model: PersonRole,
        as: "personrole",
        right: true,
        include: [
          {
            model: PersonRolePrivilege,
            as: "personroleprivilege",
          },
          {
            model: Person,
            as: "person",
            right: true,
          },
        ],
      },
    ],
  });
};

exports.findRolesForPerson = async (personId) => {
  return await Role.findAll({
    where: { "$personrole.personId$": personId },
    include: [
      {
        model: PersonRole,
        as: "personrole",
        right: true,
      },
    ],
  });
};

exports.findIncompleteRolesForPerson = async (personId) => {
  return await Role.findAll({
    where: { "$personrole.personId$": personId, "$personrole.agree$": false },
    include: [
      {
        model: PersonRole,
        as: "personrole",
        right: true,
      },
    ],
  });
};

exports.findOneRole = async (id) => {
  return await Role.findByPk(id);
};

exports.updateRole = async (role, id) => {
  return await Role.update(role, {
    where: { id: id },
  });
};

exports.deleteRole = async (id) => {
  return await Role.destroy({
    where: { id: id },
  });
};

exports.deleteAllRoles = async () => {
  return await Role.destroy({
    where: {},
    truncate: false,
  });
};
