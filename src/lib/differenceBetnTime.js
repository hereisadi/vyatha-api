const check7DayDifference = (firstTime, secondTime) => {
  if (!firstTime || !secondTime) {
    return console.error("BOth times are required");
  }

  firstTime = firstTime?.toString();
  secondTime = secondTime?.toString();
  const formatDate = (dateString) => {
    console.log("Date String:", dateString);
    const [datePart, timePart] = dateString.split(" ");
    console.log("Date Part:", datePart);
    console.log("Time Part:", timePart);

    const [day, month, year] = datePart.split("-");
    console.log("Day:", day);
    console.log("Month:", month);
    console.log("Year:", year);

    const [hour, minute] = timePart.split(":");
    console.log("Hour:", hour);
    console.log("Minute:", minute);

    return new Date(year, month - 1, day, hour, minute);
  };

  const date1 = formatDate(firstTime);
  const date2 = formatDate(secondTime);

  const differenceInMilliseconds = Math.abs(date2 - date1);
  const millisecondsIn7Days = 7 * 24 * 60 * 60 * 1000;

  if (differenceInMilliseconds > millisecondsIn7Days) {
    return "yes";
  } else {
    return "no";
  }
};

module.exports = {
  check7DayDifference,
};
