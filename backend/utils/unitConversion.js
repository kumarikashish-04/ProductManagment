/**
 * Unit Conversion Utilities
 * 
 * UNIT HIERARCHY:
 * Weight: g (base) < kg (1000g = 1kg)
 * Volume: mL (base) < L (1000mL = 1L)
 * Count: item (base)
 * 
 * All conversions are to the smallest unit (base unit)
 * Storage Strategy:
 * - All quantities stored in baseUnit (g for weight, mL for volume, item for count)
 * - Internal conversions happen before storage and after retrieval
 * - User-facing conversions for display happen at the UI layer
 */

// Conversion factors to base unit
const CONVERSION_FACTORS = {
  // Weight: base unit = g (grams)
  "g": 1,
  "kg": 1000,

  // Volume: base unit = mL (milliliters)
  "mL": 1,
  "L": 1000,

  // Count: base unit = item
  "item": 1
};

// Unit categories to prevent invalid conversions (e.g., g to mL)
const UNIT_CATEGORIES = {
  "g": "weight",
  "kg": "weight",
  "mL": "volume",
  "L": "volume",
  "item": "count"
};

/**
 * Get all supported units for a category
 * @param {string} unit - Any unit (e.g., "kg", "mL")
 * @returns {Array} Array of compatible units
 */
function getSupportedUnitsForCategory(unit) {
  const category = UNIT_CATEGORIES[unit];
  if (!category) {
    throw new Error(`Unknown unit: ${unit}`);
  }

  return Object.entries(UNIT_CATEGORIES)
    .filter(([_, cat]) => cat === category)
    .map(([u]) => u);
}

/**
 * Convert quantity from one unit to another
 * @param {number|Decimal128} quantity - Quantity to convert
 * @param {string} fromUnit - Source unit
 * @param {string} toUnit - Target unit
 * @returns {number|Decimal128} Converted quantity
 */
function convertQuantity(quantity, fromUnit, toUnit) {
  if (fromUnit === toUnit) return quantity;

  // Check if units are compatible (same category)
  if (UNIT_CATEGORIES[fromUnit] !== UNIT_CATEGORIES[toUnit]) {
    throw new Error(
      `Cannot convert between ${fromUnit} and ${toUnit}. They are different measurement types.`
    );
  }

  const numValue = typeof quantity === "object" 
    ? parseFloat(quantity.toString()) 
    : parseFloat(quantity);

  // Convert to base unit, then to target unit
  const baseUnitValue = numValue * CONVERSION_FACTORS[fromUnit];
  const convertedValue = baseUnitValue / CONVERSION_FACTORS[toUnit];

  return convertedValue;
}

/**
 * Convert quantity to base unit
 * @param {number|Decimal128} quantity - Quantity in any unit
 * @param {string} unit - Unit of the quantity
 * @param {string} baseUnit - Base unit to convert to
 * @returns {number|Decimal128} Quantity in base unit
 */
function toBaseUnit(quantity, unit, baseUnit) {
  return convertQuantity(quantity, unit, baseUnit);
}

/**
 * Convert quantity from base unit
 * @param {number|Decimal128} baseQuantity - Quantity in base unit
 * @param {string} baseUnit - Current base unit
 * @param {string} targetUnit - Target unit
 * @returns {number|Decimal128} Quantity in target unit
 */
function fromBaseUnit(baseQuantity, baseUnit, targetUnit) {
  return convertQuantity(baseQuantity, baseUnit, targetUnit);
}

/**
 * Calculate price for a quantity in a different unit
 * @param {number|Decimal128} basePricePerUnit - Price per unit (in INR)
 * @param {string} baseUnit - Base unit
 * @param {number|Decimal128} quantity - Quantity in target unit
 * @param {string} targetUnit - Target unit
 * @returns {number|Decimal128} Total price
 */
function calculatePrice(basePricePerUnit, baseUnit, quantity, targetUnit) {
  // Convert quantity to base unit
  const baseQuantity = toBaseUnit(quantity, targetUnit, baseUnit);

  // Calculate price
  const price = baseQuantity * basePricePerUnit;
  return price;
}

/**
 * Get conversion factor between two units
 * @param {string} fromUnit - Source unit
 * @param {string} toUnit - Target unit
 * @returns {number} Conversion factor
 */
function getConversionFactor(fromUnit, toUnit) {
  if (UNIT_CATEGORIES[fromUnit] !== UNIT_CATEGORIES[toUnit]) {
    throw new Error(
      `Cannot convert between ${fromUnit} and ${toUnit}. They are different measurement types.`
    );
  }

  return CONVERSION_FACTORS[fromUnit] / CONVERSION_FACTORS[toUnit];
}

/**
 * Format unit for display
 * @param {string} unit - Unit code
 * @returns {string} Formatted unit string
 */
function formatUnit(unit) {
  const unitLabels = {
    "g": "grams",
    "kg": "kilograms",
    "mL": "milliliters",
    "L": "liters",
    "item": "unit/count"
  };

  return unitLabels[unit] || unit;
}

/**
 * Get unit symbol for display
 * @param {string} unit - Unit code
 * @returns {string} Unit symbol
 */
function getUnitSymbol(unit) {
  const symbols = {
    "g": "g",
    "kg": "kg",
    "mL": "mL",
    "L": "L",
    "item": "units"
  };

  return symbols[unit] || unit;
}

module.exports = {
  CONVERSION_FACTORS,
  UNIT_CATEGORIES,
  convertQuantity,
  toBaseUnit,
  fromBaseUnit,
  calculatePrice,
  getSupportedUnitsForCategory,
  getConversionFactor,
  formatUnit,
  getUnitSymbol
};
