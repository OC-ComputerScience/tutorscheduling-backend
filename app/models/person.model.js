module.exports = (sequelize, Sequelize) => {
  const Person = sequelize.define("person", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    phoneNum: {
      type: Sequelize.STRING,
    },
    textOptIn: {
      type: Sequelize.BOOLEAN,
    },
    refresh_token: {
      type: Sequelize.STRING(512),
      allowNull: true,
    },
    expiration_date: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  });

  Person.findByEmail = (email, result) => {
    sql.query(`SELECT * FROM people WHERE email = "${email}"`, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }

      if (res.length) {
        console.log("found person: ", res[0]);
        result(null, res[0]);
        return;
      }

      // not found Person with the email
      result({ kind: "not_found" }, null);
    });
  };

  return Person;
};
