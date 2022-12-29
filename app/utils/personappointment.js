const db = require("../models");
const PersonAppointment = db.personappointment;
const Person = db.person;
const Appointment = db.appointment;

exports.createPersonAppointment = async (personAppointmentData) => {
  // Create a personappointment
  const personappointment = {
    id: personAppointmentData.id,
    isTutor: personAppointmentData.isTutor,
    personId: personAppointmentData.personId,
    appointmentId: personAppointmentData.appointmentId,
    feedbacknumber: personAppointmentData.feedbacknumber,
    feedbacktext: personAppointmentData.feedbacktext,
  };

  // Save personappointment in the database
  return await PersonAppointment.create(personappointment)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllPersonAppointments = async () => {
  return await PersonAppointment.findAll()
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllPersonAppointmentsForPerson = async (personId) => {
  return await PersonAppointment.findAll({ where: { personId: personId } })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findPersonAppointmentForPersonForAppointment = async (
  appointmentId,
  personId
) => {
  return await PersonAppointment.findOne({
    where: { personId: personId, appointmentId: appointmentId },
    include: [
      {
        model: Appointment,
        as: "appointment",
        required: true,
      },
    ],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findStudentDataForTable = async (appointmentId) => {
  return await PersonAppointment.findAll({
    where: { appointmentId: appointmentId, isTutor: false },
    include: [
      {
        model: Person,
        as: "person",
        required: true,
      },
    ],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findTutorDataForTable = async (appointmentId) => {
  return await PersonAppointment.findAll({
    where: { appointmentId: appointmentId, isTutor: true },
    include: [
      {
        model: Person,
        as: "person",
        required: true,
      },
    ],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findOnePersonAppointment = async (id) => {
  return await PersonAppointment.findByPk(id)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.updatePersonAppointment = async (personappointment, id) => {
  return await PersonAppointment.update(personappointment, {
    where: { id: id },
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.deletePersonAppointment = async (id) => {
  return await PersonAppointment.destroy({
    where: { id: id },
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.deleteAllPersonAppointments = async () => {
  return await PersonAppointment.destroy({
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
