module.exports = (sequelize, Sequelize) => {
    const Group = sequelize.define("group", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING
      },
      timeInterval: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    });
  
    return Group;
};
