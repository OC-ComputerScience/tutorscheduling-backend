module.exports = app => {
    const auth = require("../controllers/auth.controller.js");
    const { authenticate,isAdmin} = require("../authorization/authorization.js");
  
    var router = require("express").Router();

    // Login
    router.post("/login", auth.login);

    // Logout
    router.post("/logout", [authenticate],auth.logout);

    app.use('', router);
};
