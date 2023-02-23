const db = require("../models");
const Session = require("../utils/session.js");
const PersonRole = db.personrole;
const Role = db.role;

authenticate = async (req, res, next) => {
  let token = null;
  console.log("authenticate");
  let authHeader = req.get("authorization");
  if (authHeader != null) {
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
      await Session.findAllSessionsByToken(token)
        .then(async (data) => {
          let session = data[0];
          if (session != null) {
            if (session.expirationDate >= Date.now()) {
              next();
              return;
            } else {
              session.token = "";
              // clear session's token if it's expired
              await Session.updateSession(session, session.id);
              return res.status(401).send({
                message: "Unauthorized! Expired Token, Logout and Login again",
              });
            }
          }
          // if session is null, they are also unauthorized
          else {
            return res.status(401).send({
              message: "Unauthorized! No active session found.",
            });
          }
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  } else {
    return res.status(401).send({
      message: "Unauthorized! No authentication header.",
    });
  }
};

isAdmin = async (req, res, next) => {
  let authHeader = req.get("authorization");
  let token = "";
  let roles = [];

  if (authHeader != null) {
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    } else
      return res.status(401).send({
        message: "Unauthorized! missing Bearer",
      });
  }
  await Session.findAllSessionsByToken(token)
    .then(async (data) => {
      let session = data[0];
      if (session.personId != null) {
        console.log(session.personId);
        await PersonRole.findAll({
          where: { personId: session.personId, status: "approved" },
          as: "personrole",
          include: [
            {
              model: Role,
              as: "role",
              required: true,
            },
          ],
        })
          .then((data) => {
            roles = data;
            for (let i = 0; i < roles.length; i++) {
              if (roles[i].role.type == "Admin") {
                next();
                return;
              }
            }
            res.status(403).send({
              message: "Requires Admin Role",
            });
          })
          .catch((error) => {
            console.log(error);
            return res.status(401).send({
              message: "Error finding Roles",
            });
          });
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(401).send({
        message: "Error finding Session",
      });
    });
};

isSuperAdmin = async (req, res, next) => {
  let authHeader = req.get("authorization");
  let token = "";
  let roles = [];

  if (authHeader != null) {
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    } else
      return res.status(401).send({
        message: "Unauthorized! missing Bearer",
      });
  }
  await Session.findAllSessionsByToken(token)
    .then(async (data) => {
      let session = data[0];
      if (session.personId != null) {
        console.log(session.personId);
        await PersonRole.findAll({
          where: { personId: session.personId, status: "approved" },
          as: "personrole",
          include: [
            {
              model: Role,
              as: "role",
              required: true,
            },
          ],
        })
          .then((data) => {
            roles = data;
            for (let i = 0; i < roles.length; i++) {
              if (roles[i].role.type == "SuperAdmin") {
                next();
                return;
              }
            }
            res.status(403).send({
              message: "Requires SuperAdmin Role",
            });
          })
          .catch((error) => {
            console.log(error);
            return res.status(401).send({
              message: "Error finding Roles",
            });
          });
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(401).send({
        message: "Error finding Session",
      });
    });
};

const auth = {
  authenticate: authenticate,
  isAdmin: isAdmin,
  isSuperAdmin: isSuperAdmin,
};

module.exports = auth;
