const express = require('express');
const router = express.Router();
const Sale = require('../Schema/salesSchema'); // your Sale model
const mongoose = require('mongoose');

// GET /api/sales/top-performers?month=04&year=2025
// GET /api/cars/top-performers?month=04&year=2025

router.get('/top-performers', async (req, res) => {
    try {
      const { month, year } = req.query;
  
      if (!month || !year) {
        return res.status(400).json({ error: 'Month and year are required.' });
      }
  
      const start = new Date(`${year}-${month}-01`);
      const end = new Date(`${year}-${month}-31`);
  
      // Aggregating car pickup data by salesperson, make, and model
      const topPerformers = await Car.aggregate([
        {
          // Match the picked cars within the specified date range
          $match: {
            pickedDate: { $gte: start, $lte: end },
          },
        },
        {
          // Group by salesperson, make, and model
          $group: {
            _id: { salesperson: "$Salesperson", make: "$make", model: "$model" },
            totalSales: { $sum: 1 }, // Count how many cars sold for each make/model by the salesperson
          },
        },
        {
          // Aggregate by salesperson to get total cars sold and sales breakdown by make/model
          $group: {
            _id: "$_id.salesperson",
            totalSales: { $sum: "$totalSales" },
            salesByMakeModel: {
              $push: {
                make: "$_id.make",
                model: "$_id.model",
                total: "$totalSales",
              },
            },
          },
        },
        {
          // Sort by the number of cars sold, descending
          $sort: { totalSales: -1 },
        },
      ]);
  
      res.json(topPerformers);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  

  // POST /api/salesperson to dynamically add salespeople using that api 

router.post('/salesperson', async (req, res) => {
    const { name, email, role } = req.body;
    try {
      const newSalesperson = new Salesperson({ name, email, role });
      await newSalesperson.save();
      res.status(201).json(newSalesperson);
    } catch (err) {
      res.status(400).json({ error: 'Failed to create salesperson' });
    }
  });
  
// GET /api/sales/monthly-performance?month=04&year=2025  track monthlysales by salespeople
router.get('/sales/monthly-performance', async (req, res) => {
    const { month, year } = req.query;
  
    // Ensure month and year are provided
    if (!month || !year) {
      return res.status(400).json({ error: "Month and year are required." });
    }
  
    try {
      // Aggregate total sales by salesperson for a specific month and year
      const topPerformers = await Car.aggregate([
        {
          $match: {
            // Match by month and year
            pickedDate: {
              $gte: new Date(`${year}-${month}-01`),
              $lt: new Date(`${year}-${parseInt(month) + 1}-01`),
            },
          },
        },
        {
          $group: {
            _id: '$salespersonId',
            totalSales: { $sum: 1 }, // Assuming each car is a sale
          },
        },
        {
          $sort: { totalSales: -1 },
        },
        {
          $lookup: {
            from: 'salespeople',
            localField: '_id',
            foreignField: '_id',
            as: 'salesperson',
          },
        },
        {
          $unwind: '$salesperson',
        },
      ]);
  
      res.json(topPerformers);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch sales performance' });
    }
  });
  
module.exports = router;
