const express = require("express");
const {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotationStatus
} = require("../controllers/quotationController");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const router = express.Router();

// Create quotation
router.post("/", auth, createQuotation);

// Get all quotations
router.get("/", auth, getQuotations);

// Get single quotation
router.get("/:id", auth, getQuotationById);

// Update quotation status (admin only)
router.put("/:id/status", auth, role("admin"), updateQuotationStatus);

module.exports = router;
