const db = require("../models");
const PersonRolePrivilege = db.personroleprivilege;

exports.createPrivilege = async (personRolePrivilegeData) => {
  // Create a personroleprivilege
  const personroleprivilege = {
    id: personRolePrivilegeData.id,
    personroleId: personRolePrivilegeData.personroleId,
    privilege: personRolePrivilegeData.privilege,
  };

  // Save personroleprivilege in the database
  return await PersonRolePrivilege.create(personroleprivilege)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllPrivileges = async () => {
  return await PersonRolePrivilege.findAll({
    include: ["person"],
    order: [["privilege", "ASC"]],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findPrivilegeByPersonRole = async (personRoleId) => {
  return await PersonRolePrivilege.findAll({
    where: { personroleId: personRoleId },
    order: [["privilege", "ASC"]],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findOnePrivilege = async (id) => {
  return await PersonRolePrivilege.findByPk(id)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.updatePrivilege = async (privilege, id) => {
  return await PersonRolePrivilege.update(privilege, {
    where: { id: id },
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.deletePrivilege = async (id) => {
  return await PersonRolePrivilege.destroy({
    where: { id: id },
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.deleteAllPrivileges = async () => {
  return await PersonRolePrivilege.destroy({
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
