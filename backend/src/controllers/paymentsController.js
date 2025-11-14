const PaymentEntry = require('../models/PaymentEntry');
const ProcurementBill = require('../models/ProcurementBill');
const mongoose = require('mongoose');

// Create a payment entry
const createPayment = async (req, res) => {
  try {
    const { procurementBillId, amountPaid, paymentMode, paymentDate, remarks } = req.body;
    const paidBy = req.user.id;

    // Validate bill exists
    const bill = await ProcurementBill.findById(procurementBillId);
    if (!bill) {
      return res.status(404).json({ message: 'Procurement bill not found' });
    }

    // Calculate total paid so far
    const existingPayments = await PaymentEntry.aggregate([
      { $match: { procurementBillId: mongoose.Types.ObjectId(procurementBillId) } },
      { $group: { _id: null, totalPaid: { $sum: '$amountPaid' } } }
    ]);
    const totalPaid = existingPayments.length > 0 ? existingPayments[0].totalPaid : 0;

    // Check if payment exceeds remaining amount
    if (totalPaid + amountPaid > bill.finalAmount) {
      return res.status(400).json({ message: 'Payment amount exceeds the remaining bill amount' });
    }

    // Create payment
    const payment = new PaymentEntry({
      procurementBillId,
      vendorName: bill.vendorName,
      amountPaid,
      paymentMode,
      paymentDate,
      paidBy,
      remarks
    });

    await payment.save();

    // Update bill status
    const newTotalPaid = totalPaid + amountPaid;
    let status = 'unpaid';
    if (newTotalPaid === bill.finalAmount) {
      status = 'paid';
    } else if (newTotalPaid > 0) {
      status = 'partially_paid';
    }
    // Note: Assuming we add a status field to ProcurementBill; for now, we can calculate it dynamically

    res.status(201).json({ message: 'Payment created successfully', payment });
  } catch (error) {
    res.status(500).json({ message: 'Error creating payment', error: error.message });
  }
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

// Get payments by vendor
const getPaymentsByVendor = async (req, res) => {
  try {
    const { vendorName } = req.params;
    const bills = await ProcurementBill.find({ vendorName }).select('_id vendorName billNumber finalAmount billDate');
    const payments = await PaymentEntry.find({ vendorName }).populate('procurementBillId', 'billNumber finalAmount').populate('paidBy', 'name');

    // Calculate pending for each bill
    const ledger = bills.map(bill => {
      const billPayments = payments.filter(p => p.procurementBillId._id.toString() === bill._id.toString());
      const totalPaid = billPayments.reduce((sum, p) => sum + p.amountPaid, 0);
      const pending = bill.finalAmount - totalPaid;
      return {
        bill,
        payments: billPayments,
        totalPaid,
        pending
      };
    });

    res.json(ledger);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendor ledger', error: error.message });
  }
};

// Get pending payments (bills with no or partial payments)
const getPendingPayments = async (req, res) => {
  try {
    const bills = await ProcurementBill.find().select('_id vendorName billNumber finalAmount billDate');
    const payments = await PaymentEntry.find();

    const pendingBills = bills.filter(bill => {
      const billPayments = payments.filter(p => p.procurementBillId.toString() === bill._id.toString());
      const totalPaid = billPayments.reduce((sum, p) => sum + p.amountPaid, 0);
      return totalPaid < bill.finalAmount;
    }).map(bill => {
      const billPayments = payments.filter(p => p.procurementBillId.toString() === bill._id.toString());
      const totalPaid = billPayments.reduce((sum, p) => sum + p.amountPaid, 0);
      return {
        ...bill.toObject(),
        totalPaid,
        pending: bill.finalAmount - totalPaid
      };
    });

    res.json(pendingBills);
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
      match.paymentDate = { $gte: new Date(from), $lte: new Date(to) };
    }

    const summary = await PaymentEntry.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalPaid: { $sum: '$amountPaid' }
        }
      }
    ]);

    const totalProcured = await ProcurementBill.aggregate([
      { $match: from && to ? { billDate: { $gte: new Date(from), $lte: new Date(to) } } : {} },
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
