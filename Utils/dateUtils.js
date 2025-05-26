const moment = require('moment');

const getWeekStart = (date) => {
  return moment(date).isoWeekday(5).startOf('day').toDate(); // Friday
};

module.exports = { getWeekStart };