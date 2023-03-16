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
              res.statusMessage = "Expired token";
              return res.status(498).send({
                message: "Unauthorized! Expired or invalid token.",
              });
            }
          }
          // if session is null, they are also unauthorized
          else {
            res.statusMessage = "Invalid session";
            return res.status(440).send({
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
        message: "Unauthorized! No authentication header.",
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
            return res.status(403).send({
              message: "Forbidden! Requires Admin role.",
            });
          })
          .catch((error) => {
            console.log(error);
            return res.status(500).send({
              message:
                "There was an error finding roles to authenticate an admin.",
            });
          });
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).send({
        message: "There was an error find sessions to authenticate an admin.",
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
        message: "Unauthorized! No authentication header.",
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
            return res.status(403).send({
              message: "Forbidden! Requires SuperAdmin role.",
            });
          })
          .catch((error) => {
            console.log(error);
            return res.status(500).send({
              message:
                "There was an error finding roles to authenticate a super admin.",
            });
          });
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).send({
        message:
          "There was an error find sessions to authenticate a super admin.",
      });
    });
};

const auth = {
  authenticate: authenticate,
  isAdmin: isAdmin,
  isSuperAdmin: isSuperAdmin,
};

module.exports = auth;
