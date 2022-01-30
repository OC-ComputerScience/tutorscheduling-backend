module.exports = (sequelize, Sequelize) => {
    const Location = sequelize.define("location", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      openDateTime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      building: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING
      }
    });
  
    return Location;
};