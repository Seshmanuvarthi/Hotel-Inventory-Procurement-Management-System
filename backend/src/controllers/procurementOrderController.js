const ProcurementOrder = require('../models/ProcurementOrder');
const CentralStoreStock = require('../models/CentralStoreStock');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
require('dotenv').config();

// Cloudinary configuration will be skipped if CLOUDINARY_URL is invalid
if (process.env.CLOUDINARY_URL && process.env.CLOUDINARY_URL.startsWith('cloudinary://')) {
  try {
    cloudinary.config({
      cloudinary_url: process.env.CLOUDINARY_URL
    });
  } catch (error) {
    console.warn('Failed to configure Cloudinary:', error.message);
  }
} else {
  console.warn('CLOUDINARY_URL not found or invalid in environment variables. Cloudinary features may not work.');
}

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create procurement order (Procurement Officer)
const createProcurementOrder = async (req, res) => {
  try {
    const { vendorName, billNumber, billDate, items, remarks } = req.body;
    const requestedBy = req.user.id;

    // Validate required fields
    if (!vendorName || !billDate) {
      return res.status(400).json({ message: 'Vendor name and bill date are required' });
    }

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

// MD approve order with item selection
const mdApproveOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedItems, rejectedItems, remarks } = req.body;
    const approvedByMD = req.user.id;

    const order = await ProcurementOrder.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Procurement order not found' });
    }

    if (order.status !== 'pending_md_approval') {
      return res.status(400).json({ message: 'Order is not pending MD approval' });
    }

    // Update item approval status
    order.items.forEach((item, index) => {
      if (approvedItems && approvedItems.includes(index)) {
        item.mdApprovalStatus = 'approved';
      } else if (rejectedItems && rejectedItems.includes(index)) {
        item.mdApprovalStatus = 'rejected';
      } else {
        item.mdApprovalStatus = 'approved'; // Default to approved for backward compatibility
      }
    });

    // Generate unique bill number after MD approval
    const billNumber = `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Recalculate totals based on approved items only
    let subtotal = 0;
    let gstTotal = 0;

    order.items.forEach(item => {
      if (item.mdApprovalStatus === 'approved') {
        subtotal += item.quantity * item.pricePerUnit;
        gstTotal += item.gstAmount;
      }
    });

    order.subtotal = subtotal;
    order.gstTotal = gstTotal;
    order.finalAmount = subtotal + gstTotal;
    order.billNumber = billNumber;
    order.status = 'md_approved';
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

// Upload bill image (Store Manager)
const uploadBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { receivedItems, billDate, remarks } = req.body;
    const uploadedBy = req.user.id;

    const order = await ProcurementOrder.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Procurement order not found' });
    }

    if (order.status !== 'md_approved') {
      return res.status(400).json({ message: 'Order is not approved by MD' });
    }

    // Parse receivedItems if it's a string
    let parsedReceivedItems = receivedItems;
    if (typeof receivedItems === 'string') {
      try {
        parsedReceivedItems = JSON.parse(receivedItems);
      } catch (error) {
        return res.status(400).json({ message: 'Invalid receivedItems format' });
      }
    }

    // Calculate amounts based on received items
    let calculatedSubtotal = 0;
    let calculatedGstTotal = 0;

    // Update received status for items
    if (parsedReceivedItems && Array.isArray(parsedReceivedItems)) {
      order.items.forEach((item, index) => {
        if (item.mdApprovalStatus === 'approved') {
          const itemData = parsedReceivedItems.find(item => item.index === index);
          if (itemData) {
            item.receivedStatus = itemData.status;
            item.receivedQuantity = itemData.quantity || 0;

            // Calculate amounts based on received quantity
            if (item.receivedStatus === 'received' || item.receivedStatus === 'partial') {
              const actualQuantity = item.receivedQuantity || item.quantity;
              calculatedSubtotal += actualQuantity * item.pricePerUnit;
              calculatedGstTotal += (actualQuantity * item.pricePerUnit * item.gstPercentage) / 100;
            }
          } else {
            item.receivedStatus = 'not_received';
            item.receivedQuantity = 0;
          }
        }
      });
    }

    // Store calculated amounts
    order.calculatedAmount = calculatedSubtotal + calculatedGstTotal;
    order.calculatedSubtotal = calculatedSubtotal;
    order.calculatedGstTotal = calculatedGstTotal;

    // Update final amounts based on received quantities
    order.finalAmount = calculatedSubtotal + calculatedGstTotal;
    order.subtotal = calculatedSubtotal;
    order.gstTotal = calculatedGstTotal;

    // Upload image to Cloudinary if provided
    let billImageUrl = null;
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'procurement-bills',
            public_id: `bill-${order._id}-${Date.now()}`,
            resource_type: 'image'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      billImageUrl = result.secure_url;
    }

    order.billImageUrl = billImageUrl;
    order.billUploadedBy = uploadedBy;
    order.billUploadedAt = new Date();
    order.uploadDate = new Date();
    order.billDate = billDate ? new Date(billDate) : new Date();
    order.status = 'pending_payment';
    order.remarks = remarks || order.remarks;

    await order.save();

    // Update central store stock for received and partial items
    for (const item of order.items) {
      if (item.mdApprovalStatus === 'approved' && (item.receivedStatus === 'received' || item.receivedStatus === 'partial')) {
        let stock = await CentralStoreStock.findOne({ itemId: item.itemId });

        if (!stock) {
          stock = new CentralStoreStock({
            itemId: item.itemId,
            quantityOnHand: 0,
            minimumStockLevel: 0
          });
        }

        stock.quantityOnHand += item.receivedQuantity || item.quantity;

        // Update previousMaxStock if new stock exceeds it
        if (stock.quantityOnHand > (stock.previousMaxStock || 0)) {
          stock.previousMaxStock = stock.quantityOnHand;
        }

        stock.lastUpdated = new Date();
        await stock.save();
      }
    }

    res.json({
      message: 'Bill uploaded successfully and stock updated for received and partial items',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading bill', error: error.message });
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

    res.json({
      message: 'Payment marked successfully',
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
  uploadBill,
  markAsPaid,
  upload // Export multer upload middleware
};
