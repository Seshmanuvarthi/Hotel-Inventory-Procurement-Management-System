const Hotel = require('../models/Hotel');

// Create a new hotel (superadmin only)
const createHotel = async (req, res) => {
  try {
    const { name, branch, location, code } = req.body;

    // Validate required fields
    if (!name || !branch || !location) {
      return res.status(400).json({ success: false, message: 'Name, branch, and location are required.' });
    }

    // Auto-generate code if not provided
    let hotelCode = code;
    if (!hotelCode) {
      hotelCode = name.toUpperCase().slice(0, 3) + '-' + branch.toUpperCase().slice(0, 3);
    }

    // Create hotel
    const hotel = new Hotel({
      name,
      branch,
      location,
      code: hotelCode
    });

    await hotel.save();

    res.status(201).json({ success: true, data: hotel });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'Hotel code must be unique.' });
    } else {
      res.status(500).json({ success: false, message: 'Server error.', error: error.message });
    }
  }
};

// Get all hotels (multiple roles)
const getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ isActive: true });
    res.status(200).json({ success: true, data: hotels });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Get a single hotel by ID (multiple roles)
const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel || !hotel.isActive) {
      return res.status(404).json({ success: false, message: 'Hotel not found.' });
    }
    res.status(200).json({ success: true, data: hotel });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Update a hotel (superadmin only)
const updateHotel = async (req, res) => {
  try {
    const { name, branch, location, code } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (branch) updateData.branch = branch;
    if (location) updateData.location = location;
    if (code) updateData.code = code;
    updateData.updatedAt = Date.now();

    const hotel = await Hotel.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found.' });
    }

    res.status(200).json({ success: true, data: hotel });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'Hotel code must be unique.' });
    } else {
      res.status(500).json({ success: false, message: 'Server error.', error: error.message });
    }
  }
};

// Delete a hotel (soft delete, superadmin only)
const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found.' });
    }

    res.status(200).json({ success: true, message: 'Hotel deactivated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

module.exports = {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel
};
