const StockIssue = require('../models/StockIssue');
const CentralStoreStock = require('../models/CentralStoreStock');
const Hotel = require('../models/Hotel');
const Item = require('../models/Item');
const { decreaseStockOnIssue } = require('./storeStockController');

// Create stock issue
const createStockIssue = async (req, res) => {
  try {
    const { hotelId, items, requestType, approvedBy, remarks } = req.body;
    const issuedBy = req.user.id;

    // Generate unique issue number
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const issueNumber = `ISSUE-${dateStr}-${randomNum}`;

    // Validate hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // Prepare items with previous stock after issue
    const processedItems = [];

    for (const item of items) {
      const stock = await CentralStoreStock.findOne({ itemId: item.itemId })
        .populate('itemId', 'name unit');

      if (!stock) {
        return res.status(400).json({
          message: `Stock not found for item ${item.itemId}`
        });
      }

      if (stock.quantityOnHand < item.quantityIssued) {
        return res.status(400).json({
          message: `Insufficient stock for ${stock.itemId.name}. Available: ${stock.quantityOnHand}, Requested: ${item.quantityIssued}`
        });
      }

      // Decrease stock
      stock.quantityOnHand -= item.quantityIssued;
      stock.lastUpdated = new Date();
      await stock.save();

      processedItems.push({
        itemId: item.itemId,
        quantityIssued: item.quantityIssued,
        unit: stock.itemId.unit,
        previousStockAfterIssue: stock.quantityOnHand
      });
    }

    // Create stock issue record
    const stockIssue = new StockIssue({
      hotelId,
      items: processedItems,
      requestType,
      issuedBy,
      approvedBy,
      remarks,
      issueNumber
    });

    await stockIssue.save();

    res.status(201).json({
      message: 'Stock issued successfully',
      issueNumber,
      stockIssue
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating stock issue', error: error.message });
  }
};

// Get all issue logs
const getIssueLogs = async (req, res) => {
  try {
    const issues = await StockIssue.find()
      .populate('hotelId', 'name location')
      .populate('issuedBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('items.itemId', 'name')
      .sort({ dateIssued: -1 });

    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching issue logs', error: error.message });
  }
};

// Get issue logs by hotel
const getIssueLogByHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const issues = await StockIssue.find({ hotelId })
      .populate('hotelId', 'name location')
      .populate('issuedBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('items.itemId', 'name')
      .sort({ dateIssued: -1 });

    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching issue logs for hotel', error: error.message });
  }
};

module.exports = {
  createStockIssue,
  getIssueLogs,
  getIssueLogByHotel
};
