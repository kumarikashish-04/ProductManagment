const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },

        // Quantity in the requested unit
        quantity: {
          type: mongoose.Decimal128,
          required: true
        },

        // Unit in which quantity was requested
        unit: {
          type: String,
          enum: ["g", "kg", "mL", "L", "item"],
          required: true
        },

        // Price per unit (in INR)
        pricePerUnit: {
          type: mongoose.Decimal128,
          required: true
        },

        // Subtotal for this item
        subtotal: {
          type: mongoose.Decimal128,
          required: true
        }
      }
    ],

    // Subtotal before tax
    subtotalAmount: {
      type: mongoose.Decimal128,
      required: true
    },

    // Tax amount
    taxAmount: {
      type: mongoose.Decimal128,
      default: 0
    },

    // Total with tax
    totalAmount: {
      type: mongoose.Decimal128,
      required: true
    },

    // Status: "pending", "accepted", "rejected", "converted_to_order"
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "converted_to_order"],
      default: "pending"
    },

    // Notes from user
    notes: String,

    // Admin notes/quote reference
    adminNotes: String,

    // Quote validity date
    validUntil: Date,

    // If converted to order, reference to that order
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quotation", quotationSchema);
