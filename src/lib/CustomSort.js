const customSort = (timeList, direction) => {
  const compareTime = (time1, time2) => {
    const date1 = new Date(
      time1.replace(/(\d+)-(\d+)-(\d+) (\d+):(\d+)/, "$3-$2-$1T$4:$5")
    );
    const date2 = new Date(
      time2.replace(/(\d+)-(\d+)-(\d+) (\d+):(\d+)/, "$3-$2-$1T$4:$5")
    );

    if (direction === 1) {
      return date1 - date2;
    } else if (direction === -1) {
      return date2 - date1;
    }
  };

  return timeList.sort(compareTime);
};

module.exports = {
  customSort,
};
