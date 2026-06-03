const express = require("express");
const {
  getProducts,
  getProductById,
  getProductPricing,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
} = require("../controllers/productController");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const router = express.Router();

// Public routes - products can be viewed by anyone
router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/pricing/:id", getProductPricing);
router.get("/:id", getProductById);

// Admin routes
router.post("/", auth, role("admin"), createProduct);
router.put("/:id", auth, role("admin"), updateProduct);
router.delete("/:id", auth, role("admin"), deleteProduct);

module.exports = router;
