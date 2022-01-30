module.exports = (sequelize, Sequelize) => {
    const Topic = sequelize.define("topic", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      abbr: {
        type: Sequelize.STRING
      }
    });
  
    return Topic;
};