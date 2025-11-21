const StockIssue = require('../models/StockIssue');
const HotelConsumption = require('../models/HotelConsumption');
const CustomerOrder = require('../models/CustomerOrder');
const ExpectedConsumption = require('../models/ExpectedConsumption');
const Hotel = require('../models/Hotel');
const Item = require('../models/Item');
const SalesEntry = require('../models/SalesEntry');
const { toBaseUnit } = require('../utils/unitConverter');

// GET /reports/issued-vs-consumed
const getIssuedVsConsumed = async (req, res) => {
  try {
    const { hotelId, itemId, from, to } = req.query;
    const mongoose = require('mongoose');

    let matchConditions = {};

    if (hotelId) {
      if (!mongoose.Types.ObjectId.isValid(hotelId)) {
        return res.status(400).json({ message: 'Invalid hotelId provided' });
      }
      matchConditions.hotelId = new mongoose.Types.ObjectId(hotelId);
    }

    if (from && to) {
      matchConditions.dateIssued = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    }

    // Get total issued - convert to base units
    const issuedResult = await StockIssue.aggregate([
      { $match: matchConditions },
      { $unwind: '$items' },
      ...(itemId ? [{ $match: { 'items.itemId': new mongoose.Types.ObjectId(itemId) } }] : []),
      {
        $group: {
          _id: null,
          totalIssued: { $sum: '$items.quantityIssued' },
          unit: { $first: '$items.unit' }
        }
      }
    ]);

    const issued = issuedResult.length > 0 ? toBaseUnit(issuedResult[0].totalIssued, issuedResult[0].unit) : 0;

    // Get total consumed - convert to base units
    let consumptionMatch = {};
    if (hotelId) {
      consumptionMatch.hotelId = new mongoose.Types.ObjectId(hotelId);
    }
    if (from && to) {
      consumptionMatch.date = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    }

    const consumedResult = await HotelConsumption.aggregate([
      { $match: consumptionMatch },
      { $unwind: '$items' },
      ...(itemId ? [{ $match: { 'items.itemId': new mongoose.Types.ObjectId(itemId) } }] : []),
      {
        $group: {
          _id: null,
          totalConsumed: { $sum: '$items.quantityConsumed' },
          unit: { $first: '$items.unit' }
        }
      }
    ]);

    const consumed = consumedResult.length > 0 ? toBaseUnit(consumedResult[0].totalConsumed, consumedResult[0].unit) : 0;

    const leakage = issued - consumed;

    let hotelName = null;
    if (hotelId) {
      const hotel = await Hotel.findById(hotelId).select('name');
      hotelName = hotel?.name || 'Unknown Hotel';
    }

    res.json({
      issued,
      consumed,
      leakage,
      hotelId,
      hotelName,
      itemId,
      dateRange: { from, to }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating issued vs consumed report', error: error.message });
  }
};

// GET /reports/consumed-vs-sales
// GET /reports/consumed-vs-sales
const getConsumedVsSales = async (req, res) => {
  try {
    const { hotelId, from, to } = req.query;
    const mongoose = require('mongoose');

    // Validate hotelId if provided
    let matchConditions = {};
    if (hotelId) {
      if (!mongoose.Types.ObjectId.isValid(hotelId)) {
        return res.status(400).json({ message: 'Invalid hotelId provided' });
      }
      matchConditions.hotelId = new mongoose.Types.ObjectId(hotelId);
    }

    // Validate date range if provided
    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        return res.status(400).json({ message: 'Invalid from/to date' });
      }
      matchConditions.date = { $gte: fromDate, $lte: toDate };
    }

    // Get total consumed
    const consumedResult = await HotelConsumption.aggregate([
      { $match: matchConditions },
      { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          totalConsumed: { $sum: { $ifNull: ['$items.quantityConsumed', 0] } }
        }
      }
    ]);

    const consumed = consumedResult.length > 0 ? consumedResult[0].totalConsumed : 0;

    // Get total sales (quantity sold)
    const salesResult = await SalesEntry.aggregate([
      { $match: matchConditions },
      { $unwind: { path: '$sales', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          totalSold: { $sum: { $ifNull: ['$sales.quantitySold', 0] } }
        }
      }
    ]);

    const sales = salesResult.length > 0 ? salesResult[0].totalSold : 0;

    const difference = consumed - sales;

    let hotelName = null;
    if (hotelId) {
      const hotel = await Hotel.findById(hotelId).select('name');
      hotelName = hotel?.name || 'Unknown Hotel';
    }

    return res.json({
      consumed,
      sales,
      difference,
      hotelId,
      hotelName,
      dateRange: { from, to }
    });
  } catch (error) {
    console.error('Error in getConsumedVsSales:', error);
    return res.status(500).json({ message: 'Error generating consumed vs sales report', error: error.message });
  }
};

