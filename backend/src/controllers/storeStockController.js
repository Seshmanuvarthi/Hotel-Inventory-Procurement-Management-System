const CentralStoreStock = require('../models/CentralStoreStock');
const ProcurementRequest = require('../models/ProcurementRequest');
const Item = require('../models/Item');

// Get all store stock
const getStoreStock = async (req, res) => {
  try {
    const stocks = await CentralStoreStock.find()
      .populate('itemId', 'name category unit gstApplicable vendors')
      .sort({ lastUpdated: -1 });

    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching store stock', error: error.message });
  }
};

// Initialize stock for new item (optional)
const initializeStockForNewItem = async (itemId) => {
  try {
    const item = await Item.findById(itemId);
    if (!item) return;

    const existingStock = await CentralStoreStock.findOne({ itemId });
    if (existingStock) return;

    const newStock = new CentralStoreStock({
      itemId,
      quantityOnHand: 0,
      minimumStockLevel: 0
    });

    await newStock.save();
  } catch (error) {
    console.error('Error initializing stock for new item:', error);
  }
};

// Increase stock on procurement approval
const increaseStockOnProcurement = async (req, res) => {
  try {
    const { procurementRequestId } = req.body;

    const procurementRequest = await ProcurementRequest.findById(procurementRequestId)
      .populate('items.itemId');

    if (!procurementRequest || procurementRequest.status !== 'approved') {
      return res.status(400).json({ message: 'Invalid or unapproved procurement request' });
    }

    const updatedStocks = [];

    for (const item of procurementRequest.items) {
      let stock = await CentralStoreStock.findOne({ itemId: item.itemId._id });

      if (!stock) {
        stock = new CentralStoreStock({
          itemId: item.itemId._id,
          quantityOnHand: 0,
          minimumStockLevel: 0
        });
      }

      stock.quantityOnHand += item.quantity;

      // Update previousMaxStock if new stock exceeds it
      if (stock.quantityOnHand > (stock.previousMaxStock || 0)) {
        stock.previousMaxStock = stock.quantityOnHand;
      }

      stock.lastUpdated = new Date();
      await stock.save();

      updatedStocks.push(stock);
    }

    res.json({
      message: 'Stock updated successfully on procurement',
      updatedStocks
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating stock on procurement', error: error.message });
  }
};

// Decrease stock on issue to hotel
const decreaseStockOnIssue = async (req, res) => {
  try {
    const { hotelId, items } = req.body;

    const updatedStocks = [];

    for (const issueItem of items) {
      const stock = await CentralStoreStock.findOne({ itemId: issueItem.itemId });

      if (!stock) {
        return res.status(400).json({
          message: `Stock not found for item ${issueItem.itemId}`
        });
      }

      if (stock.quantityOnHand < issueItem.quantityIssued) {
        return res.status(400).json({
          message: `Insufficient stock for item ${issueItem.itemId}. Available: ${stock.quantityOnHand}, Requested: ${issueItem.quantityIssued}`
        });
      }

      stock.quantityOnHand -= issueItem.quantityIssued;
      stock.lastUpdated = new Date();
      await stock.save();

      updatedStocks.push({
        itemId: issueItem.itemId,
        previousStockAfterIssue: stock.quantityOnHand
      });
    }

    res.json({
      message: 'Stock decreased successfully on issue',
      updatedStocks
    });
  } catch (error) {
    res.status(500).json({ message: 'Error decreasing stock on issue', error: error.message });
  }
};

module.exports = {
  getStoreStock,
  initializeStockForNewItem,
  increaseStockOnProcurement,
  decreaseStockOnIssue
};
