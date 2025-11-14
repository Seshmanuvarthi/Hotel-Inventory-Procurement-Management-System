const ProcurementRequest = require('../models/ProcurementRequest');
const ProcurementBill = require('../models/ProcurementBill');
const User = require('../models/User');

// Create procurement request
const createProcurementRequest = async (req, res) => {
  try {
    const { items, remarks, source } = req.body;
    const requestedBy = req.user.id;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' });
    }

    // Calculate totalAmount for each item
    const processedItems = items.map(item => ({
      ...item,
      totalAmount: item.quantity * item.pricePerUnit
    }));

    const procurementRequest = new ProcurementRequest({
      requestedBy,
      items: processedItems,
      remarks,
      source
    });

    await procurementRequest.save();

    res.status(201).json({
      message: 'Procurement request created successfully',
      procurementRequest
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating procurement request', error: error.message });
  }
};

// Get all procurement requests
const getAllRequests = async (req, res) => {
  try {
    const requests = await ProcurementRequest.find()
      .populate('requestedBy', 'name email')
      .populate('approvalLogs.approvedBy', 'name email')
      .populate('items.itemId', 'name')
      .sort({ requestDate: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching procurement requests', error: error.message });
  }
};

// Get procurement request by ID
const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await ProcurementRequest.findById(id)
      .populate('requestedBy', 'name email')
      .populate('approvalLogs.approvedBy', 'name email')
      .populate('items.itemId', 'name unit gstApplicable');

    if (!request) {
      return res.status(404).json({ message: 'Procurement request not found' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching procurement request', error: error.message });
  }
};

// MD approve request
const mdApproveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const approvedBy = req.user.id;

    const request = await ProcurementRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Procurement request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    request.status = 'approved';
    request.approvalLogs.push({
      approvedBy,
      action: 'approved',
      remarks
    });

    await request.save();

    res.json({
      message: 'Procurement request approved successfully',
      request
    });
  } catch (error) {
    res.status(500).json({ message: 'Error approving procurement request', error: error.message });
  }
};

// MD reject request
const mdRejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const approvedBy = req.user.id;

    const request = await ProcurementRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Procurement request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    request.status = 'rejected';
    request.approvalLogs.push({
      approvedBy,
      action: 'rejected',
      remarks
    });

    await request.save();

    res.json({
      message: 'Procurement request rejected successfully',
      request
    });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting procurement request', error: error.message });
  }
};

// Upload bill (handled in procurementBillController)
const uploadBill = async (req, res) => {
  // This will be handled by procurementBillController
  res.status(501).json({ message: 'Use procurementBillController for bill upload' });
};

// Get all bills
const getBills = async (req, res) => {
  try {
    const bills = await ProcurementBill.find()
      .populate('procurementRequestId', 'requestDate status')
      .populate('uploadedBy', 'name email')
      .populate('items.itemId', 'name')
      .sort({ uploadDate: -1 });

    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bills', error: error.message });
  }
};

// Get bill by ID
const getBillById = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await ProcurementBill.findById(id)
      .populate('procurementRequestId', 'requestDate status items')
      .populate('uploadedBy', 'name email')
      .populate('items.itemId', 'name unit');

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bill', error: error.message });
  }
};

module.exports = {
  createProcurementRequest,
  getAllRequests,
  getRequestById,
  mdApproveRequest,
  mdRejectRequest,
  uploadBill,
  getBills,
  getBillById
};
