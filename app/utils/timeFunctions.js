exports.calcTime = (time) => {
  if (time == null) {
    return null;
  }
  let temp = time.split(":");
  let milHours = parseInt(temp[0]);
  let minutes = temp[1];
  let hours = milHours % 12;
  if (hours == 0) {
    hours = 12;
  }
  let dayTime = ~~(milHours / 12) > 0 ? "PM" : "AM";
  return "" + hours + ":" + minutes + " " + dayTime;
};

exports.addMinsToTime = (mins, time) => {
  let temp = new Date();
  var [timeHrs, timeMins] = this.getHoursAndMinsFromTime(time);
  temp.setHours(timeHrs);
  temp.setMinutes(timeMins + mins);
  [timeHrs, timeMins] = this.getHoursAndMinsFromTime(temp.toLocaleTimeString());

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
  [timeHrs, timeMins] = this.getHoursAndMinsFromTime(temp.toLocaleTimeString());

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
