const mongoose = require('mongoose');
const HotelConsumption = require('../models/HotelConsumption');
const StockIssue = require('../models/StockIssue');
const User = require('../models/User');
const { toBaseUnit } = require('../utils/unitConverter');

// POST /consumption - Create consumption entry
const createConsumption = async (req, res) => {
  try {
    const { hotelId, items, date, remarks } = req.body;
    const reportedBy = req.user.id;

    // Validate hotelId - hotel_manager can only report for their own hotel
    if (req.user.role === 'hotel_manager' && req.user.hotelId.toString() !== hotelId) {
      return res.status(403).json({ message: 'You can only report consumption for your own hotel' });
    }

    const consumptionDate = new Date(date);

    // Calculate opening and closing balances for each item
    const processedItems = [];
    let overConsumption = false;

    for (const item of items) {
      // Get total issued to this hotel for this item (all dates) - convert to base units
      const totalIssued = await StockIssue.aggregate([
        { $match: { hotelId: new mongoose.Types.ObjectId(hotelId) } },
        { $unwind: '$items' },
        { $match: { 'items.itemId': new mongoose.Types.ObjectId(item.itemId) } },
        { $group: { _id: null, total: { $sum: '$items.quantityIssued' }, unit: { $first: '$items.unit' } } }
      ]);

      const issuedInBase = totalIssued.length > 0 ? toBaseUnit(totalIssued[0].total, totalIssued[0].unit) : 0;

      // Get total consumed before this date for this hotel and item - convert to base units
      const totalConsumedBefore = await HotelConsumption.aggregate([
        { $match: { hotelId: new mongoose.Types.ObjectId(hotelId), date: { $lt: consumptionDate } } },
        { $unwind: '$items' },
        { $match: { 'items.itemId': new mongoose.Types.ObjectId(item.itemId) } },
        { $group: { _id: null, total: { $sum: '$items.quantityConsumed' }, unit: { $first: '$items.unit' } } }
      ]);

      const consumedBeforeInBase = totalConsumedBefore.length > 0 ? toBaseUnit(totalConsumedBefore[0].total, totalConsumedBefore[0].unit) : 0;

      // Current consumption in base units
      const currentConsumptionInBase = toBaseUnit(item.quantityConsumed, item.unit);

      const openingBalanceInBase = issuedInBase - consumedBeforeInBase;
      const closingBalanceInBase = openingBalanceInBase - currentConsumptionInBase;

      if (closingBalanceInBase < 0) {
        overConsumption = true;
      }

      processedItems.push({
        itemId: item.itemId,
        quantityConsumed: item.quantityConsumed,
        unit: item.unit,
        openingBalance: openingBalanceInBase, // Store in base units for consistency
        closingBalance: closingBalanceInBase   // Store in base units for consistency
      });
    }

    const consumption = new HotelConsumption({
      hotelId,
      items: processedItems,
      date: consumptionDate,
      reportedBy,
      remarks
    });

    await consumption.save();

    res.status(201).json({
      message: 'Consumption entry created successfully',
      consumption,
      overConsumption
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating consumption entry', error: error.message });
  }
};

// GET /consumption - Get consumption records with filters
const getConsumption = async (req, res) => {
  try {
    const { hotelId, from, to } = req.query;

    // Role-based access
    if (req.user.role === 'hotel_manager' && req.user.hotelId.toString() !== hotelId) {
      return res.status(403).json({ message: 'You can only view consumption for your own hotel' });
    }

    let matchConditions = {};

    if (hotelId) {
      matchConditions.hotelId = new mongoose.Types.ObjectId(hotelId);
    }

    if (from && to) {
      matchConditions.date = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    }

    const consumptions = await HotelConsumption.find(matchConditions)
      .populate('hotelId', 'name')
      .populate('reportedBy', 'name')
      .populate('items.itemId', 'name')
      .sort({ date: -1 });

    res.json(consumptions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching consumption records', error: error.message });
  }
};

module.exports = {
  createConsumption,
  getConsumption
};
