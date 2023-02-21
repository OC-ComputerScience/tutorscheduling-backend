const db = require("../models");
const Session = db.session;
const Op = db.Sequelize.Op;

exports.createSession = async (sessionData) => {
  if (!sessionData.token) {
    const error = new Error("Token cannot be empty for session!");
    error.statusCode = 400;
    throw error;
  } else if (!sessionData.email) {
    const error = new Error("Email cannot be empty for session!");
    error.statusCode = 400;
    throw error;
  } else if (!sessionData.expirationDate) {
    const error = new Error("Expiration date cannot be empty for session!");
    error.statusCode = 400;
    throw error;
  }

  // Create a session
  const session = {
    id: sessionData.id,
    token: sessionData.token,
    email: sessionData.email,
    expirationDate: sessionData.tempExpirationDate,
    personId: sessionData.person.id,
  };

  // Save session in the database
  return await Session.create(session);
};

exports.findAllSessions = async () => {
  return await Session.findAll();
};

exports.findAllSessionsByToken = async (token) => {
  return await Session.findAll({ where: { token: token } });
};

exports.findSessionByEmail = async (email) => {
  return await Session.findAll({
    where: { email: email, token: { [Op.ne]: "" } },
  });
};

exports.findOneSession = async (id) => {
  return await Session.findByPk(id);
};

exports.updateSession = async (session, id) => {
  return await Session.update(session, {
    where: { id: id },
  });
};

exports.deleteSession = async (token) => {
  return await Session.destroy({
    where: { token: token },
  });
};

exports.deleteAllSessions = async () => {
  return await Session.destroy({
    where: {},
    truncate: false,
  });
};
