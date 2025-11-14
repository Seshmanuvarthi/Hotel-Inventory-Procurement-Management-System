// Unit conversion utility for restaurant management system
// Converts all quantities to base units for consistent calculations

const UNIT_CONVERSIONS = {
  // Weight conversions (to grams)
  'mg': { toBase: 0.001, baseUnit: 'g' },
  'g': { toBase: 1, baseUnit: 'g' },
  'kg': { toBase: 1000, baseUnit: 'g' },
  'ton': { toBase: 1000000, baseUnit: 'g' },

  // Volume conversions (to milliliters)
  'ml': { toBase: 1, baseUnit: 'ml' },
  'l': { toBase: 1000, baseUnit: 'ml' },
  'kl': { toBase: 1000000, baseUnit: 'ml' },

  // Count conversions (to pieces)
  'piece': { toBase: 1, baseUnit: 'piece' },
  'pieces': { toBase: 1, baseUnit: 'piece' },
  'dozen': { toBase: 12, baseUnit: 'piece' },
  'box': { toBase: 1, baseUnit: 'piece' }, // Assuming box = 1 unit
  'packet': { toBase: 1, baseUnit: 'piece' },
  'bottle': { toBase: 1, baseUnit: 'piece' },
  'can': { toBase: 1, baseUnit: 'piece' }
};

/**
 * Get the base unit for a given unit
 * @param {string} unit - The unit to get base for
 * @returns {string} - The base unit
 */
const getBaseUnit = (unit) => {
  const normalizedUnit = unit.toLowerCase().trim();
  return UNIT_CONVERSIONS[normalizedUnit]?.baseUnit || unit;
};

/**
 * Convert quantity from given unit to base unit
 * @param {number} quantity - The quantity to convert
 * @param {string} unit - The unit of the quantity
 * @returns {number} - Quantity in base unit
 */
const toBaseUnit = (quantity, unit) => {
  const normalizedUnit = unit.toLowerCase().trim();
  const conversion = UNIT_CONVERSIONS[normalizedUnit];

  if (!conversion) {
    // If unit not found, assume it's already in base unit or return as is
    console.warn(`Unknown unit: ${unit}, treating as base unit`);
    return quantity;
  }

  return quantity * conversion.toBase;
};

/**
 * Convert quantity from base unit to target unit
 * @param {number} quantity - The quantity in base unit
 * @param {string} targetUnit - The target unit
 * @returns {number} - Quantity in target unit
 */
const fromBaseUnit = (quantity, targetUnit) => {
  const normalizedUnit = targetUnit.toLowerCase().trim();
  const conversion = UNIT_CONVERSIONS[normalizedUnit];

  if (!conversion) {
    console.warn(`Unknown unit: ${targetUnit}, returning as is`);
    return quantity;
  }

  return quantity / conversion.toBase;
};

/**
 * Convert quantity from one unit to another
 * @param {number} quantity - The quantity to convert
 * @param {string} fromUnit - The source unit
 * @param {string} toUnit - The target unit
 * @returns {number} - Quantity in target unit
 */
const convertUnit = (quantity, fromUnit, toUnit) => {
  const baseQuantity = toBaseUnit(quantity, fromUnit);
  return fromBaseUnit(baseQuantity, toUnit);
};

/**
 * Check if two units are compatible (same base unit)
 * @param {string} unit1 - First unit
 * @param {string} unit2 - Second unit
 * @returns {boolean} - Whether units are compatible
 */
const areUnitsCompatible = (unit1, unit2) => {
  return getBaseUnit(unit1) === getBaseUnit(unit2);
};

module.exports = {
  getBaseUnit,
  toBaseUnit,
  fromBaseUnit,
  convertUnit,
  areUnitsCompatible,
  UNIT_CONVERSIONS
};
