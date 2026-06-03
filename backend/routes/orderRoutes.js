const express = require("express");

const Order = require("../models/Order");
const Product = require("../models/Product");

const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { items } = req.body;

    let total = 0;

    for (const item of items) {
      const product = await Product.findById(
        item.product
      );

      total += product.price * item.quantity;

      product.quantity -= item.quantity;

      await product.save();
    }

    const order = await Order.create({
      user: req.user.id,
      items,
      totalAmount: total
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/", auth, async (req, res) => {
  const orders = await Order.find()
    .populate("user")
    .populate("items.product");

  res.json(orders);
});

module.exports = router;