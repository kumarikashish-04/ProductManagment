const express = require("express");

const Product = require("../models/Product");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const products = await Product.find();

  res.json(products);
});

router.post(
  "/",
  auth,
  role("admin"),
  async (req, res) => {
    const product = await Product.create(req.body);

    res.status(201).json(product);
  }
);

router.put(
  "/:id",
  auth,
  role("admin"),
  async (req, res) => {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(product);
  }
);

router.delete(
  "/:id",
  auth,
  role("admin"),
  async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);

    res.json({
      message: "Deleted"
    });
  }
);

module.exports = router;