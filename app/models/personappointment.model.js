module.exports = (sequelize, Sequelize) => {
  const PersonAppointment = sequelize.define("personappointment", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    isTutor: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
    feedbacknumber: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    feedbacktext: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  });

  return PersonAppointment;
};
