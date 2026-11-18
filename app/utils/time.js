exports.addMinsToTime = (mins, time) => {
  let temp = new Date();
  var [timeHrs, timeMins] = this.getHoursAndMinsFromTime(time);
  temp.setHours(timeHrs);
  temp.setMinutes(timeMins + mins);
  [timeHrs, timeMins] = this.getHoursAndMinsFromTime(
    temp.toLocaleTimeString("it-IT")
  );

  // make sure the time slots are padded correctly
  return (
    String("00" + timeHrs).slice(-2) +
    ":" +
    String("00" + timeMins).slice(-2) +
    ":00"
  );
};

exports.subtractMinsFromTime = (mins, time) => {
  let temp = new Date();
  var [timeHrs, timeMins] = this.getHoursAndMinsFromTime(time);
  temp.setHours(timeHrs);
  temp.setMinutes(timeMins - mins);
  [timeHrs, timeMins] = this.getHoursAndMinsFromTime(
    temp.toLocaleTimeString("it-IT")
  );

  // //TODO test when hour should be -1 but it's -0

  // make sure the time slots are padded correctly
  return (
    String("00" + timeHrs).slice(-2) +
    ":" +
    String("00" + timeMins).slice(-2) +
    ":00"
  );
};

exports.getHoursAndMinsFromTime = (time) => {
  return time.split(":").map(function (str) {
    return parseInt(str);
  });
};

exports.normalizeTime = (time) => {
  if (time === undefined || time === null) {
    return "00:00:00";
  }
  let value = time.toString();
  if (value.length >= 8) {
    value = value.substring(0, 8);
  } else if (value.length === 5) {
    value = value + ":00";
  }
  return value;
};

exports.timeToMinutes = (time) => {
  const [hours, minutes] = this.normalizeTime(time)
    .split(":")
    .map(function (str) {
      return parseInt(str);
    });
  return hours * 60 + minutes;
};

exports.timesOverlap = (startA, endA, startB, endB) => {
  return (
    this.timeToMinutes(endA) > this.timeToMinutes(startB) &&
    this.timeToMinutes(startA) < this.timeToMinutes(endB)
  );
};

exports.durationMinutes = (start, end) => {
  return this.timeToMinutes(end) - this.timeToMinutes(start);
};

exports.getWeekFromDate = (date) => {
  var year = parseInt(date.substring(0, 4));
  var month = parseInt(date.substring(5, 7));
  var day = parseInt(date.substring(8, 10));
  var curr = new Date(year, month - 1, day); // get current date
  console.log(day + ", " + month + ", " + year); // something wonky here, month is adding one each time.
  console.log("CURR " + curr);
  var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
  var last = first + 6; // last day is the first day + 6

  var firstday = new Date(curr.setDate(first));
  var lastday = new Date(curr.setDate(last));

  return this.toSQLDate(firstday, lastday);
};

exports.toSQLDate = (date1, date2) => {
  first = date1.toISOString().slice(0, 19).replace("T", " ");
  last = date2.toISOString().slice(0, 19).replace("T", " ");
  return { first, last };
};

exports.formatDate = (date) => {
  let formattedDate =
    date.toISOString().substring(5, 10) +
    "-" +
    date.toISOString().substring(0, 4);
  return formattedDate;
};

exports.formatReadableMonth = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
};

exports.formatReadableDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

exports.formatReadableTimeFromSQL = (time) => {
  return new Date(time).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

exports.formatTimeFromString = (time) => {
  let modST = time.toString().substring(0, 2) % 12;
  let formattedTime = modST + ":" + time.toString().substring(3, 5);

  if (time.toString().substring(0, 2) > 12) {
    formattedTime = formattedTime + " P.M.";
  } else if (modST == 0 && time.toString().substring(0, 2) == "12") {
    formattedTime = "12:" + time.toString().substring(3, 5) + " PM";
  } else if (modST == 0) {
    formattedTime = "12:" + time.toString().substring(3, 5) + " AM";
  } else {
    formattedTime = formattedTime + " AM";
  }

  return formattedTime;
};
