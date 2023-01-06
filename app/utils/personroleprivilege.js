const db = require("../models");
const PersonRolePrivilege = db.personroleprivilege;

exports.createPrivilege = async (personRolePrivilegeData) => {
  if (!personRolePrivilegeData.privilege) {
    const error = new Error(
      "Privilege cannot be empty for person role privilege!"
    );
    error.statusCode = 400;
    throw error;
  }

  // Create a personroleprivilege
  const personroleprivilege = {
    id: personRolePrivilegeData.id,
    privilege: personRolePrivilegeData.privilege,
    personroleId: personRolePrivilegeData.personroleId,
  };

  // Save personroleprivilege in the database
  return await PersonRolePrivilege.create(personroleprivilege);
};

exports.findAllPrivileges = async () => {
  return await PersonRolePrivilege.findAll({
    include: ["person"],
    order: [["privilege", "ASC"]],
  });
};

exports.findPrivilegeByPersonRole = async (personRoleId) => {
  return await PersonRolePrivilege.findAll({
    where: { personroleId: personRoleId },
    order: [["privilege", "ASC"]],
  });
};

exports.findOnePrivilege = async (id) => {
  return await PersonRolePrivilege.findByPk(id);
};

exports.updatePrivilege = async (privilege, id) => {
  return await PersonRolePrivilege.update(privilege, {
    where: { id: id },
  });
};

exports.deletePrivilege = async (id) => {
  return await PersonRolePrivilege.destroy({
    where: { id: id },
  });
};

exports.deletePrivilegesForPersonRole = async (personRoleId) => {
  return await PersonRolePrivilege.destroy({
    where: { personRoleId: personRoleId },
    truncate: false,
  });
};

exports.deleteAllPrivileges = async () => {
  return await PersonRolePrivilege.destroy({
    where: {},
    truncate: false,
  });
};
