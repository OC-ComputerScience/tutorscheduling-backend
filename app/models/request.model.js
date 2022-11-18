module.exports = (sequelize, Sequelize) => {
  const Request = sequelize.define("request", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    courseNum: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
    },
    problem: {
      type: Sequelize.STRING,
    },
  });

  return Request;
};
