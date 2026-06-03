/**
 * Converter utilities for Mongoose Decimal128 and currency
 * Converts Decimal128 values to regular numbers for API responses
 */

/**
 * Convert currency with a given rate
 * @param {number} amount - Amount to convert
 * @param {number} rate - Conversion rate
 * @returns {number} Converted amount
 */
const convertCurrency = (amount, rate) => {
  return amount * rate;
};

/**
 * Convert Mongoose Decimal128 to JavaScript number
 * @param {Decimal128 | number | string} value - Value to convert
 * @returns {number | string | object | null}
 */
function convertDecimal(value) {
  if (value === null || value === undefined) {
    return value;
  }

  // If it's a Decimal128, convert to string then to number
  if (value._bsontype === "Decimal128") {
    return parseFloat(value.toString());
  }

  return value;
}

/**
 * Recursively convert all Decimal128 values in an object
 * @param {any} obj - Object to convert
 * @returns {any} Object with Decimal128 values converted
 */
function convertDecimals(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertDecimals(item));
  }

  if (typeof obj === "object") {
    const converted = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value && value._bsontype === "Decimal128") {
        converted[key] = parseFloat(value.toString());
      } else if (typeof value === "object") {
        converted[key] = convertDecimals(value);
      } else {
        converted[key] = value;
      }
    }
    return converted;
  }

  return obj;
}

/**
 * Convert Mongoose document to plain object with Decimal128 converted
 * @param {Document} doc - Mongoose document
 * @returns {object} Plain object
 */
function toJSON(doc) {
  if (!doc) return null;

  const plain = doc.toObject ? doc.toObject() : doc;
  return convertDecimals(plain);
}

module.exports = {
  convertCurrency,
  convertDecimal,
  convertDecimals,
  toJSON
};
