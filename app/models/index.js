const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: 0,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.person = require("./person.model.js")(sequelize, Sequelize);
db.role = require("./role.model.js")(sequelize, Sequelize);
db.group = require("./group.model.js")(sequelize, Sequelize);
db.personrole = require("./personrole.model.js")(sequelize, Sequelize);
db.availability = require("./availability.model.js")(sequelize, Sequelize);
db.topic = require("./topic.model.js")(sequelize, Sequelize);
db.persontopic = require("./persontopic.model.js")(sequelize, Sequelize);
db.location = require("./location.model.js")(sequelize, Sequelize);
db.request = require("./request.model.js")(sequelize, Sequelize);
db.appointment = require("./appointment.model.js")(sequelize, Sequelize);
db.personappointment = require("./personappointment.model.js")(sequelize, Sequelize);
db.session = require("./session.model.js")(sequelize, Sequelize);

// foreign key for role
db.group.hasMany(db.role, { as: 'role'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
db.role.belongsTo(db.group, { as: 'group' }, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

// foreign keys for personrole
db.role.hasMany(db.personrole, { as: 'personrole'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
db.person.hasMany(db.personrole, { as: 'personrole'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
db.personrole.belongsTo(db.role, { as: 'role' }, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
db.personrole.belongsTo(db.person, { as: 'person' }, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

// foreign key for availability
db.person.hasMany(db.availability, { as: 'availability'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
db.availability.belongsTo(db.person, { as: 'person'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

// foreign key for topic
db.group.hasMany(db.topic, { as: 'topic'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
db.topic.belongsTo(db.group, { as: 'group'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

// foreign keys for persontopic
db.topic.hasMany(db.persontopic, { as: 'persontopic'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
db.person.hasMany(db.persontopic, { as: 'persontopic'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
db.persontopic.belongsTo(db.topic, { as: 'topic'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
db.persontopic.belongsTo(db.person, { as: 'person'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

// foreign key for location
db.group.hasMany(db.location, { as: 'location'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
db.location.belongsTo(db.group, { as: 'group'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

// foreign keys for request
db.person.hasMany(db.request, { as: 'request'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
db.group.hasMany(db.request, { as: 'request'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
db.request.belongsTo(db.person, { as: 'person'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
db.request.belongsTo(db.group, { as: 'group'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

// foreign keys for appointment
db.group.hasMany(db.appointment, { as: 'appointment'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
db.topic.hasMany(db.appointment, { as: 'appointment'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
db.location.hasMany(db.appointment, { as: 'appointment'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
db.appointment.belongsTo(db.group, { as: 'group'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' }),
db.appointment.belongsTo(db.topic, { as: 'topic'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
db.appointment.belongsTo(db.location, { as: 'location'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

// foreign keys for personappointment
db.appointment.hasMany(db.personappointment, { as: 'personappointment'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
db.person.hasMany(db.personappointment, { as: 'personappointment'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
db.personappointment.belongsTo(db.appointment, { as: 'appointment'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
db.personappointment.belongsTo(db.person, { as: 'person'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

// foreign key for session
db.person.hasMany(db.session, { as: 'session'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
db.session.belongsTo(db.person, { as: 'person'}, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

module.exports = db;