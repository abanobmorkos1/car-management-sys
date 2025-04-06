const Salesperson = require('../Schema/salesSchema');
const Car = require('../Schema/newCar'); // Assuming car schema contains sales info

// Get monthly report
const getMonthlySalesReport = async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ error: 'Month and year are required' });
  }

  try {
    const start = new Date(`${year}-${month}-01`);
    const end = new Date(start);
    end.setMonth(start.getMonth() + 1);

    const sales = await Car.aggregate([
      {
        $match: {
          pickedDate: { $gte: start, $lt: end }
        }
      },
      {
        $group: {
          _id: '$salespersonId',
          totalSales: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'salespersonSchema', // Make sure this matches your MongoDB collection name
          localField: '_id',
          foreignField: '_id',
          as: 'salesperson'
        }
      },
      { $unwind: '$salesperson' },
      {
        $project: {
          name: '$salesperson.name',
          email: '$salesperson.email',
          role: '$salesperson.role',
          totalSales: 1
        }
      }
    ]);

    res.json(sales);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

// Add salesperson
const addSalesperson = async (req, res) => {
  const { name, email, role } = req.body;

  try {
    const newSalesperson = new Salesperson({ name, email, role });
    await newSalesperson.save();
    res.status(201).json(newSalesperson);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create salesperson' });
  }
};

module.exports = {
  getMonthlySalesReport,
  addSalesperson
};
