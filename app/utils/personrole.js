const db = require("../models");
const PersonRole = db.personrole;
const Role = db.role;
const Group = db.group;

exports.createPersonRole = async (personRoleData) => {
  if (personRoleData.personId === undefined) {
    const error = new Error("Person ID cannot be empty for person role!");
    error.statusCode = 400;
    throw error;
  } else if (personRoleData.roleId === undefined) {
    const error = new Error("Role ID cannot be empty for person role!");
    error.statusCode = 400;
    throw error;
  }

  // make sure we don't create a duplicate value
  let existingPersonRole = await this.findOneForPersonForRole(
    personRoleData.personId,
    personRoleData.roleId
  );

  if (existingPersonRole[0] !== undefined) {
    return existingPersonRole[0].dataValues;
  } else {
    // Create a personrole
    const personrole = {
      id: personRoleData.id,
      status: personRoleData.status ? personRoleData.status : "applied",
      agree: personRoleData.agree ? personRoleData.agree : false,
      dateSigned: personRoleData.dateSigned,
      personId: personRoleData.personId,
      roleId: personRoleData.roleId,
    };

    // Save personrole in the database
    return await PersonRole.create(personrole);
  }
};

exports.findAllPersonRoles = async () => {
  return await PersonRole.findAll({ include: ["person"] });
};

exports.findAllPersonRolesForPerson = async (personId) => {
  return await PersonRole.findAll({ where: { personId: personId } });
};

exports.findGroupByPersonRole = async (id) => {
  return await PersonRole.findAll({
    where: { id: id },
    include: [
      {
        model: Role,
        include: [
          {
            model: Group,
            as: "group",
            required: true,
          },
        ],
        as: "role",
        required: true,
      },
    ],
  });
};

exports.findOneForPersonForRole = async (personId, roleId) => {
  return await PersonRole.findAll({
    where: { personId: personId, roleId: roleId },
  });
};

exports.findOnePersonRole = async (id) => {
  return await PersonRole.findByPk(id);
};

exports.updatePersonRole = async (personrole, id) => {
  return await PersonRole.update(personrole, {
    where: { id: id },
  });
};

exports.deletePersonRole = async (id) => {
  return await PersonRole.destroy({
    where: { id: id },
  });
};

exports.deleteAllPersonRoles = async () => {
  return await PersonRole.destroy({
    where: {},
    truncate: false,
  });
};
