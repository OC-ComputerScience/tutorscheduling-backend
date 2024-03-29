module.exports = (sequelize, Sequelize) => {
  const Appointment = sequelize.define("appointment", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    date: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    startTime: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    endTime: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    URL: {
      type: Sequelize.STRING,
    },
    preSessionInfo: {
      type: Sequelize.STRING,
    },
    googleEventId: {
      type: Sequelize.STRING,
    },
  });

  return Appointment;
};
