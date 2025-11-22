const ProcurementOrder = require('../models/ProcurementOrder');
const getLeakageData = require('../services/leakageService');
const StockIssue = require('../models/StockIssue');
const HotelConsumption = require('../models/HotelConsumption');
const CustomerOrder = require('../models/CustomerOrder');
const ExpectedConsumption = require('../models/ExpectedConsumption');
const Hotel = require('../models/Hotel');
const Item = require('../models/Item');
const LeakageAlert = require('../models/LeakageAlert');
const SalesEntry = require('../models/SalesEntry');
const mongoose = require('mongoose');

// GET /md-dashboard/summary
const getSummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Total procurement this month
    const procurementResult = await ProcurementOrder.aggregate([
      { $match: { createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } }
    ]);
    const totalProcurementThisMonth = procurementResult[0]?.total || 0;

    // Total payments this month (paid orders)
    const paymentsResult = await ProcurementOrder.aggregate([
      { $match: { paidAt: { $gte: startOfMonth, $lte: endOfMonth }, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } }
    ]);
    const totalPaymentsThisMonth = paymentsResult[0]?.total || 0;

    // Total pending amount (all orders - paid orders)
    const allOrdersResult = await ProcurementOrder.aggregate([
      { $group: { _id: null, total: { $sum: '$finalAmount' } } }
    ]);
    const paidOrdersResult = await ProcurementOrder.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } }
    ]);
    const totalOrders = allOrdersResult[0]?.total || 0;
    const totalPaid = paidOrdersResult[0]?.total || 0;
    const totalPendingAmount = totalOrders - totalPaid;

    // Total leakage percentage ((issued - consumed) / issued) * 100
    const issuedResult = await StockIssue.aggregate([
      { $match: { dateIssued: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $unwind: '$items' },
      { $group: { _id: null, total: { $sum: '$items.quantityIssued' } } }
    ]);
    const consumedResult = await HotelConsumption.aggregate([
      { $match: { date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $unwind: '$items' },
      { $group: { _id: null, total: { $sum: '$items.quantityConsumed' } } }
    ]);
    const totalIssued = issuedResult.length > 0 ? issuedResult[0].total : 0;
    const totalConsumed = consumedResult.length > 0 ? consumedResult[0].total : 0;
    const totalLeakagePercentage = totalIssued > 0 ? ((totalIssued - totalConsumed) / totalIssued * 100).toFixed(2) : 0;

    // Total wastage percentage (actual - expected) / expected * 100
    const expectedResult = await ExpectedConsumption.aggregate([
      { $match: { date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $unwind: '$items' },
      { $group: { _id: null, total: { $sum: '$items.expectedQuantity' } } }
    ]);
    const totalExpected = expectedResult.length > 0 ? expectedResult[0].total : 0;
    const wastage = totalConsumed - totalExpected;
    const totalWastagePercentage = totalExpected > 0 ? ((wastage / totalExpected) * 100).toFixed(2) : 0;

    // Total sales this month
    const salesResult = await SalesEntry.aggregate([
      { $match: { date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalSalesAmount' } } }
    ]);
    const totalSalesThisMonth = salesResult.length > 0 ? salesResult[0].total : 0;

    res.json({
      totalProcurementThisMonth,
      totalPaymentsThisMonth,
      totalPendingAmount,
      totalLeakagePercentage: parseFloat(totalLeakagePercentage),
      totalWastagePercentage: parseFloat(totalWastagePercentage),
      totalSalesThisMonth,
      activeAlerts: await LeakageAlert.countDocuments({ status: 'active' })
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching summary', error: error.message });
  }
};

// GET /md-dashboard/leakage-chart?from=&to=
const getLeakageChart = async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateMatch = from && to ? { $gte: new Date(from), $lte: new Date(to) } : {};

    const results = await Promise.all([
      StockIssue.aggregate([
        ...(from && to ? [{ $match: { dateIssued: dateMatch } }] : []),
        { $unwind: '$items' },
        { $group: { _id: '$items.itemId', totalIssued: { $sum: '$items.quantityIssued' } } }
      ]),
      HotelConsumption.aggregate([
        ...(from && to ? [{ $match: { date: dateMatch } }] : []),
        { $unwind: '$items' },
        { $group: { _id: '$items.itemId', totalConsumed: { $sum: '$items.quantityConsumed' } } }
      ])
    ]);

    const issuedByItem = results[0];
    const consumedByItem = results[1];

    const itemLeakage = [];
    const allItemIds = new Set([
      ...issuedByItem.map(r => r._id.toString()),
      ...consumedByItem.map(r => r._id.toString())
    ]);

    for (const itemId of allItemIds) {
      const issued = issuedByItem.find(r => r._id.toString() === itemId)?.totalIssued || 0;
      const consumed = consumedByItem.find(r => r._id.toString() === itemId)?.totalConsumed || 0;
      const leakage = issued > 0 ? ((issued - consumed) / issued * 100).toFixed(2) : 0;
      itemLeakage.push({ itemId, expected: issued, actual: consumed, leakage: parseFloat(leakage) });
    }

    const populatedResults = await Promise.all(
      itemLeakage.map(async (item) => {
        const itemDoc = await Item.findById(item.itemId).select('name');
        return { ...item, itemName: itemDoc?.name || 'Unknown Item' };
      })
    );

    res.json(populatedResults);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leakage chart', error: error.message });
  }
};

// GET /md-dashboard/hotel-leakage?from=&to=
const getHotelLeakage = async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateMatch = from && to ? { $gte: new Date(from), $lte: new Date(to) } : {};

    const results = await Promise.all([
      StockIssue.aggregate([
        ...(from && to ? [{ $match: { dateIssued: dateMatch } }] : []),
        { $unwind: '$items' },
        { $group: { _id: '$hotelId', totalIssued: { $sum: '$items.quantityIssued' } } }
      ]),
      HotelConsumption.aggregate([
        ...(from && to ? [{ $match: { date: dateMatch } }] : []),
        { $unwind: '$items' },
        { $group: { _id: '$hotelId', totalConsumed: { $sum: '$items.quantityConsumed' } } }
      ])
    ]);

    const issuedByHotel = results[0];
    const consumedByHotel = results[1];

    const hotelLeakage = [];
    const allHotelIds = new Set([
      ...issuedByHotel.map(r => r._id.toString()),
      ...consumedByHotel.map(r => r._id.toString())
    ]);

    for (const hotelId of allHotelIds) {
      const issued = issuedByHotel.find(r => r._id.toString() === hotelId)?.totalIssued || 0;
      const consumed = consumedByHotel.find(r => r._id.toString() === hotelId)?.totalConsumed || 0;
      const leakage = issued > 0 ? ((issued - consumed) / issued * 100).toFixed(2) : 0;
      hotelLeakage.push({ hotelId, expected: issued, actual: consumed, leakage: parseFloat(leakage) });
    }

    const populatedResults = await Promise.all(
      hotelLeakage.map(async (item) => {
        const hotel = await Hotel.findById(item.hotelId).select('name');
        return { ...item, hotelName: hotel?.name || 'Unknown Hotel' };
      })
    );

    res.json(populatedResults);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hotel leakage', error: error.message });
  }
};

// GET /md-dashboard/procurement-vs-payments?year=
const getProcurementVsPayments = async (req, res) => {
  try {
    const { year } = req.query;
    const yearInt = parseInt(year) || new Date().getFullYear();

    const monthlyData = [];

    for (let month = 0; month < 12; month++) {
      const startOfMonth = new Date(yearInt, month, 1);
      const endOfMonth = new Date(yearInt, month + 1, 0);

      const procurementResult = await ProcurementOrder.aggregate([
        { $match: { createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } }
      ]);

      const paymentsResult = await ProcurementOrder.aggregate([
        { $match: { paidAt: { $gte: startOfMonth, $lte: endOfMonth }, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } }
      ]);

      const procurement = procurementResult.length > 0 ? procurementResult[0].total : 0;
      const payments = paymentsResult.length > 0 ? paymentsResult[0].total : 0;

      monthlyData.push({
        month: startOfMonth.toLocaleString('default', { month: 'short' }),
        procurement,
        payments
      });
    }

    res.json(monthlyData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching procurement vs payments', error: error.message });
  }
};

// GET /md-dashboard/item-consumption-trend?itemId=&range=
const getItemConsumptionTrend = async (req, res) => {
  try {
    const { itemId, range } = req.query;
    if (!itemId) return res.status(400).json({ message: 'itemId is required' });

    const now = new Date();
    let startDate;
    if (range === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    } else {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const consumptionData = await HotelConsumption.aggregate([
      { $match: { date: { $gte: startDate } } },
      { $unwind: '$items' },
      { $match: { 'items.itemId': mongoose.Types.ObjectId(itemId) } },
      {
        $group: {
          _id: range === 'monthly' ? { $dateToString: { format: '%Y-%m', date: '$date' } } : { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalConsumed: { $sum: '$items.quantityConsumed' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const trend = consumptionData.map(item => ({
      date: item._id,
      consumption: item.totalConsumed
    }));

    res.json(trend);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching item consumption trend', error: error.message });
  }
};

// GET /md-dashboard/expected-vs-actual-top-items?from=&to=
const getExpectedVsActualTopItems = async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateMatch = from && to ? { $gte: new Date(from), $lte: new Date(to) } : {};

    const expectedResults = await ExpectedConsumption.aggregate([
      ...(from && to ? [{ $match: { date: dateMatch } }] : []),
      { $unwind: '$items' },
      { $group: { _id: '$items.itemId', totalExpected: { $sum: '$items.expectedQuantity' } } }
    ]);

    const actualResults = await HotelConsumption.aggregate([
      ...(from && to ? [{ $match: { date: dateMatch } }] : []),
      { $unwind: '$items' },
      { $group: { _id: '$items.itemId', totalActual: { $sum: '$items.quantityConsumed' } } }
    ]);

    const itemMap = new Map();
    expectedResults.forEach(item => {
      itemMap.set(item._id.toString(), { itemId: item._id, expected: item.totalExpected, actual: 0 });
    });
    actualResults.forEach(item => {
      const key = item._id.toString();
      if (itemMap.has(key)) {
        itemMap.get(key).actual = item.totalActual;
      } else {
        itemMap.set(key, { itemId: item._id, expected: 0, actual: item.totalActual });
      }
    });

    const items = Array.from(itemMap.values())
      .map(item => ({ ...item, leakage: item.actual - item.expected }))
      .sort((a, b) => Math.abs(b.leakage) - Math.abs(a.leakage))
      .slice(0, 5);

    const populatedResults = await Promise.all(
      items.map(async (item) => {
        const itemDoc = await Item.findById(item.itemId).select('name');
        return { ...item, itemName: itemDoc?.name || 'Unknown Item' };
      })
    );

    res.json(populatedResults);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expected vs actual top items', error: error.message });
  }
};

// GET /md-dashboard/vendor-performance?from=&to=
const getVendorPerformance = async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateMatch = from && to ? { $gte: new Date(from), $lte: new Date(to) } : {};

    const orders = await ProcurementOrder.aggregate([
      ...(from && to ? [{ $match: { createdAt: dateMatch } }] : []),
      { $group: { _id: '$vendorName', totalProcured: { $sum: '$finalAmount' } } }
    ]);

    const paidOrders = await ProcurementOrder.aggregate([
      ...(from && to ? [{ $match: { paidAt: dateMatch, status: 'paid' } }] : [{ $match: { status: 'paid' } }]),
      { $group: { _id: '$vendorName', totalPaid: { $sum: '$finalAmount' } } }
    ]);

    const vendorMap = new Map();
    orders.forEach(order => {
      vendorMap.set(order._id, { vendorName: order._id, totalProcured: order.totalProcured, totalPaid: 0 });
    });
    paidOrders.forEach(paidOrder => {
      const key = paidOrder._id;
      if (vendorMap.has(key)) {
        vendorMap.get(key).totalPaid = paidOrder.totalPaid;
      } else {
        vendorMap.set(key, { vendorName: key, totalProcured: 0, totalPaid: paidOrder.totalPaid });
      }
    });

    const vendorPerformance = Array.from(vendorMap.values()).map(vendor => ({
      ...vendor,
      pendingAmount: vendor.totalProcured - vendor.totalPaid
    }));

    res.json(vendorPerformance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendor performance', error: error.message });
  }
};

// GET /md-dashboard/insights?from=&to=
const getInsights = async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateMatch = from && to ? { $gte: new Date(from), $lte: new Date(to) } : {};

    const insights = [];

    // Insight 1: High leakage items
    const leakageItems = await getLeakageData(from, to);

    const highLeakage = leakageItems.filter(item => item.leakage > 10).slice(0, 3);
    if (highLeakage.length > 0) {
      insights.push(`High leakage detected in items: ${highLeakage.map(i => i.itemName).join(', ')}. Consider reviewing inventory management.`);
    }

    // Insight 2: Pending payments
    const paidOrdersResult = await ProcurementOrder.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, totalPaid: { $sum: '$finalAmount' } } }
    ]);
    const totalPaid = paidOrdersResult.length > 0 ? paidOrdersResult[0].totalPaid : 0;
    const totalOrdersResult = await ProcurementOrder.aggregate([
      { $group: { _id: null, total: { $sum: '$finalAmount' } } }
    ]);
    const totalOrders = totalOrdersResult.length > 0 ? totalOrdersResult[0].total : 0;
    const pending = totalOrders - totalPaid;
    if (pending > 10000) {
      insights.push(`High pending payments amounting to ₹${pending}. Review payment schedules.`);
    }

    // Insight 3: Low orders vs consumption
    const ordersResult = await CustomerOrder.aggregate([
      ...(from && to ? [{ $match: { date: dateMatch } }] : []),
      { $group: { _id: null, total: { $sum: { $size: '$orders' } } } }
    ]);
    const totalOrderCount = ordersResult.length > 0 ? ordersResult[0].total : 0;
    const consumedResult = await HotelConsumption.aggregate([
      ...(from && to ? [{ $match: { date: dateMatch } }] : []),
      { $unwind: '$items' },
      { $group: { _id: null, total: { $sum: '$items.quantityConsumed' } } }
    ]);
    const totalConsumed = consumedResult.length > 0 ? consumedResult[0].total : 0;
    if (totalConsumed > totalOrderCount * 1.5) {
      insights.push(`Consumption significantly higher than orders. Possible wastage or unrecorded orders.`);
    }

    // Insight 4: Top performing hotels
    const hotelSales = await SalesEntry.aggregate([
      ...(from && to ? [{ $match: { date: dateMatch } }] : []),
      { $group: { _id: '$hotelId', totalSales: { $sum: '$totalSalesAmount' } } },
      { $sort: { totalSales: -1 } },
      { $limit: 3 }
    ]);
    if (hotelSales.length > 0) {
      const topHotels = await Promise.all(
        hotelSales.map(async (h) => {
          const hotel = await Hotel.findById(h._id).select('name');
          return hotel?.name || 'Unknown';
        })
      );
      insights.push(`Top performing hotels: ${topHotels.join(', ')}.`);
    }

    res.json(insights);
  } catch (error) {
    console.error('Error in getInsights:', error); // Log the error
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

module.exports = {
  getSummary,
  getLeakageChart,
  getHotelLeakage,
  getProcurementVsPayments,
  getItemConsumptionTrend,
  getExpectedVsActualTopItems,
  getVendorPerformance,
  getInsights
};
