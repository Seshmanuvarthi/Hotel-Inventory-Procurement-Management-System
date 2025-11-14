const ProcurementOrder = require('../models/ProcurementOrder');
const CentralStoreStock = require('../models/CentralStoreStock');

// Create procurement order (Procurement Officer)
const createProcurementOrder = async (req, res) => {
  try {
    const { vendorName, billNumber, billDate, items, remarks } = req.body;
    const requestedBy = req.user.id;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' });
    }

    // Calculate totals from frontend data
    let subtotal = 0;
    let gstTotal = 0;

    const processedItems = items.map(item => {
      const amountBeforeGST = item.quantity * item.pricePerUnit;
      subtotal += amountBeforeGST;
      gstTotal += item.gstAmount;

      return {
        itemId: item.itemId,
        quantity: item.quantity,
        unit: item.unit,
        pricePerUnit: item.pricePerUnit,
        gstPercentage: item.gstPercentage || 5,
        gstAmount: item.gstAmount,
        totalAmount: item.totalAmount
      };
    });

    const finalAmount = subtotal + gstTotal;

    // Create procurement order
    const procurementOrder = new ProcurementOrder({
      vendorName,
      billNumber,
      billDate,
      items: processedItems,
      subtotal,
      gstTotal,
      finalAmount,
      requestedBy,
      remarks,
      status: 'pending_md_approval'
    });

    await procurementOrder.save();

    res.status(201).json({
      message: 'Procurement order created successfully',
      procurementOrder
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating procurement order', error: error.message });
  }
};

// Get all procurement orders
const getAllProcurementOrders = async (req, res) => {
  try {
    const orders = await ProcurementOrder.find()
      .populate('requestedBy', 'name email')
      .populate('approvedByMD', 'name email')
      .populate('paidBy', 'name email')
      .populate('items.itemId', 'name')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching procurement orders', error: error.message });
  }
};

// Get procurement order by ID
const getProcurementOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await ProcurementOrder.findById(id)
      .populate('requestedBy', 'name email')
      .populate('approvedByMD', 'name email')
      .populate('paidBy', 'name email')
      .populate('items.itemId', 'name unit');

    if (!order) {
      return res.status(404).json({ message: 'Procurement order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching procurement order', error: error.message });
  }
};

// MD approve order
const mdApproveOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const approvedByMD = req.user.id;

    const order = await ProcurementOrder.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Procurement order not found' });
    }

    if (order.status !== 'pending_md_approval') {
      return res.status(400).json({ message: 'Order is not pending MD approval' });
    }

    order.status = 'pending_payment';
    order.approvedByMD = approvedByMD;
    order.approvedAt = new Date();
    order.remarks = remarks || order.remarks;

    await order.save();

    res.json({
      message: 'Procurement order approved successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Error approving procurement order', error: error.message });
  }
};

// MD reject order
const mdRejectOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const order = await ProcurementOrder.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Procurement order not found' });
    }

    if (order.status !== 'pending_md_approval') {
      return res.status(400).json({ message: 'Order is not pending MD approval' });
    }

    order.status = 'rejected';
    order.remarks = remarks || order.remarks;

    await order.save();

    res.json({
      message: 'Procurement order rejected successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting procurement order', error: error.message });
  }
};

// Mark as paid (Accounts)
const markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMode, remarks } = req.body;
    const paidBy = req.user.id;

    const order = await ProcurementOrder.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Procurement order not found' });
    }

    if (order.status !== 'pending_payment') {
      return res.status(400).json({ message: 'Order is not pending payment' });
    }

    order.status = 'paid';
    order.paidBy = paidBy;
    order.paidAt = new Date();
    order.paymentMode = paymentMode;
    order.remarks = remarks || order.remarks;

    await order.save();

    // Update central store stock
    for (const item of order.items) {
      let stock = await CentralStoreStock.findOne({ itemId: item.itemId });

      if (!stock) {
        stock = new CentralStoreStock({
          itemId: item.itemId,
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
    }

    res.json({
      message: 'Payment marked successfully and stock updated',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Error marking payment', error: error.message });
  }
};

module.exports = {
  createProcurementOrder,
  getAllProcurementOrders,
  getProcurementOrderById,
  mdApproveOrder,
  mdRejectOrder,
  markAsPaid
};
