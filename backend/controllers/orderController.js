const Order = require("../models/Order");
const Quotation = require("../models/Quotation");
const Product = require("../models/Product");
const { toJSON } = require("../utils/converter");
const { toBaseUnit, calculatePrice } = require("../utils/unitConversion");

/**
 * Create order from scratch or from quotation
 */
const createOrder = async (req, res) => {
  try {
    const { items, quotationId, notes } = req.body;

    let orderItems = items;
    let subtotalAmount = 0;
    let taxAmount = 0;
    const processedItems = [];

    // If quotation ID provided, use items from quotation
    if (quotationId) {
      const quotation = await Quotation.findById(quotationId)
        .populate("items.product");

      if (!quotation) {
        return res.status(404).json({
          message: "Quotation not found"
        });
      }

      // Use quotation items
      for (const qItem of quotation.items) {
        const product = qItem.product;
        const subtotal = qItem.subtotal;
        const itemTax = subtotal * (product.taxPercentage / 100);

        processedItems.push({
          product: product._id,
          quantity: qItem.quantity,
          unit: qItem.unit,
          pricePerUnit: qItem.pricePerUnit,
          subtotal,
          baseUnitQuantity: toBaseUnit(
            qItem.quantity,
            qItem.unit,
            product.baseUnit
          )
        });

        subtotalAmount += subtotal;
        taxAmount += itemTax;
      }

      // Update quotation status
      await Quotation.findByIdAndUpdate(quotationId, {
        status: "converted_to_order"
      });
    } else if (items && Array.isArray(items)) {
      // Create order from custom items
      if (items.length === 0) {
        return res.status(400).json({
          message: "Items are required"
        });
      }

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

        const baseQuantity = toBaseUnit(quantity, unit, product.baseUnit);

        processedItems.push({
          product: product._id,
          quantity,
          unit,
          pricePerUnit: product.basePricePerUnit,
          subtotal,
          baseUnitQuantity: baseQuantity
        });

        subtotalAmount += subtotal;
        taxAmount += itemTax;
      }
    } else {
      return res.status(400).json({
        message: "Either items or quotationId must be provided"
      });
    }

    const totalAmount = subtotalAmount + taxAmount;

    const order = await Order.create({
      user: req.user.id,
      quotationId,
      items: processedItems,
      subtotalAmount,
      taxAmount,
      totalAmount,
      status: "confirmed",
      notes
    });

    // Populate product details
    await order.populate("items.product user");

    res.status(201).json({
      message: "Order created successfully",
      order: toJSON(order)
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      message: "Failed to create order",
      error: error.message
    });
  }
};

/**
 * Get all orders (admin sees all, users see their own)
 */
const getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    // If not admin, only show user's own orders
    if (req.user.role !== "admin") {
      query.user = req.user.id;
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("user", "name email companyName phone")
      .populate("items.product", "name sku baseUnit basePricePerUnit")
      .sort({ createdAt: -1 });

    res.json(orders.map(o => toJSON(o)));
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message
    });
  }
};

/**
 * Get order by ID
 */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email companyName phone address city state")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    // Check access (user can see own, admin can see all)
    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    res.json(toJSON(order));
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({
      message: "Failed to fetch order",
      error: error.message
    });
  }
};

/**
 * Update order status (admin only)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, deliveryDate, sellerNotes } = req.body;

    const validStatuses = ["quotation", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status, deliveryDate, sellerNotes },
      { new: true }
    ).populate("items.product user");

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.json({
      message: "Order status updated",
      order: toJSON(order)
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      message: "Failed to update order status",
      error: error.message
    });
  }
};

/**
 * Get order statistics (admin only)
 */
const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({ status: "confirmed" });
    const shippedOrders = await Order.countDocuments({ status: "shipped" });
    const deliveredOrders = await Order.countDocuments({ status: "delivered" });

    const stats = await Order.aggregate([
      { $match: { status: "confirmed" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          avgOrderValue: { $avg: "$totalAmount" }
        }
      }
    ]);

    res.json({
      totalOrders,
      shippedOrders,
      deliveredOrders,
      totalRevenue: stats[0]?.totalRevenue || 0,
      avgOrderValue: stats[0]?.avgOrderValue || 0
    });
  } catch (error) {
    console.error("Get order stats error:", error);
    res.status(500).json({
      message: "Failed to fetch order statistics",
      error: error.message
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats
};
