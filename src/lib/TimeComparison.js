const compareTimes = (time1, time2) => {
  if (!time1 || !time2) {
    return console.error("both times are required");
  }
  time1 = time1?.toString();
  time2 = time2?.toString();
  const parseTime = (timeString) => {
    const [datePart, timePart] = timeString.split(" ");
    const [day, month, year] = datePart.split("-");
    const [hour, minute] = timePart.split(":");
    return new Date(year, month - 1, day, hour, minute);
  };

  const time1Date = parseTime(time1);
  const time2Date = parseTime(time2);

  if (time1Date > time2Date) {
    return "Time 1 is later than Time 2.";
  } else if (time1Date < time2Date) {
    return "Time 1 is earlier than Time 2.";
  } else {
    return "Time 1 is the same as Time 2.";
  }
};

module.exports = {
  compareTimes,
};

// use as compareTimes(tokenExpiration,currentTime)
