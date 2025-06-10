module.exports = function getFriday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day < 5 ? -2 : 5);
  return new Date(d.setDate(diff));
};
