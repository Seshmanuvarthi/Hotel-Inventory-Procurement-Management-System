const Item = require('../models/Item');

// Create Item
const createItem = async (req, res) => {
  try {
    const { name, category, unit, gstApplicable, vendors } = req.body;

    // Validation
    if (!name || !category || !unit) {
      return res.status(400).json({ message: 'Name, category, and unit are required' });
    }
    if (!vendors || vendors.length === 0) {
      return res.status(400).json({ message: 'At least one vendor is required' });
    }
    for (const vendor of vendors) {
      if (!vendor.vendorName || typeof vendor.lastPrice !== 'number') {
        return res.status(400).json({ message: 'Vendor name and lastPrice (number) are required for each vendor' });
      }
    }

    const newItem = new Item({
      name,
      category,
      unit,
      gstApplicable: gstApplicable || false,
      vendors
    });

    await newItem.save();
    res.status(201).json({ message: 'Item created successfully', item: newItem });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get All Items
const getItems = async (req, res) => {
  try {
    const items = await Item.find({ isActive: true });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Item by ID
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Item
const updateItem = async (req, res) => {
  try {
    const { name, category, unit, gstApplicable, vendors } = req.body;

    // Validation
    if (!name || !category || !unit) {
      return res.status(400).json({ message: 'Name, category, and unit are required' });
    }
    if (!vendors || vendors.length === 0) {
      return res.status(400).json({ message: 'At least one vendor is required' });
    }
    for (const vendor of vendors) {
      if (!vendor.vendorName || typeof vendor.lastPrice !== 'number') {
        return res.status(400).json({ message: 'Vendor name and lastPrice (number) are required for each vendor' });
      }
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { name, category, unit, gstApplicable, vendors },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({ message: 'Item updated successfully', item: updatedItem });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Disable Item
const disableItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({ message: 'Item disabled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  disableItem
};
