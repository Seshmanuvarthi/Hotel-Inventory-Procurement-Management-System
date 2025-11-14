const StockIssue = require('../models/StockIssue');
const HotelConsumption = require('../models/HotelConsumption');
const Item = require('../models/Item');

const { toBaseUnit } = require('../utils/unitConverter');

const getLeakageData = async (from, to) => {
  const dateMatch = from && to ? { $gte: new Date(from), $lte: new Date(to) } : {};

  const issued = await StockIssue.aggregate([
    ...(from && to ? [{ $match: { dateIssued: dateMatch } }] : []),
    { $unwind: '$items' },
    { $group: { _id: '$items.itemId', totalIssued: { $sum: '$items.quantityIssued' }, unit: { $first: '$items.unit' } } }
  ]);

  // Convert issued to base units
  const issuedConverted = issued.map(item => ({
    ...item,
    totalIssued: toBaseUnit(item.totalIssued, item.unit)
  }));

  const consumed = await HotelConsumption.aggregate([
    ...(from && to ? [{ $match: { date: dateMatch } }] : []),
    { $unwind: '$items' },
    { $group: { _id: '$items.itemId', totalConsumed: { $sum: '$items.quantityConsumed' }, unit: { $first: '$items.unit' } } }
  ]);

  // Convert consumed to base units
  const consumedConverted = consumed.map(item => ({
    ...item,
    totalConsumed: toBaseUnit(item.totalConsumed, item.unit)
  }));

  const allIds = new Set([
    ...issued.map(i => i._id.toString()),
    ...consumed.map(i => i._id.toString())
  ]);

  const list = [];

  for (const id of allIds) {
    const issue = issued.find(i => i._id.toString() === id)?.totalIssued || 0;
    const consume = consumed.find(i => i._id.toString() === id)?.totalConsumed || 0;

    list.push({
      itemId: id,
      expected: issue,
      actual: consume,
      leakage: issue - consume
    });
  }

  const populated = await Promise.all(
    list.map(async (item) => {
      const doc = await Item.findById(item.itemId).select('name');
      return { ...item, itemName: doc?.name || 'Unknown Item' };
    })
  );

  return populated;
};

module.exports = getLeakageData;
