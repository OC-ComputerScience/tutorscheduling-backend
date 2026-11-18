const db = require("../models");
const Appointment = require("../sequelizeUtils/appointment.js");
const PersonAppointment = require("../sequelizeUtils/personappointment.js");
const Time = require("./time.js");
const Op = db.Sequelize.Op;

const isTutorPA = (pa) => pa.isTutor === true || pa.isTutor === 1;

const isRealAppointment = (appointment, students) => {
  if (appointment.type === "Private") {
    return (
      appointment.status === "pending" || appointment.status === "booked"
    );
  }
  if (appointment.type === "Group") {
    return students.length > 0;
  }
  return false;
};

const isOpenAvailability = (appointment, students) => {
  if (appointment.status !== "available") {
    return false;
  }
  if (appointment.type === "Private") {
    return true;
  }
  if (appointment.type === "Group") {
    return students.length === 0;
  }
  return false;
};

const overlapWhere = (startTime, endTime) => {
  const start = Time.normalizeTime(startTime);
  const end = Time.normalizeTime(endTime);
  return {
    [Op.or]: [
      {
        [Op.and]: [
          { startTime: { [Op.lte]: start } },
          { endTime: { [Op.gt]: start } },
        ],
      },
      {
        [Op.and]: [
          { startTime: { [Op.lt]: end } },
          { endTime: { [Op.gte]: end } },
        ],
      },
      {
        [Op.and]: [
          { startTime: { [Op.gte]: start } },
          { endTime: { [Op.lte]: end } },
        ],
      },
    ],
  };
};

const cleanupOrphanPersonAppointments = async () => {
  await db.personappointment.destroy({
    where: { appointmentId: null },
  });
};

const deleteAvailableAppointment = async (appointment) => {
  const Calendar = require("./calendar.js");
  if (appointment.type === "Group") {
    await Calendar.deleteFromGoogle(appointment.id).catch((err) => {
      console.log(
        "Could not delete overlapping group availability from Google: " + err
      );
    });
  }
  await Appointment.deleteAppointment(appointment.id);
  await cleanupOrphanPersonAppointments();
};

const updateAvailableAppointmentTimes = async (appointment, startTime, endTime) => {
  const Calendar = require("./calendar.js");
  const updated = {
    id: appointment.id,
    date: appointment.date,
    startTime: Time.normalizeTime(startTime),
    endTime: Time.normalizeTime(endTime),
    type: appointment.type,
    status: appointment.status,
    preSessionInfo: appointment.preSessionInfo,
    groupId: appointment.groupId,
    topicId: appointment.topicId,
    locationId: appointment.locationId,
    tutorSetLocation: appointment.tutorSetLocation,
    googleEventId: appointment.googleEventId,
    URL: appointment.URL,
  };
  await Appointment.updateAppointment(updated, appointment.id);
  if (appointment.type === "Group" && appointment.googleEventId) {
    await Calendar.updateForGoogle(appointment.id).catch((err) => {
      console.log(
        "Could not update overlapping group availability in Google: " + err
      );
    });
  }
};

const createAvailableRemainder = async (appointment, startTime, endTime) => {
  const Calendar = require("./calendar.js");
  const created = await Appointment.createAppointment({
    date: appointment.date,
    startTime: Time.normalizeTime(startTime),
    endTime: Time.normalizeTime(endTime),
    type: appointment.type,
    status: "available",
    preSessionInfo: appointment.preSessionInfo || "",
    groupId: appointment.groupId,
    topicId: appointment.type === "Group" ? appointment.topicId : null,
    locationId: appointment.locationId,
    tutorSetLocation: appointment.tutorSetLocation,
    googleEventId: null,
    URL: appointment.URL,
  });

  const tutors = (appointment.personappointment || []).filter(isTutorPA);
  for (let i = 0; i < tutors.length; i++) {
    await PersonAppointment.createPersonAppointment({
      isTutor: true,
      appointmentId: created.id,
      personId: tutors[i].personId,
    });
  }

  if (appointment.type === "Group") {
    await Calendar.addAppointmentToGoogle(created.id).catch((err) => {
      console.log(
        "Could not add split group availability to Google: " + err
      );
    });
  }
};

