const Product = require("../models/Product");
const { toJSON } = require("../utils/converter");
const {
  getSupportedUnitsForCategory,
  fromBaseUnit,
  formatUnit,
  getUnitSymbol
} = require("../utils/unitConversion");

/**
 * Get all products with optional filtering
 */
const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    let query = { isActive: true };

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } }
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    let sortQuery = {};
    if (sort === "price_asc") {
      sortQuery.basePricePerUnit = 1;
    } else if (sort === "price_desc") {
      sortQuery.basePricePerUnit = -1;
    } else if (sort === "name") {
      sortQuery.name = 1;
    } else {
      sortQuery.createdAt = -1;
    }

    const products = await Product.find(query)
      .populate("createdBy", "name email")
      .sort(sortQuery);

    // Format response with converted decimal values
    const formattedProducts = products.map(product => {
      const data = toJSON(product);
      return {
        ...data,
        supportedUnitsDisplay: data.supportedUnits?.map(u => ({
          code: u,
          label: formatUnit(u),
          symbol: getUnitSymbol(u)
        }))
      };
    });

    res.json(formattedProducts);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message
    });
  }
};

/**
 * Get single product by ID
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    const data = toJSON(product);
    const supportedUnits = data.supportedUnits || getSupportedUnitsForCategory(data.baseUnit);

    res.json({
      ...data,
      supportedUnitsDisplay: supportedUnits.map(u => ({
        code: u,
        label: formatUnit(u),
        symbol: getUnitSymbol(u)
      }))
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message
    });
  }
};

/**
 * Get product with price in requested unit
 */
const getProductPricing = async (req, res) => {
  try {
    const { id } = req.params;
    const { unit } = req.query;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    const data = toJSON(product);
    const baseUnit = data.baseUnit;

    // If requesting specific unit, calculate price in that unit
    let pricePerUnit = data.basePricePerUnit;
    let displayUnit = unit || baseUnit;

    if (unit && unit !== baseUnit) {
      const supportedUnits = getSupportedUnitsForCategory(baseUnit);
      if (!supportedUnits.includes(unit)) {
        return res.status(400).json({
          message: `Unit ${unit} not supported for this product`
        });
      }
      // When user orders 1 unit of 'unit', they need how many base units?
      // Price stays the same, but displayed per that unit
      pricePerUnit = data.basePricePerUnit;
    }

    res.json({
      ...data,
      pricePerUnit,
      displayUnit,
      baseUnit,
      formatUnit: formatUnit(displayUnit),
      unitSymbol: getUnitSymbol(displayUnit)
    });
  } catch (error) {
    console.error("Get product pricing error:", error);
    res.status(500).json({
      message: "Failed to fetch product pricing",
      error: error.message
    });
  }
};

/**
 * Create new product (admin only)
 */
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      sku,
      baseUnit,
      baseQuantity,
      basePricePerUnit,
      supportedUnits,
      hsnCode,
      taxPercentage,
      minimumOrderQuantity
    } = req.body;

    // Validate required fields
    if (!name || !sku || !baseUnit || !basePricePerUnit) {
      return res.status(400).json({
        message: "Name, SKU, baseUnit, and basePricePerUnit are required"
      });
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(400).json({
        message: "SKU already exists"
      });
    }

    // Use supported units or default to category of baseUnit
    let finalSupportedUnits = supportedUnits;
    if (!finalSupportedUnits || !Array.isArray(finalSupportedUnits)) {
      const { getSupportedUnitsForCategory } = require("../utils/unitConversion");
      finalSupportedUnits = getSupportedUnitsForCategory(baseUnit);
    }

    const product = await Product.create({
      name,
      description,
      category,
      sku,
      baseUnit,
      baseQuantity: baseQuantity || 0,
      basePricePerUnit,
      supportedUnits: finalSupportedUnits,
      hsnCode,
      taxPercentage: taxPercentage || 0,
      minimumOrderQuantity: minimumOrderQuantity || 1,
      createdBy: req.user.id
    });

    res.status(201).json({
      message: "Product created successfully",
      product: toJSON(product)
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      message: "Failed to create product",
      error: error.message
    });
  }
};

/**
 * Update product (admin only)
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      baseQuantity,
      basePricePerUnit,
      supportedUnits,
      taxPercentage,
      minimumOrderQuantity,
      isActive
    } = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        category,
        baseQuantity,
        basePricePerUnit,
        supportedUnits,
        taxPercentage,
        minimumOrderQuantity,
        isActive
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({
      message: "Product updated successfully",
      product: toJSON(product)
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      message: "Failed to update product",
      error: error.message
    });
  }
};

/**
 * Delete product (admin only)
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message
    });
  }
};

/**
 * Get product categories
 */
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category", { isActive: true });
    res.json(categories.filter(Boolean).sort());
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      message: "Failed to fetch categories",
      error: error.message
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductPricing,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
};
