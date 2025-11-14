const CentralStoreStock = require('../models/CentralStoreStock');
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

// Increase stock on procurement approval (deprecated - now handled in procurementOrderController)
const increaseStockOnProcurement = async (req, res) => {
  return res.status(410).json({ message: 'This endpoint is deprecated. Stock updates are now handled automatically when orders are paid.' });
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
