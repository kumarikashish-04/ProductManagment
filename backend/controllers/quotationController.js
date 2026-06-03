const Quotation = require("../models/Quotation");
const Product = require("../models/Product");
const { toJSON } = require("../utils/converter");
const { toBaseUnit, calculatePrice } = require("../utils/unitConversion");

/**
 * Create quotation
 */
const createQuotation = async (req, res) => {
  try {
    const { items, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Items are required"
      });
    }

    let subtotalAmount = 0;
    let taxAmount = 0;
    const processedItems = [];

    // Process each item
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          message: `Product ${item.product} not found`
        });
      }

      const quantity = parseFloat(item.quantity);
      const unit = item.unit || product.baseUnit;

      // Validate unit
      if (!product.supportedUnits.includes(unit)) {
        return res.status(400).json({
          message: `Unit ${unit} not supported for product ${product.name}`
        });
      }

      // Calculate subtotal
      const subtotal = calculatePrice(
        product.basePricePerUnit,
        product.baseUnit,
        quantity,
        unit
      );

      const itemTax = subtotal * (product.taxPercentage / 100);

      processedItems.push({
        product: product._id,
        quantity,
        unit,
        pricePerUnit: product.basePricePerUnit,
        subtotal,
        tax: itemTax
      });

      subtotalAmount += subtotal;
      taxAmount += itemTax;
    }

    const totalAmount = subtotalAmount + taxAmount;

    const quotation = await Quotation.create({
      user: req.user.id,
      items: processedItems,
      subtotalAmount,
      taxAmount,
      totalAmount,
      notes,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days validity
    });

    // Populate product details
    await quotation.populate("items.product");

    res.status(201).json({
      message: "Quotation created successfully",
      quotation: toJSON(quotation)
    });
  } catch (error) {
    console.error("Create quotation error:", error);
    res.status(500).json({
      message: "Failed to create quotation",
      error: error.message
    });
  }
};

/**
 * Get all quotations (admin sees all, users see their own)
 */
const getQuotations = async (req, res) => {
  try {
    let query = {};

    // If not admin, only show user's own quotations
    if (req.user.role !== "admin") {
      query.user = req.user.id;
    }

    const quotations = await Quotation.find(query)
      .populate("user", "name email companyName")
      .populate("items.product", "name sku baseUnit supportedUnits basePricePerUnit")
      .sort({ createdAt: -1 });

    res.json(quotations.map(q => toJSON(q)));
  } catch (error) {
    console.error("Get quotations error:", error);
    res.status(500).json({
      message: "Failed to fetch quotations",
      error: error.message
    });
  }
};

/**
 * Get quotation by ID
 */
const getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate("user", "name email companyName phone address")
      .populate("items.product");

    if (!quotation) {
      return res.status(404).json({
        message: "Quotation not found"
      });
    }

    // Check access (user can see own, admin can see all)
    if (
      req.user.role !== "admin" &&
      quotation.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    res.json(toJSON(quotation));
  } catch (error) {
    console.error("Get quotation error:", error);
    res.status(500).json({
      message: "Failed to fetch quotation",
      error: error.message
    });
  }
};

/**
 * Update quotation status (admin only)
 */
const updateQuotationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const validStatuses = ["pending", "accepted", "rejected", "converted_to_order"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }

    const quotation = await Quotation.findByIdAndUpdate(
      id,
      { status, adminNotes },
      { new: true }
    );

    if (!quotation) {
      return res.status(404).json({
        message: "Quotation not found"
      });
    }

    res.json({
      message: "Quotation status updated",
      quotation: toJSON(quotation)
    });
  } catch (error) {
    console.error("Update quotation status error:", error);
    res.status(500).json({
      message: "Failed to update quotation status",
      error: error.message
    });
  }
};

module.exports = {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotationStatus
};
