const addOneHour = (linkSendAt) => {
  if (!linkSendAt) {
    return console.error("time is required");
  }
  linkSendAt = linkSendAt?.toString();
  let [datePart, timePart] = linkSendAt.split(" ");
  let [day, month, year] = datePart.split("-");
  let [hour, minute] = timePart.split(":");
  let linkSendAtDate = new Date(year, month - 1, day, hour, minute);
  linkSendAtDate.setHours(linkSendAtDate.getHours() + 1);
  let formattedMonth = (linkSendAtDate.getMonth() + 1)
    .toString()
    .padStart(2, "0");
  let formattedMinute = linkSendAtDate.getMinutes().toString().padStart(2, "0");
  let newLinkSendAt = `${linkSendAtDate.getDate()}-${formattedMonth}-${linkSendAtDate.getFullYear()} ${linkSendAtDate.getHours()}:${formattedMinute}`;
  return newLinkSendAt;
};

module.exports = {
  addOneHour,
};