// GET /reports/leakage
const getLeakageReport = async (req, res) => {
  try {
    const { from, to, groupBy = 'hotel' } = req.query;

    let dateMatch = {};
    if (from && to) {
      dateMatch = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    }

    if (groupBy === 'hotel') {
      // Group by hotel
      const results = await Promise.all([
        // Get issued by hotel
        StockIssue.aggregate([
          ...(from && to ? [{ $match: { dateIssued: dateMatch } }] : []),
          { $unwind: '$items' },
          {
            $group: {
              _id: '$hotelId',
              totalIssued: { $sum: '$items.quantityIssued' }
            }
          }
        ]),
        // Get consumed by hotel
        HotelConsumption.aggregate([
          ...(from && to ? [{ $match: { date: dateMatch } }] : []),
          { $unwind: '$items' },
          {
            $group: {
              _id: '$hotelId',
              totalConsumed: { $sum: '$items.quantityConsumed' }
            }
          }
        ])
      ]);

      const issuedByHotel = results[0];
      const consumedByHotel = results[1];

      // Combine results
      const hotelLeakage = [];
      const allHotelIds = new Set([
        ...issuedByHotel.map(r => r._id.toString()),
        ...consumedByHotel.map(r => r._id.toString())
      ]);

      for (const hotelId of allHotelIds) {
        const issued = issuedByHotel.find(r => r._id.toString() === hotelId)?.totalIssued || 0;
        const consumed = consumedByHotel.find(r => r._id.toString() === hotelId)?.totalConsumed || 0;
        const leakage = issued - consumed;
        const percentDifference = issued > 0 ? ((leakage / issued) * 100).toFixed(2) : 0;

        hotelLeakage.push({
          hotelId,
          issued,
          consumed,
          leakage,
          percentDifference: parseFloat(percentDifference)
        });
      }

      // Sort by largest leakage
      hotelLeakage.sort((a, b) => b.leakage - a.leakage);

      // Populate hotel names and branches
      const populatedResults = await Promise.all(
        hotelLeakage.map(async (item) => {
          const hotel = await Hotel.findById(item.hotelId).select('name branch');
          return {
            ...item,
            hotelName: hotel ? `${hotel.name} - ${hotel.branch}` : 'Unknown Hotel'
          };
        })
      );

      res.json({
        groupBy: 'hotel',
        data: populatedResults,
        dateRange: { from, to }
      });

    } else if (groupBy === 'item') {
      // Group by item
      const results = await Promise.all([
        // Get issued by item
        StockIssue.aggregate([
          ...(from && to ? [{ $match: { dateIssued: dateMatch } }] : []),
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.itemId',
              totalIssued: { $sum: '$items.quantityIssued' }
            }
          }
        ]),
        // Get consumed by item
        HotelConsumption.aggregate([
          ...(from && to ? [{ $match: { date: dateMatch } }] : []),
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.itemId',
              totalConsumed: { $sum: '$items.quantityConsumed' }
            }
          }
        ])
      ]);

      const issuedByItem = results[0];
      const consumedByItem = results[1];

      // Combine results
      const itemLeakage = [];
      const allItemIds = new Set([
        ...issuedByItem.map(r => r._id.toString()),
        ...consumedByItem.map(r => r._id.toString())
      ]);

      for (const itemId of allItemIds) {
        const issued = issuedByItem.find(r => r._id.toString() === itemId)?.totalIssued || 0;
        const consumed = consumedByItem.find(r => r._id.toString() === itemId)?.totalConsumed || 0;
        const leakage = issued - consumed;
        const percentDifference = issued > 0 ? ((leakage / issued) * 100).toFixed(2) : 0;

        itemLeakage.push({
          itemId,
          issued,
          consumed,
          leakage,
          percentDifference: parseFloat(percentDifference)
        });
      }

      // Sort by largest leakage
      itemLeakage.sort((a, b) => b.leakage - a.leakage);

      // Populate item names
      const populatedResults = await Promise.all(
        itemLeakage.map(async (item) => {
          const itemDoc = await Item.findById(item.itemId).select('name');
          return {
            ...item,
            itemName: itemDoc?.name || 'Unknown Item'
          };
        })
      );

      res.json({
        groupBy: 'item',
        data: populatedResults,
        dateRange: { from, to }
      });
    } else {
      res.status(400).json({ message: 'Invalid groupBy parameter. Use "hotel" or "item"' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error generating leakage report', error: error.message });
  }
};

// GET /reports/expected-vs-actual
const getExpectedVsActual = async (req, res) => {
  try {
    const { hotelId, from, to } = req.query;

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

    // Get expected consumption (already in base units)
    const expectedResults = await ExpectedConsumption.aggregate([
      { $match: matchConditions },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.itemId',
          totalExpected: { $sum: '$items.expectedQuantity' }
        }
      }
    ]);

    // Get actual consumption - convert to base units
    const actualResults = await HotelConsumption.aggregate([
      { $match: matchConditions },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.itemId',
          totalActual: { $sum: '$items.quantityConsumed' },
          unit: { $first: '$items.unit' }
        }
      }
    ]);

    // Convert actual consumption to base units
    const actualResultsConverted = actualResults.map(result => ({
      ...result,
      totalActual: toBaseUnit(result.totalActual, result.unit)
    }));

    // Get issued stock - convert to base units
    const issuedResults = await StockIssue.aggregate([
      { $match: matchConditions },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.itemId',
          totalIssued: { $sum: '$items.quantityIssued' },
          unit: { $first: '$items.unit' }
        }
      }
    ]);

    // Convert issued stock to base units
    const issuedResultsConverted = issuedResults.map(result => ({
      ...result,
      totalIssued: toBaseUnit(result.totalIssued, result.unit)
    }));

    // Combine results
    const itemMap = new Map();

    // Add expected consumption
    expectedResults.forEach(item => {
      itemMap.set(item._id.toString(), {
        itemId: item._id,
        expectedConsumed: item.totalExpected,
        actualConsumed: 0,
        issued: 0
      });
    });

    // Add actual consumption
    actualResultsConverted.forEach(item => {
      const key = item._id.toString();
      if (itemMap.has(key)) {
        itemMap.get(key).actualConsumed = item.totalActual;
      } else {
        itemMap.set(key, {
          itemId: item._id,
          expectedConsumed: 0,
          actualConsumed: item.totalActual,
          issued: 0
        });
      }
    });

    // Add issued stock
    issuedResultsConverted.forEach(item => {
      const key = item._id.toString();
      if (itemMap.has(key)) {
        itemMap.get(key).issued = item.totalIssued;
      } else {
        itemMap.set(key, {
          itemId: item._id,
          expectedConsumed: 0,
          actualConsumed: 0,
          issued: item.totalIssued
        });
      }
    });

    // Convert to array and calculate leakage
    const results = Array.from(itemMap.values()).map(item => ({
      ...item,
      leakage: item.actualConsumed - item.expectedConsumed
    }));

    // Populate item names
    const populatedResults = await Promise.all(
      results.map(async (item) => {
        const itemDoc = await Item.findById(item.itemId).select('name');
        return {
          ...item,
          itemName: itemDoc?.name || 'Unknown Item'
        };
      })
    );

    res.json({
      data: populatedResults,
      hotelId,
      dateRange: { from, to }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating expected vs actual report', error: error.message });
  }
};

