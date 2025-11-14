const SalesEntry = require('../models/SalesEntry');
const Recipe = require('../models/Recipe');
const ExpectedConsumption = require('../models/ExpectedConsumption');
const { toBaseUnit, areUnitsCompatible } = require('../utils/unitConverter');

// POST /sales - Create sales entry
const createSales = async (req, res) => {
  try {
    const { hotelId, sales, date, remarks } = req.body;
    const reportedBy = req.user.id;

    // Validate hotelId - hotel_manager can only report for their own hotel
    if (req.user.role === 'hotel_manager' && req.user.hotelId.toString() !== hotelId) {
      return res.status(403).json({ message: 'You can only report sales for your own hotel' });
    }

    // Calculate amounts for each sales item
    const processedSales = sales.map(item => ({
      dishName: item.dishName,
      quantitySold: item.quantitySold,
      pricePerUnit: item.pricePerUnit,
      amount: item.quantitySold * item.pricePerUnit
    }));

    // Calculate total sales amount
    const totalSalesAmount = processedSales.reduce((total, item) => total + item.amount, 0);

    const salesEntry = new SalesEntry({
      hotelId,
      sales: processedSales,
      totalSalesAmount,
      date: new Date(date),
      reportedBy,
      remarks
    });

    await salesEntry.save();

    // Calculate expected consumption
    await calculateExpectedConsumption(hotelId, processedSales, new Date(date));

    res.status(201).json({
      message: 'Sales entry created successfully',
      salesEntry
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating sales entry', error: error.message });
  }
};

// GET /sales - Get sales records with filters
const getSales = async (req, res) => {
  try {
    const { hotelId, from, to } = req.query;

    // Role-based access
    if (req.user.role === 'hotel_manager' && req.user.hotelId.toString() !== hotelId) {
      return res.status(403).json({ message: 'You can only view sales for your own hotel' });
    }

    let matchConditions = {};

    if (hotelId) {
      matchConditions.hotelId = new require('mongoose').Types.ObjectId(hotelId);
    }

    if (from && to) {
      matchConditions.date = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    }

    const sales = await SalesEntry.find(matchConditions)
      .populate('hotelId', 'name')
      .populate('reportedBy', 'name')
      .sort({ date: -1 });

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sales records', error: error.message });
  }
};

// Function to calculate expected consumption
const calculateExpectedConsumption = async (hotelId, sales, date) => {
  try {
    // Get date without time for grouping
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // Initialize expected consumption map
    const expectedConsumptionMap = new Map();

    // Process each dish sold
    for (const sale of sales) {
      const { dishName, quantitySold } = sale;

      // Find recipe for this dish
      const recipe = await Recipe.findOne({ dishName }).populate('ingredients.itemId');
      if (!recipe) continue; // Skip if no recipe found

      // Calculate expected consumption for each ingredient
      for (const ingredient of recipe.ingredients) {
        const { itemId, quantityRequired, unit } = ingredient;

        // Convert recipe quantity to base unit for consistent calculations
        const recipeQtyInBase = toBaseUnit(quantityRequired, unit);
        const expectedQuantityInBase = quantitySold * recipeQtyInBase;

        const itemKey = itemId._id.toString();

        if (!expectedConsumptionMap.has(itemKey)) {
          expectedConsumptionMap.set(itemKey, {
            itemId: itemId._id,
            expectedQuantity: 0,
            fromSales: []
          });
        }

        const itemData = expectedConsumptionMap.get(itemKey);
        itemData.expectedQuantity += expectedQuantityInBase;
        itemData.fromSales.push({
          dishName,
          quantitySold,
          recipeQtyRequired: quantityRequired,
          recipeUnit: unit,
          calculated: expectedQuantityInBase
        });
      }
    }

    // Convert map to array
    const items = Array.from(expectedConsumptionMap.values());

    if (items.length === 0) return; // No expected consumption to save

    // Try to find existing expected consumption for this hotel and date
    let expectedConsumption = await ExpectedConsumption.findOne({ hotelId, date: dateOnly });

    if (expectedConsumption) {
      // Update existing document - merge items
      const existingItemsMap = new Map();
      expectedConsumption.items.forEach(item => {
        existingItemsMap.set(item.itemId.toString(), item);
      });

      // Merge new items with existing ones
      items.forEach(newItem => {
        const itemKey = newItem.itemId.toString();
        if (existingItemsMap.has(itemKey)) {
          const existingItem = existingItemsMap.get(itemKey);
          existingItem.expectedQuantity += newItem.expectedQuantity;
          existingItem.fromSales.push(...newItem.fromSales);
        } else {
          expectedConsumption.items.push(newItem);
        }
      });

      await expectedConsumption.save();
    } else {
      // Create new document
      expectedConsumption = new ExpectedConsumption({
        hotelId,
        date: dateOnly,
        items
      });
      await expectedConsumption.save();
    }

  } catch (error) {
    console.error('Error calculating expected consumption:', error);
    // Don't throw error to avoid breaking sales entry creation
  }
};

module.exports = {
  createSales,
  getSales
};
