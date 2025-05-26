const Delivery = require('../Schema/deliveries');
const User = require('../Schema/user');
const moment = require('moment');

exports.getOwnerStats = async (req, res) => {
  const { from, to } = req.query;

  const startDate = from ? moment(from).startOf('day') : null;
  const endDate = to ? moment(to).endOf('day') : null;

  const today = moment().startOf('day');
  const week = moment().startOf('isoWeek');
  const month = moment().startOf('month');
  const year = moment().startOf('year');

  try {
    const allDeliveries = await Delivery.find();

    const filterDeliveries = (from) =>
      allDeliveries.filter(d => moment(d.deliveryDate).isSameOrAfter(from));

    const sumCOD = (list) =>
      list.filter(d => d.codCollected)
          .reduce((sum, d) => sum + Number(d.codAmount || 0), 0);

    const deliveriesToday = filterDeliveries(today);
    const deliveriesWeek = filterDeliveries(week);
    const deliveriesMonth = filterDeliveries(month);
    const deliveriesYear = filterDeliveries(year);

    const customDeliveries = (startDate && endDate)
      ? allDeliveries.filter(d =>
          moment(d.deliveryDate).isBetween(startDate, endDate, null, '[]')
        )
      : [];

    const selected = customDeliveries.length ? customDeliveries : allDeliveries;

    const driverCounts = {};
    const salespersonCounts = {};
    const salespersonCarMap = {};

    for (const d of selected) {
      const driverId = d.driver?._id?.toString();
      if (driverId) {
        driverCounts[driverId] = (driverCounts[driverId] || 0) + 1;
      }

      const salespersonId = d.salesperson?._id?.toString();
      if (salespersonId) {
        salespersonCounts[salespersonId] = (salespersonCounts[salespersonId] || 0) + 1;

        const make = d.make || 'Unknown';
        const model = d.model || '';
        const key = `${make} ${model}`.trim();

        if (!salespersonCarMap[salespersonId]) {
          salespersonCarMap[salespersonId] = {};
        }

        salespersonCarMap[salespersonId][key] = (salespersonCarMap[salespersonId][key] || 0) + 1;
      }
    }

    const drivers = await User.find({ role: 'Driver' });
    const salespeople = await User.find({ role: 'Sales' });

    const topDrivers = drivers.map(d => ({
      name: d.name,
      totalDeliveries: driverCounts[d._id.toString()] || 0
    })).sort((a, b) => b.totalDeliveries - a.totalDeliveries).slice(0, 5);

    const topSalespeople = salespeople.map(s => {
      const id = s._id.toString();
      return {
        name: s.name,
        totalDeliveries: salespersonCounts[id] || 0,
        carsByMakeModel: salespersonCarMap[id] || {}
      };
    }).sort((a, b) => b.totalDeliveries - a.totalDeliveries).slice(0, 5);
    
    
    res.json({
      deliveriesToday: deliveriesToday.length,
      deliveriesWeek: deliveriesWeek.length,
      deliveriesMonth: deliveriesMonth.length,
      deliveriesYear: deliveriesYear.length,
      codToday: sumCOD(deliveriesToday),
      codWeek: sumCOD(deliveriesWeek),
      codMonth: sumCOD(deliveriesMonth),
      codYear: sumCOD(deliveriesYear),
      topDrivers,
      topSalespeople
    });
  } catch (err) {
    console.error('❌ Owner stats error:', err);
    res.status(500).json({ message: 'Failed to generate stats' });
  }
};
