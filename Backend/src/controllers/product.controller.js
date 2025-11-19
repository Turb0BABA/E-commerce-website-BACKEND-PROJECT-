import Product from "../models/product.model.js";

// Add product (Admin only)
export const addProduct = async (req, res) => {
  try {
    const { name, price, category, description, stock } = req.body;

    const newProduct = await Product.create({
      name,
      price,
      category,
      description,
      stock,
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    res.status(201).json({ message: "Product added", product: newProduct });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all products (Supports filtering, sorting, pagination)
export const getProducts = async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      products,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const updates = req.body;

    if (req.file) updates.image = `/uploads/${req.file.filename}`;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.json({ message: "Product updated", updatedProduct });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
