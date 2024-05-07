module.exports = (sequelize, Sequelize) => {
  const Group = sequelize.define("group", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
    },
    timeInterval: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    minApptTime: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    bookPastMinutes: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    allowSplittingAppointments: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });

  return Group;
};
