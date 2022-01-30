module.exports = (sequelize, Sequelize) => {
    const PersonTopic = sequelize.define("persontopic", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      skillLevel: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
  
    return PersonTopic;
};