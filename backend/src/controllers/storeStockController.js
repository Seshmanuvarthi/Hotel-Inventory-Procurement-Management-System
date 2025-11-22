const CentralStoreStock = require('../models/CentralStoreStock');
const Item = require('../models/Item');
const StockIssue = require('../models/StockIssue');
const ProcurementOrder = require('../models/ProcurementOrder');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Hotel = require('../models/Hotel');

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

// Get inward stock logs (procurement orders where items have been received)
const getInwardStockLogs = async (req, res) => {
  try {
    const orders = await ProcurementOrder.find({ status: 'paid' })
      .populate('requestedBy', 'name')
      .populate('paidBy', 'name')
      .populate('items.itemId', 'name category unit')
      .sort({ paidAt: -1 });

    const inwardLogs = [];

    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.receivedStatus === 'received' && item.receivedQuantity > 0) {
          inwardLogs.push({
            date: order.paidAt,
            itemName: item.itemId.name,
            quantity: item.receivedQuantity,
            unit: item.unit,
            vendor: order.vendorName,
            procurementOrder: order.billNumber || order._id.toString(),
            receivedBy: order.paidBy?.name || 'N/A',
            remarks: ''
          });
        }
      });
    });

    res.json(inwardLogs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inward stock logs', error: error.message });
  }
};

// Get outward stock logs (stock issues to hotels)
const getOutwardStockLogs = async (req, res) => {
  try {
    const logs = await StockIssue.find()
      .populate('hotelId', 'name')
      .populate('issuedBy', 'name')
      .populate('approvedBy', 'name')
      .populate('items.itemId', 'name category unit')
      .sort({ dateIssued: -1 });

    const outwardLogs = logs.map(issue => ({
      issueId: issue._id,
      issueNumber: issue.issueNumber,
      hotelName: issue.hotelId?.name,
      issuedBy: issue.issuedBy?.name,
      approvedBy: issue.approvedBy?.name,
      dateIssued: issue.dateIssued,
      remarks: issue.remarks,
      items: issue.items.map(item => ({
        itemId: item.itemId._id,
        itemName: item.itemId.name,
        category: item.itemId.category,
        unit: item.unit,
        quantityIssued: item.quantityIssued,
        previousStockAfterIssue: item.previousStockAfterIssue
      }))
    }));

    res.json(outwardLogs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching outward stock logs', error: error.message });
  }
};

module.exports = {
  getStoreStock,
  initializeStockForNewItem,
  increaseStockOnProcurement,
  decreaseStockOnIssue,
  getInwardStockLogs,
  getOutwardStockLogs
};
