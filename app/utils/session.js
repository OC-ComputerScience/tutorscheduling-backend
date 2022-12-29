const db = require("../models");
const Session = db.session;

exports.createSession = async (sessionData) => {
  // Create a session
  const session = {
    id: sessionData.id,
    token: sessionData.token,
    email: sessionData.email,
    personId: sessionData.person.id,
    expirationDate: sessionData.tempExpirationDate,
  };

  // Save session in the database
  return await Session.create(session)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllSessions = async () => {
  return await Session.findAll()
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findOneSession = async (id) => {
  return await Session.findByPk(id)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.updateSession = async (session, id) => {
  return await Session.update(session, {
    where: { id: id },
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.deleteSession = async (token) => {
  return await Session.destroy({
    where: { token: token },
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.deleteAllSessions = async () => {
  return await Session.destroy({
    where: {},
    truncate: false,
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};
