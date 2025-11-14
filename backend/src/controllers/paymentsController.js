const PaymentEntry = require('../models/PaymentEntry');
const ProcurementOrder = require('../models/ProcurementOrder');
const mongoose = require('mongoose');

// Create a payment entry (deprecated - now handled in procurementOrderController)
const createPayment = async (req, res) => {
  return res.status(410).json({ message: 'This endpoint is deprecated. Payments are now handled automatically when orders are marked as paid.' });
};

// Get all payments
const getAllPayments = async (req, res) => {
  try {
    const payments = await PaymentEntry.find().populate('procurementBillId', 'vendorName billNumber').populate('paidBy', 'name');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

// Get payments by vendor (deprecated - now handled in procurementOrderController)
const getPaymentsByVendor = async (req, res) => {
  return res.status(410).json({ message: 'This endpoint is deprecated. Vendor payments are now tracked in procurement orders.' });
};

// Get pending payments (approved orders that are not paid)
const getPendingPayments = async (req, res) => {
  try {
    const orders = await ProcurementOrder.find({ status: 'approved' })
      .select('_id vendorName billNumber finalAmount createdAt')
      .sort({ createdAt: -1 });

    const pendingOrders = orders.map(order => ({
      ...order.toObject(),
      totalPaid: 0,
      pending: order.finalAmount
    }));

    res.json(pendingOrders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending payments', error: error.message });
  }
};

// Get payment summary
const getPaymentSummary = async (req, res) => {
  try {
    const { from, to } = req.query;
    let match = {};
    if (from && to) {
      match.createdAt = { $gte: new Date(from), $lte: new Date(to) };
    }

    const summary = await ProcurementOrder.aggregate([
      { $match: { ...match, status: 'paid' } },
      {
        $group: {
          _id: null,
          totalPaid: { $sum: '$finalAmount' }
        }
      }
    ]);

    const totalProcured = await ProcurementOrder.aggregate([
      { $match: from && to ? { createdAt: { $gte: new Date(from), $lte: new Date(to) } } : {} },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } }
    ]);

    const totalProcuredAmount = totalProcured.length > 0 ? totalProcured[0].total : 0;
    const totalPaid = summary.length > 0 ? summary[0].totalPaid : 0;
    const totalPending = totalProcuredAmount - totalPaid;

    res.json({
      totalProcured: totalProcuredAmount,
      totalPaid,
      totalPending
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment summary', error: error.message });
  }
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentsByVendor,
  getPendingPayments,
  getPaymentSummary
};
