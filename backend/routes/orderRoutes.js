const express = require("express");
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats
} = require("../controllers/orderController");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const router = express.Router();

// Create order
router.post("/", auth, createOrder);

// Get all orders
router.get("/", auth, getOrders);

// Get order statistics (admin only)
router.get("/stats", auth, role("admin"), getOrderStats);

// Get single order
router.get("/:id", auth, getOrderById);

// Update order status (admin only)
router.put("/:id/status", auth, role("admin"), updateOrderStatus);

module.exports = router;
