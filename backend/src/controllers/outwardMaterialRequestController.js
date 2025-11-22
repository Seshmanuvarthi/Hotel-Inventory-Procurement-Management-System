const OutwardMaterialRequest = require('../models/OutwardMaterialRequest');
const CentralStoreStock = require('../models/CentralStoreStock');
const StockIssue = require('../models/StockIssue');
const Item = require('../models/Item');
const Hotel = require('../models/Hotel');
const User = require('../models/User');

// Create outward material request
const createOutwardMaterialRequest = async (req, res) => {
  try {
    const { hotelId, items, remarks } = req.body;
    const issuedBy = req.user.id;

    // Validate hotel
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(400).json({ message: 'Hotel not found' });
    }

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' });
    }

    // Validate that all items exist and have valid quantities
    for (const item of items) {
      if (!item.itemId || !item.quantityToIssue || item.quantityToIssue <= 0) {
        return res.status(400).json({ message: 'Invalid item data' });
      }
    }

    const outwardMaterialRequest = new OutwardMaterialRequest({
      hotelId,
      issuedBy,
      items: items.map(item => ({
        itemId: item.itemId,
        quantityToIssue: item.quantityToIssue,
        unit: item.unit
      })),
      remarks
    });

    await outwardMaterialRequest.save();

    res.status(201).json({
      message: 'Outward material request created successfully',
      request: outwardMaterialRequest
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating outward material request', error: error.message });
  }
};

// Get all outward material requests
const getOutwardMaterialRequests = async (req, res) => {
  try {
    const requests = await OutwardMaterialRequest.find()
      .populate('hotelId', 'name')
      .populate('issuedBy', 'name email')
      .populate('items.itemId', 'name category')
      .sort({ requestDate: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching outward material requests', error: error.message });
  }
};

// Get outward material request by ID
const getOutwardMaterialRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await OutwardMaterialRequest.findById(id)
      .populate('hotelId', 'name')
      .populate('issuedBy', 'name email')
      .populate('items.itemId', 'name category');

    if (!request) {
      return res.status(404).json({ message: 'Outward material request not found' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching outward material request', error: error.message });
  }
};

// Issue outward material request (direct issuance)
const issueOutwardMaterialRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const issuedBy = req.user.id;

    const request = await OutwardMaterialRequest.findById(id).populate('hotelId');
    if (!request) {
      return res.status(404).json({ message: 'Outward material request not found' });
    }

    if (request.overallStatus === 'issued') {
      return res.status(400).json({ message: 'Request is already issued' });
    }

    // Validate stock availability and collect items to issue
    const issuedItems = [];
    for (const requestItem of request.items) {
      if (requestItem.status === 'issued') {
        continue;
      }

      // Check stock availability
      const stock = await CentralStoreStock.findOne({ itemId: requestItem.itemId });
      if (!stock || stock.quantityOnHand < requestItem.quantityToIssue) {
        return res.status(400).json({ message: `Insufficient stock for item ${requestItem.itemId}. Available: ${stock?.quantityOnHand || 0}` });
      }

      issuedItems.push({
        item: requestItem,
        stock: stock
      });
    }

    // Update request items and stock
    for (const issued of issuedItems) {
      const { item, stock } = issued;

      // Update request item
      item.issuedQuantity = item.quantityToIssue;
      item.status = 'issued';

      // Update central store stock
      stock.quantityOnHand -= item.quantityToIssue;
      stock.lastUpdated = new Date();
      await stock.save();
    }

    // Create stock issue record
    if (issuedItems.length > 0) {
      const stockIssueItems = issuedItems.map(issued => ({
        itemId: issued.item.itemId,
        quantityIssued: issued.item.quantityToIssue,
        unit: issued.item.unit,
        previousStockAfterIssue: issued.stock.quantityOnHand
      }));

      const stockIssue = new StockIssue({
        hotelId: request.hotelId._id,
        issuedBy: issuedBy,
        items: stockIssueItems,
        requestType: 'outward-request',
        remarks: `Issued outward material request #${request._id}`
      });

      await stockIssue.save();
    }

    // Update overall request status
    request.overallStatus = 'issued';
    request.issuedAt = new Date();

    await request.save();

    res.json({
      message: 'Outward material request issued successfully',
      request,
      stockIssue
    });
  } catch (error) {
    res.status(500).json({ message: 'Error issuing outward material request', error: error.message });
  }
};

// Get items by category
const getItemsByCategory = async (req, res) => {
  try {
    const { category } = req.query;

    let query = { isActive: true };
    if (category) {
      query.category = category;
    }

    const items = await Item.find(query).select('name category unit');

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching items', error: error.message });
  }
};

module.exports = {
  createOutwardMaterialRequest,
  getOutwardMaterialRequests,
  getOutwardMaterialRequestById,
  issueOutwardMaterialRequest,
  getItemsByCategory
};
