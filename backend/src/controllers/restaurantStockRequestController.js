const RestaurantStockRequest = require('../models/RestaurantStockRequest');
const CentralStoreStock = require('../models/CentralStoreStock');
const StockIssue = require('../models/StockIssue');
const User = require('../models/User');
const Hotel = require('../models/Hotel');

// Create restaurant stock request
const createRestaurantStockRequest = async (req, res) => {
  try {
    const { items, remarks } = req.body;
    const requestedBy = req.user.id;

    // Get restaurant ID from user
    const user = await User.findById(requestedBy).populate('hotelId');
    if (!user || !user.hotelId) {
      return res.status(400).json({ message: 'User is not associated with a restaurant' });
    }

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' });
    }

    // Validate that all items exist and have valid quantities
    for (const item of items) {
      if (!item.itemId || !item.requestedQuantity || item.requestedQuantity <= 0) {
        return res.status(400).json({ message: 'Invalid item data' });
      }
    }

    const restaurantStockRequest = new RestaurantStockRequest({
      restaurantId: user.hotelId,
      requestedBy,
      items: items.map(item => ({
        itemId: item.itemId,
        requestedQuantity: item.requestedQuantity,
        unit: item.unit
      })),
      remarks
    });

    await restaurantStockRequest.save();

    res.status(201).json({
      message: 'Restaurant stock request created successfully',
      request: restaurantStockRequest
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating restaurant stock request', error: error.message });
  }
};

// Get all restaurant stock requests for a restaurant
const getRestaurantStockRequests = async (req, res) => {
  try {
    const requestedBy = req.user.id;

    // Get restaurant ID from user
    const user = await User.findById(requestedBy).populate('hotelId');
    if (!user || !user.hotelId) {
      return res.status(400).json({ message: 'User is not associated with a restaurant' });
    }

    const requests = await RestaurantStockRequest.find({ restaurantId: user.hotelId })
      .populate('requestedBy', 'name email')
      .populate('fulfilledBy', 'name email')
      .populate('items.itemId', 'name')
      .sort({ requestDate: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching restaurant stock requests', error: error.message });
  }
};

// Get all pending restaurant stock requests (for store manager)
const getPendingRestaurantStockRequests = async (req, res) => {
  try {
    const requests = await RestaurantStockRequest.find({
      overallStatus: { $in: ['pending', 'partially_issued'] }
    })
      .populate('restaurantId', 'name')
      .populate('requestedBy', 'name email')
      .populate('items.itemId', 'name')
      .sort({ requestDate: 1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending restaurant stock requests', error: error.message });
  }
};

// Fulfill restaurant stock request (store manager)
const fulfillRestaurantStockRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { itemsToIssue } = req.body; // Array of { itemId, quantity }
    const fulfilledBy = req.user.id;

const request = await RestaurantStockRequest.findById(id).populate('restaurantId');
if (!request) {
  return res.status(404).json({ message: 'Restaurant stock request not found' });
}
if (!request.restaurantId) {
  return res.status(400).json({ message: 'Restaurant not found' });
}

    if (request.overallStatus === 'fulfilled' || request.overallStatus === 'rejected') {
      return res.status(400).json({ message: 'Request is already processed' });
    }

    // Validate items and collect issued items
    const issuedItems = [];
    for (const issueItem of itemsToIssue) {
      const requestItem = request.items.find(item => item.itemId.toString() === issueItem.itemId.toString());
      if (!requestItem) {
        return res.status(400).json({ message: `Item ${issueItem.itemId} not found in request` });
      }

      if (requestItem.status === 'fulfilled') {
        continue;
      }

      // Check stock availability
      const stock = await CentralStoreStock.findOne({ itemId: issueItem.itemId });
      if (!stock || stock.quantityOnHand < issueItem.quantity) {
        return res.status(400).json({ message: `Insufficient stock for item ${requestItem.itemId}. Available: ${stock?.quantityOnHand || 0}` });
      }

      issuedItems.push({
        item: issueItem,
        requestItem: requestItem,
        stock: stock
      });
    }

    // Update request items and stock
    for (const issued of issuedItems) {
      const { item, requestItem, stock } = issued;

      // Update request item
      requestItem.issuedQuantity += item.quantity;
      if (requestItem.issuedQuantity >= requestItem.requestedQuantity) {
        requestItem.status = 'fulfilled';
      } else {
        requestItem.status = 'partially_issued';
      }

      // Update central store stock
      stock.quantityOnHand -= item.quantity;
      stock.lastUpdated = new Date();
      await stock.save();
    }

    // Create stock issue record if any items were issued
    if (issuedItems.length > 0) {
      const stockIssueItems = issuedItems.map(issued => ({
        itemId: issued.item.itemId,
        quantityIssued: issued.item.quantity,
        unit: issued.requestItem.unit,
        previousStockAfterIssue: issued.stock.quantityOnHand
      }));

      const stockIssue = new StockIssue({
        hotelId: request.restaurantId._id,
        issuedBy: fulfilledBy,
        items: stockIssueItems,
        requestType: 'system-request',
        remarks: `Fulfilled restaurant stock request #${request._id}`
      });

      await stockIssue.save();
    }

    // Update overall request status
    const allFulfilled = request.items.every(item => item.status === 'fulfilled');
    const anyPartiallyIssued = request.items.some(item => item.status === 'partially_issued');

    if (allFulfilled) {
      request.overallStatus = 'fulfilled';
      request.fulfilledBy = fulfilledBy;
      request.fulfilledAt = new Date();
    } else if (anyPartiallyIssued) {
      request.overallStatus = 'partially_issued';
    }

    await request.save();

    res.json({
      message: 'Restaurant stock request fulfilled successfully',
      request,
      stockIssue
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fulfilling restaurant stock request', error: error.message });
  }
};

// Reject restaurant stock request (store manager)
const rejectRestaurantStockRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const rejectedBy = req.user.id;

    const request = await RestaurantStockRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Restaurant stock request not found' });
    }

    if (request.overallStatus !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    request.overallStatus = 'rejected';
    request.remarks = remarks || request.remarks;
    request.fulfilledBy = rejectedBy;
    request.fulfilledAt = new Date();

    // Mark all items as rejected
    request.items.forEach(item => {
      item.status = 'rejected';
    });

    await request.save();

    res.json({
      message: 'Restaurant stock request rejected successfully',
      request
    });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting restaurant stock request', error: error.message });
  }
};

// Get restaurant stock request by ID
const getRestaurantStockRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const request = await RestaurantStockRequest.findById(id)
      .populate('restaurantId', 'name')
      .populate('requestedBy', 'name email')
      .populate('fulfilledBy', 'name email')
      .populate('items.itemId', 'name');

    if (!request) {
      return res.status(404).json({ message: 'Restaurant stock request not found' });
    }

    // Check permissions: hotel_manager can view their own restaurant's requests, store_manager can view all
    if (user.role === 'hotel_manager') {
      const userHotel = await User.findById(user.id).populate('hotelId');
      if (!userHotel || !userHotel.hotelId || request.restaurantId._id.toString() !== userHotel.hotelId._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (user.role !== 'store_manager' && user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching restaurant stock request', error: error.message });
  }
};

module.exports = {
  createRestaurantStockRequest,
  getRestaurantStockRequests,
  getPendingRestaurantStockRequests,
  getRestaurantStockRequestById,
  fulfillRestaurantStockRequest,
  rejectRestaurantStockRequest
};
