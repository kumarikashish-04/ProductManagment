const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: String,

    sku: {
      type: String,
      unique: true
    },

    price: Number,

    quantity: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);