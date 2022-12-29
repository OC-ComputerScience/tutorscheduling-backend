const db = require("../models");
const Role = db.role;
const Person = db.person;
const PersonRole = db.personrole;
const PersonRolePrivilege = db.personroleprivilege;

exports.createRole = async (roleData) => {
  // Create a role
  const role = {
    id: roleData.id,
    groupId: roleData.groupId,
    type: roleData.type,
  };

  // Save role in the database
  return await Role.create(role)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllRoles = async () => {
  return await Role.findAll({
    include: ["group"],
    order: [["type", "ASC"]],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllRolesForGroup = async (groupId) => {
  return await Role.findAll({
    where: { groupId: groupId },
    order: [["type", "ASC"]],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
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
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
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
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
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
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
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
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findOneRole = async (id) => {
  return await Role.findByPk(id)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.updateRole = async (role, id) => {
  return await Role.update(role, {
    where: { id: id },
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.deleteRole = async (id) => {
  return await Role.destroy({
    where: { id: id },
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.deleteAllRoles = async () => {
  return await Role.destroy({
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
