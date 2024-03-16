const addOneHour = (linkSendAt) => {
  let [datePart, timePart] = linkSendAt.split(" ");
  let [day, month, year] = datePart.split("-");
  let [hour, minute] = timePart.split(":");
  let linkSendAtDate = new Date(year, month - 1, day, hour, minute);
  linkSendAtDate.setHours(linkSendAtDate.getHours() + 1);
  let newLinkSendAt = `${linkSendAtDate.getDate()}-${
    linkSendAtDate.getMonth() + 1
  }-${linkSendAtDate.getFullYear()} ${linkSendAtDate.getHours()}:${linkSendAtDate.getMinutes()}`;
  return newLinkSendAt;
};

module.exports = {
  addOneHour,
};
