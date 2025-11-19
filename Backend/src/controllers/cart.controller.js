import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

// GET /api/cart - get logged-in user's cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product", "name price image stock");

    if (!cart) {
      return res.json({ items: [], totalItems: 0 });
    }

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({ cart, totalItems });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/cart/add - add product to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [{ product: productId, quantity }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }

      await cart.save();
    }

    const populatedCart = await cart.populate(
      "items.product",
      "name price image stock"
    );

    res.status(200).json({
      message: "Product added to cart",
      cart: populatedCart,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/cart/update - update quantity
export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (i) => i.product.toString() === productId
    );
    if (!item) {
      return res.status(404).json({ message: "Product not in cart" });
    }

    item.quantity = quantity;
    await cart.save();

    const populatedCart = await cart.populate(
      "items.product",
      "name price image stock"
    );

    res.json({ message: "Cart updated", cart: populatedCart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/cart/item/:productId - remove one item from cart
export const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    const populatedCart = await cart.populate(
      "items.product",
      "name price image stock"
    );

    res.json({ message: "Item removed from cart", cart: populatedCart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/cart/clear - clear entire cart
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.json({ message: "Cart cleared", cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