// GET /reports/wastage
const getWastageReport = async (req, res) => {
  try {
    const { hotelId, itemId, from, to } = req.query;

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

    // Get expected vs actual data
    const expectedResults = await ExpectedConsumption.aggregate([
      { $match: matchConditions },
      { $unwind: '$items' },
      ...(itemId ? [{ $match: { 'items.itemId': new require('mongoose').Types.ObjectId(itemId) } }] : []),
      {
        $group: {
          _id: '$items.itemId',
          totalExpected: { $sum: '$items.expectedQuantity' }
        }
      }
    ]);

    const actualResults = await HotelConsumption.aggregate([
      { $match: matchConditions },
      { $unwind: '$items' },
      ...(itemId ? [{ $match: { 'items.itemId': new require('mongoose').Types.ObjectId(itemId) } }] : []),
      {
        $group: {
          _id: '$items.itemId',
          totalActual: { $sum: '$items.quantityConsumed' }
        }
      }
    ]);

    // Combine and calculate wastage
    const wastageMap = new Map();

    expectedResults.forEach(item => {
      wastageMap.set(item._id.toString(), {
        itemId: item._id,
        expectedConsumed: item.totalExpected,
        actualConsumed: 0
      });
    });

    actualResults.forEach(item => {
      const key = item._id.toString();
      if (wastageMap.has(key)) {
        wastageMap.get(key).actualConsumed = item.totalActual;
      } else {
        wastageMap.set(key, {
          itemId: item._id,
          expectedConsumed: 0,
          actualConsumed: item.totalActual
        });
      }
    });

    const wastageData = Array.from(wastageMap.values())
      .map(item => ({
        ...item,
        wastage: item.actualConsumed - item.expectedConsumed,
        wastagePercentage: item.expectedConsumed > 0 ? ((item.actualConsumed - item.expectedConsumed) / item.expectedConsumed * 100).toFixed(2) : 0
      }))
      .filter(item => item.wastage > 0) // Only show items with wastage
      .sort((a, b) => b.wastage - a.wastage); // Sort by highest wastage

    // Populate item names
    const populatedResults = await Promise.all(
      wastageData.map(async (item) => {
        const itemDoc = await Item.findById(item.itemId).select('name');
        return {
          ...item,
          itemName: itemDoc?.name || 'Unknown Item'
        };
      })
    );

    res.json({
      data: populatedResults,
      hotelId,
      itemId,
      dateRange: { from, to }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating wastage report', error: error.message });
  }
};

module.exports = {
  getIssuedVsConsumed,
  getConsumedVsSales,
  getLeakageReport,
  getExpectedVsActual,
  getWastageReport
};
