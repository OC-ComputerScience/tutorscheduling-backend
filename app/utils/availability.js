const db = require("../models");
const Availability = db.availability;
const Appointment = db.appointment;
const PersonAppointment = db.personappointment;
const Op = db.Sequelize.Op;

exports.createAvailability = async (availabilityData) => {
  // Create an availability
  const availability = {
    id: availabilityData.id,
    personId: availabilityData.personId,
    date: availabilityData.date,
    startTime: availabilityData.startTime,
    endTime: availabilityData.endTime,
  };

  // Save availability in the database
  return await Availability.create(availability)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllAvailabilities = async () => {
  return await Availability.findAll({
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllAvailabilitiesForPerson = async (personId) => {
  return await Availability.findAll({
    where: { personId: personId },
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllUpcomingForPerson = async (personId) => {
  const date = new Date();
  date.setHours(date.getHours() - date.getTimezoneOffset() / 60);
  date.setHours(0, 0, 0, 0);

  let checkTime = new Date();
  checkTime =
    checkTime.getHours() +
    ":" +
    checkTime.getMinutes() +
    ":" +
    checkTime.getSeconds();

  return await Availability.findAll({
    where: {
      personId: personId,
      [Op.or]: [
        {
          [Op.and]: [
            { startTime: { [Op.gte]: checkTime } },
            { date: { [Op.eq]: date } },
          ],
        },
        {
          date: { [Op.gt]: date },
        },
      ],
    },
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findOneAvailability = async (id) => {
  return await Availability.findByPk(id)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.updateAvailability = async (availability, id) => {
  return await Availability.update(availability, {
    where: { id: id },
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.deleteAvailability = async (id) => {
  return await Availability.findByPk(id)
    .then(async (data) => {
      if (data) {
        let availability = data.dataValues;
        await Availability.destroy({
          where: { id: id },
        })
          .then(async (num) => {
            if (num == 1) {
              let tutorId = availability.personId;
              let date = availability.date;
              date.setHours(date.getHours() + date.getTimezoneOffset() / 60);
              let startTime = availability.startTime;
              console.log(tutorId);
              let endTime = availability.endTime;
              console.log(date);
              await Appointment.destroy({
                where: {
                  id: {
                    [Op.in]: db.sequelize.literal(
                      "(SELECT appointmentId FROM personappointments where personID=" +
                        tutorId +
                        " AND isTutor='1')"
                    ),
                  },
                  status: "available",
                  date: { [Op.eq]: date },
                  startTime: { [Op.gte]: startTime },
                  endTime: { [Op.lte]: endTime },
                },
              })
                .then(async () => {
                  await PersonAppointment.destroy({
                    where: {
                      appointmentId: null,
                    },
                  }).catch((err) => {
                    console.log(
                      "Could not delete past PersonAppointments" + err
                    );
                  });
                  res.send({
                    message:
                      "Availability/Appointments were deleted successfully!",
                  });
                })
                .catch((err) => {
                  res.status(500).send({
                    message:
                      "Error deleteing Appointments for Availability with id=" +
                      id,
                  });
                });
            } else {
              res.send({
                message: `Cannot delete Availability with id=${id}. Maybe Availability was not found!`,
              });
            }
          })
          .catch((err) => {
            res.status(500).send({
              message:
                "Could not delete Availability with id=" + id + " :" + err,
            });
          });
      } else {
        res.status(404).send({
          message: `Cannot find Availability with id=${id}.`,
        });
      }
    })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.deleteAllAvailabilities = async () => {
  return await Availability.destroy({
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
