module.exports = (sequelize, Sequelize) => {
    const Session = sequelize.define("session", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      expirationDate: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    Session.findByToken = (token, result) => {
      sql.query(`SELECT * FROM sessions WHERE token = '${token}'`, (err, res) => {
          if (err) {
              console.log('error: ', err);
              result(err, null);
              return;
          }
  
          if (res.length) {
              console.log('found session: ', res[0]);
              result(null, res[0]);
              return;
          }
  
          // not found Session with the token
          result({ kind: 'not_found' }, null);
      });
  };
  
    return Session;
};