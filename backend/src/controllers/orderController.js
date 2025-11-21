const CustomerOrder = require('../models/CustomerOrder');
const Recipe = require('../models/Recipe');
const ExpectedConsumption = require('../models/ExpectedConsumption');
const Item = require('../models/Item');
const { toBaseUnit, areUnitsCompatible } = require('../utils/unitConverter');

// POST /orders - Create order entry
const createOrders = async (req, res) => {
  try {
    const { hotelId, orders, date, remarks } = req.body;
    const reportedBy = req.user.id;

    // Validate hotelId - hotel_manager can only report for their own hotel
    if (req.user.role === 'hotel_manager' && req.user.hotelId.toString() !== hotelId) {
      return res.status(403).json({ message: 'You can only report orders for your own hotel' });
    }

    // Validate orders structure
    const processedOrders = orders.map(order => ({
      orderId: order.orderId,
      items: order.items.map(item => ({
        dishName: item.dishName,
        quantity: item.quantity,
        volume: item.volume || 1,
        pricePerMl: item.pricePerMl,
        amount: item.amount,
        unit: item.unit || 'plates'
      }))
    }));

    const customerOrder = new CustomerOrder({
      hotelId,
      orders: processedOrders,
      date: new Date(date),
      reportedBy,
      remarks
    });

    await customerOrder.save();

    // Calculate expected consumption from all dishes in all orders
    const allDishes = [];
    processedOrders.forEach(order => {
      order.items.forEach(item => {
        allDishes.push({
          dishName: item.dishName,
          quantitySold: item.quantity
        });
      });
    });

    await calculateExpectedConsumption(hotelId, allDishes, new Date(date));

    res.status(201).json({
      message: 'Order entry created successfully',
      customerOrder
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order entry', error: error.message });
  }
};

// GET /orders - Get order records with filters
const getOrders = async (req, res) => {
  try {
    const { hotelId, from, to } = req.query;

    // Role-based access
    if (req.user.role === 'hotel_manager' && req.user.hotelId.toString() !== hotelId) {
      return res.status(403).json({ message: 'You can only view orders for your own hotel' });
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

    const orders = await CustomerOrder.find(matchConditions)
      .populate('hotelId', 'name')
      .populate('reportedBy', 'name')
      .sort({ date: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order records', error: error.message });
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
      const { dishName, quantitySold, pricePerMl, amount } = sale;

      // Find recipe for this dish
      const recipe = await Recipe.findOne({ dishName }).populate('ingredients.itemId');
      if (recipe) {
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
              fromOrders: []
            });
          }

          const itemData = expectedConsumptionMap.get(itemKey);
          itemData.expectedQuantity += expectedQuantityInBase;
          itemData.fromOrders.push({
            dishName,
            quantityOrdered: quantitySold,
            recipeQtyRequired: quantityRequired,
            recipeUnit: unit,
            pricePerMl,
            amount,
            calculated: expectedQuantityInBase
          });
        }
      } else {
        // Check if it's a bar item (no recipe, but item exists)
        const item = await Item.findOne({ name: dishName, category: 'Bar' });
        if (item && item.bottleSize) {
          const expectedQuantityInBase = quantitySold * item.bottleSize; // bottles * ml per bottle
          const itemKey = item._id.toString();

          if (!expectedConsumptionMap.has(itemKey)) {
            expectedConsumptionMap.set(itemKey, {
              itemId: item._id,
              expectedQuantity: 0,
              fromOrders: []
            });
          }

          const itemData = expectedConsumptionMap.get(itemKey);
          itemData.expectedQuantity += expectedQuantityInBase;
          itemData.fromOrders.push({
            dishName,
            quantityOrdered: quantitySold,
            bottleSize: item.bottleSize,
            pricePerMl,
            amount,
            calculated: expectedQuantityInBase
          });
        }
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
          existingItem.fromOrders.push(...newItem.fromOrders);
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
  createOrders,
  getOrders
};
