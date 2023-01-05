require("dotenv").config();
//require('dotenv').config({path: '\\nodeapps\\tutor-backend\\.env'});
const express = require("express");
const cors = require("cors");

const app = express();

const db = require("./app/models");
// this is so that data gets saved
db.sequelize.sync();
// db.sequelize.sync({ force: true }).then(() => {
//     console.log("Drop and re-sync db.");
// });

var corsOptions = {
  origin: "http://localhost:8081",
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to tutoring node application!" });
});

require("./app/routes/appointment.routes")(app);
require("./app/routes/auth.routes")(app);
require("./app/routes/availability.routes")(app);
require("./app/routes/group.routes")(app);
require("./app/routes/location.routes")(app);
require("./app/routes/person.routes")(app);
require("./app/routes/personappointment.routes")(app);
require("./app/routes/personrole.routes")(app);
require("./app/routes/personroleprivilege.routes")(app);
require("./app/routes/persontopic.routes")(app);
require("./app/routes/request.routes")(app);
require("./app/routes/role.routes")(app);
require("./app/routes/topic.routes")(app);
require("./app/routes/twilio.routes")(app);

// start background tasks
const tasks = require("./app/background/hourly.js");
tasks.hourlyTasks();
const dailyTasks = require("./app/background/daily.js");
dailyTasks.dailyTasks();
const fifteenMinuteTasks = require("./app/background/fifteen.js");
fifteenMinuteTasks.fifteenMinuteTasks();

// set port, listen for requests
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
