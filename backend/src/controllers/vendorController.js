const Vendor = require('../models/Vendor');

// Create Vendor
const createVendor = async (req, res) => {
  try {
    const { name, contactPerson, phone, email, address, gstNumber, panNumber, bankDetails, paymentTerms } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ message: 'Vendor name is required' });
    }

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingVendor) {
      return res.status(400).json({ message: 'Vendor with this name already exists' });
    }

    const newVendor = new Vendor({
      name,
      contactPerson,
      phone,
      email,
      address,
      gstNumber,
      panNumber,
      bankDetails,
      paymentTerms,
      createdBy: req.user.id
    });

    await newVendor.save();
    res.status(201).json({ message: 'Vendor created successfully', vendor: newVendor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get All Vendors
const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json(vendors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Vendor by ID
const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.status(200).json(vendor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Vendor
const updateVendor = async (req, res) => {
  try {
    const { name, contactPerson, phone, email, address, gstNumber, panNumber, bankDetails, paymentTerms } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ message: 'Vendor name is required' });
    }

    // Check if another vendor with same name exists
    const existingVendor = await Vendor.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: req.params.id }
    });
    if (existingVendor) {
      return res.status(400).json({ message: 'Another vendor with this name already exists' });
    }

    const updatedVendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      {
        name,
        contactPerson,
        phone,
        email,
        address,
        gstNumber,
        panNumber,
        bankDetails,
        paymentTerms
      },
      { new: true }
    );

    if (!updatedVendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.status(200).json({ message: 'Vendor updated successfully', vendor: updatedVendor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Disable Vendor
const disableVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.status(200).json({ message: 'Vendor disabled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  disableVendor
};
