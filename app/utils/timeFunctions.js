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
