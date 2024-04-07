const checkxDayDifference = (firstTime, secondTime, x) => {
  if (!firstTime || !secondTime) {
    return console.error("BOth times are required");
  }

  if (!x) {
    return console.error("x is required");
  }

  if (!Number.isInteger(x)) {
    return console.error("x must be a whole number");
  }

  firstTime = firstTime?.toString();
  secondTime = secondTime?.toString();
  const formatDate = (dateString) => {
    const [datePart, timePart] = dateString.split(" ");
    const [day, month, year] = datePart.split("-");
    const [hour, minute] = timePart.split(":");
    return new Date(year, month - 1, day, hour, minute);
  };

  const date1 = formatDate(firstTime);
  const date2 = formatDate(secondTime);

  const differenceInMilliseconds = Math.abs(date2 - date1);
  const millisecondsIn7Days = x * 24 * 60 * 60 * 1000;

  if (differenceInMilliseconds > millisecondsIn7Days) {
    return "yes";
  } else {
    return "no";
  }
};

module.exports = {
  checkxDayDifference,
};
