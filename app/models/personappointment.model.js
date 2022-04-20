module.exports = (sequelize, Sequelize) => {
    const PersonAppointment = sequelize.define("personappointment", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      isTutor: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
    });
  
    return PersonAppointment;
};