const carveOneAvailability = async (appointment, bookedStart, bookedEnd) => {
  const group = appointment.group || {};
  const minApptTime = group.minApptTime || 30;
  const splitSetting = group.allowSplittingAppointments;
  const allowSplit =
    splitSetting === undefined || splitSetting === null
      ? true
      : splitSetting !== false &&
        splitSetting !== 0 &&
        splitSetting !== "0" &&
        splitSetting !== "false";
  const slotStart = Time.normalizeTime(appointment.startTime);
  const slotEnd = Time.normalizeTime(appointment.endTime);
  const bookStart = Time.normalizeTime(bookedStart);
  const bookEnd = Time.normalizeTime(bookedEnd);

  if (!Time.timesOverlap(slotStart, slotEnd, bookStart, bookEnd)) {
    return;
  }

  if (!allowSplit) {
    await deleteAvailableAppointment(appointment);
    return;
  }

  const keepLeft =
    Time.timeToMinutes(bookStart) > Time.timeToMinutes(slotStart) &&
    Time.durationMinutes(slotStart, bookStart) >= minApptTime;
  const keepRight =
    Time.timeToMinutes(bookEnd) < Time.timeToMinutes(slotEnd) &&
    Time.durationMinutes(bookEnd, slotEnd) >= minApptTime;

  if (!keepLeft && !keepRight) {
    await deleteAvailableAppointment(appointment);
    return;
  }

  if (keepLeft && keepRight) {
    await updateAvailableAppointmentTimes(appointment, slotStart, bookStart);
    await createAvailableRemainder(appointment, bookEnd, slotEnd);
    return;
  }

  if (keepLeft) {
    await updateAvailableAppointmentTimes(appointment, slotStart, bookStart);
    return;
  }

  await updateAvailableAppointmentTimes(appointment, bookEnd, slotEnd);
};

exports.findOverlappingAvailableForTutor = async (params) => {
  const { tutorId, date, startTime, endTime, excludeAppointmentId } = params;
  const safeTutorId = parseInt(tutorId, 10);
  if (!safeTutorId) {
    return [];
  }
  const tutorAppointmentIds = db.sequelize.literal(
    "(SELECT appointmentId FROM personappointments WHERE personId = " +
      safeTutorId +
      " AND isTutor = 1)"
  );

  const rows = await db.appointment.findAll({
    where: {
      id: {
        [Op.and]: [
          { [Op.in]: tutorAppointmentIds },
          { [Op.ne]: excludeAppointmentId },
        ],
      },
      status: "available",
      [Op.and]: [
        db.sequelize.where(
          db.sequelize.fn("DATE", db.sequelize.col("appointment.date")),
          db.sequelize.fn("DATE", date)
        ),
        overlapWhere(startTime, endTime),
      ],
    },
    include: [
      {
        model: db.group,
        as: "group",
        required: true,
      },
      {
        model: db.personappointment,
        as: "personappointment",
        required: true,
      },
    ],
  });

  return rows.filter((appointment) => {
    const students = appointment.personappointment.filter(
      (pa) => !isTutorPA(pa)
    );
    return isOpenAvailability(appointment, students);
  });
};

const loadAppointmentForAdjust = async (appointmentId) => {
  return await db.appointment.findByPk(appointmentId, {
    include: [
      {
        model: db.personappointment,
        as: "personappointment",
        required: false,
      },
    ],
  });
};

exports.adjustOverlappingAvailabilityForAppointment = async (appointmentId) => {
  if (!appointmentId) {
    return;
  }

  const appointment = await loadAppointmentForAdjust(appointmentId);
  if (!appointment) {
    console.log(
      "Could not adjust overlapping availability: appointment " +
        appointmentId +
        " not found"
    );
    return;
  }

  const personAppointments = appointment.personappointment || [];
  const students = personAppointments.filter((pa) => !isTutorPA(pa));
  const tutors = personAppointments.filter(isTutorPA);

  if (!isRealAppointment(appointment, students) || tutors.length === 0) {
    console.log(
      "Skipping overlapping availability adjust for appointment " +
        appointmentId +
        " status=" +
        appointment.status +
        " type=" +
        appointment.type +
        " tutors=" +
        tutors.length
    );
    return;
  }

  for (let i = 0; i < tutors.length; i++) {
    const overlapping = await exports.findOverlappingAvailableForTutor({
      tutorId: tutors[i].personId,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      excludeAppointmentId: appointment.id,
    });
    console.log(
      "Adjusting overlapping availability for appointment " +
        appointment.id +
        " tutor " +
        tutors[i].personId +
        " found " +
        overlapping.length +
        " open slot(s)"
    );

    for (let j = 0; j < overlapping.length; j++) {
      await carveOneAvailability(
        overlapping[j],
        appointment.startTime,
        appointment.endTime
      );
    }
  }
};
