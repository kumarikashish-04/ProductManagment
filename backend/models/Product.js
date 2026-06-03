const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    description: String,

    category: String,

    sku: {
      type: String,
      unique: true,
      required: true
    },

    // Base unit is the internal storage unit (e.g., "g" for grams, "mL" for milliliters)
    baseUnit: {
      type: String,
      enum: ["g", "kg", "mL", "L", "item"],
      required: true
    },

    // Base quantity stored in the system
    baseQuantity: {
      type: mongoose.Decimal128,
      required: true,
      default: 0
    },

    // Base price per unit (in INR with high precision)
    basePricePerUnit: {
      type: mongoose.Decimal128,
      required: true
    },

    // Supported units for this product (e.g., ["g", "kg"])
    supportedUnits: [{
      type: String,
      enum: ["g", "kg", "mL", "L", "item"]
    }],

    // HSN/SAC code for tax purposes
    hsnCode: String,

    // Tax percentage (0-28%)
    taxPercentage: {
      type: mongoose.Decimal128,
      default: 0
    },

    // Minimum order quantity
    minimumOrderQuantity: {
      type: mongoose.Decimal128,
      default: 1
    },

    // Image or reference
    image: String,

    // Product is active or archived
    isActive: {
      type: Boolean,
      default: true
    },

    // Created by admin
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);