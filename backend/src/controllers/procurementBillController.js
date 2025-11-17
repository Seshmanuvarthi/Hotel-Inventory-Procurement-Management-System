const ProcurementBill = require('../models/ProcurementBill');
const ProcurementRequest = require('../models/ProcurementRequest');
const CentralStoreStock = require('../models/CentralStoreStock');

// Upload bill and attach to procurement request
const uploadBill = async (req, res) => {
  try {
    const { id } = req.params; // procurementRequestId
    const {
      vendorName,
      billNumber,
      billDate,
      items,
      billFileUrl,
      remarks
    } = req.body;

    const uploadedBy = req.user.id;

    // Verify procurement request exists and is approved
    const procurementRequest = await ProcurementRequest.findById(id);
    if (!procurementRequest) {
      return res.status(404).json({ message: 'Procurement request not found' });
    }

    if (procurementRequest.status !== 'approved') {
      return res.status(400).json({ message: 'Procurement request must be approved before uploading bill' });
    }

    // Calculate totals
    let totalAmountBeforeGST = 0;
    let gstTotal = 0;

    const processedItems = items.map(item => {
      const amountBeforeGST = item.quantity * item.pricePerUnit;
      totalAmountBeforeGST += amountBeforeGST;

      if (item.gstApplicable) {
        gstTotal += item.gstAmount;
      }

      return {
        itemId: item.itemId,
        quantity: item.quantity,
        unit: item.unit,
        pricePerUnit: item.pricePerUnit,
        gstApplicable: item.gstApplicable,
        gstAmount: item.gstAmount,
        totalAmount: amountBeforeGST + (item.gstApplicable ? item.gstAmount : 0)
      };
    });

    const finalAmount = totalAmountBeforeGST + gstTotal;

    // Create bill
    const bill = new ProcurementBill({
      procurementRequestId: id,
      vendorName,
      billNumber,
      billDate,
      items: processedItems,
      totalAmountBeforeGST,
      gstTotal,
      finalAmount,
      uploadedBy,
      billFileUrl,
      remarks
    });

    await bill.save();

    // Update central store stock
    for (const item of processedItems) {
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

    res.status(201).json({
      message: 'Bill uploaded successfully and stock updated',
      bill
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading bill', error: error.message });
  }
};

module.exports = {
  uploadBill
};
