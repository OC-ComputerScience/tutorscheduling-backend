const PersonRolePrivilege = require( "../sequelizeUtils/personroleprivilege.js");
const PersonTopic = require("../sequelizeUtils/persontopic.js");
const PersonRole = require("../sequelizeUtils/personrole.js");


exports.disablePersonRole = async (personrole) => {
  console.log(personrole);
  await PersonRolePrivilege.deletePrivilegesForPersonRole(personrole.id);
  await PersonTopic.disablePersonTopicsForGroup(
    personrole.personId,
    personrole.groupId
  );
  await PersonRole.updatePersonRole(personrole, personrole.id);
};
