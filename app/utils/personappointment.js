const db = require("../models");
const PersonAppointment = db.personappointment;
const Person = db.person;
const Appointment = db.appointment;

exports.createPersonAppointment = async (personAppointmentData) => {
  if (personAppointmentData.isTutor === undefined) {
    const error = new Error(
      "IsTutor (true or false) cannot be empty for person appointment!"
    );
    error.statusCode = 400;
    throw error;
  }

  // Create a personappointment
  const personappointment = {
    id: personAppointmentData.id,
    isTutor: personAppointmentData.isTutor,
    feedbacknumber: personAppointmentData.feedbacknumber,
    feedbacktext: personAppointmentData.feedbacktext,
    appointmentId: personAppointmentData.appointmentId,
    personId: personAppointmentData.personId,
  };

  // Save personappointment in the database
  return await PersonAppointment.create(personappointment);
};

exports.findAllPersonAppointments = async () => {
  return await PersonAppointment.findAll();
};

exports.findAllPersonAppointmentsForPerson = async (personId) => {
  return await PersonAppointment.findAll({ where: { personId: personId } });
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
  });
};

exports.findOnePersonAppointment = async (id) => {
  return await PersonAppointment.findByPk(id);
};

exports.updatePersonAppointment = async (personappointment, id) => {
  return await PersonAppointment.update(personappointment, {
    where: { id: id },
  });
};

exports.deletePersonAppointment = async (id) => {
  return await PersonAppointment.destroy({
    where: { id: id },
  });
};

exports.deleteAllPersonAppointments = async () => {
  return await PersonAppointment.destroy({
    where: {},
    truncate: false,
  });
};
