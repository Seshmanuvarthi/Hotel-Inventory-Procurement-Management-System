const mongoose = require('mongoose');
const SalesEntry = require('../models/SalesEntry');
const Hotel = require('../models/Hotel');
const Item = require('../models/Item');

// POST /sales - Create sales entry
const createSales = async (req, res) => {
  try {
    const { hotelId, sales, date, remarks } = req.body;
    const reportedBy = req.user.id;

    // Validate hotelId - hotel_manager can only report for their own hotel
    if (req.user.role === 'hotel_manager' && req.user.hotelId.toString() !== hotelId) {
      return res.status(403).json({ message: 'You can only report sales for your own hotel' });
    }

    const salesDate = new Date(date);

    // Calculate total sales amount
    let totalSalesAmount = 0;
    const processedSales = sales.map(sale => {
      const totalPrice = sale.quantitySold * sale.pricePerUnit;
      totalSalesAmount += totalPrice;
      return {
        itemId: sale.itemId,
        quantitySold: sale.quantitySold,
        unit: sale.unit,
        pricePerUnit: sale.pricePerUnit,
        totalPrice
      };
    });

    const salesEntry = new SalesEntry({
      hotelId,
      sales: processedSales,
      date: salesDate,
      totalSalesAmount,
      reportedBy,
      remarks
    });

    await salesEntry.save();

    res.status(201).json({
      message: 'Sales entry created successfully',
      salesEntry
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating sales entry', error: error.message });
  }
};

// GET /sales - Get sales records with filters
const getSales = async (req, res) => {
  try {
    const { hotelId, from, to } = req.query;

    // Role-based access
    if (req.user.role === 'hotel_manager' && req.user.hotelId.toString() !== hotelId) {
      return res.status(403).json({ message: 'You can only view sales for your own hotel' });
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

    const salesEntries = await SalesEntry.find(matchConditions)
      .populate('hotelId', 'name')
      .populate('reportedBy', 'name')
      .populate('sales.itemId', 'name')
      .sort({ date: -1 });

    res.json(salesEntries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sales records', error: error.message });
  }
};

module.exports = {
  createSales,
  getSales
};
