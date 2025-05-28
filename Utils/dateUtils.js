const moment = require('moment');
const getWeekStart = (date = new Date()) => {
  const d = moment(date);
  const day = d.day(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday
  const offset = (day >= 5 ? day - 5 : 7 - (5 - day)); // Go back to most recent Friday
  return d.subtract(offset, 'days').startOf('day').toDate();
};

const getWeekRange = (date = new Date()) => {
  const start = getWeekStart(date);
  const end = moment(start).add(6, 'days').endOf('day').toDate(); // Thursday 11:59 PM
  return { start, end };
};

module.exports = { getWeekStart, getWeekRange };