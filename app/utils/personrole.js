const db = require("../models");
const PersonRole = db.personrole;
const Role = db.role;
const Group = db.group;

exports.createPersonRole = async (personRoleData) => {
  // Create a personrole
  const personrole = {
    id: personRoleData.id,
    personId: personRoleData.personId,
    roleId: personRoleData.roleId,
    status: personRoleData.status,
    agree: personRoleData.agree,
    dateSigned: personRoleData.dakmteSigned,
  };

  // Save personrole in the database
  return await PersonRole.create(personrole)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllPersonRoles = async () => {
  return await PersonRole.findAll({ include: ["person"] })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllPersonRolesForPerson = async (personId) => {
  return await PersonRole.findAll({ where: { personId: personId } })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
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
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findOneForPersonForRole = async (personId, roleId) => {
  return await PersonRole.findAll({
    where: { personId: personId, roleId: roleId },
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findOnePersonRole = async (id) => {
  return await PersonRole.findByPk(id)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.updatePersonRole = async (personrole, id) => {
  return await PersonRole.update(personrole, {
    where: { id: id },
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.deletePersonRole = async (id) => {
  return await PersonRole.destroy({
    where: { id: id },
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.deleteAllPersonRoles = async () => {
  return await PersonRole.destroy({
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
