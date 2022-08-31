module.exports = (sequelize, Sequelize) => {
    const PersonRolePrivilege = sequelize.define("personroleprivilege", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      privilege: {
        type: Sequelize.STRING(1000),
        allowNull: false
      }
    });
  
    return PersonRolePrivilege;
};
