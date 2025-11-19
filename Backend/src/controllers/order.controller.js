import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

import { sendInvoiceEmail } from "../utils/email.js"; // ✅ email sender
import { generateInvoiceHTML } from "../utils/invoiceTemplate.js"; // ✅ HTML template
// import { generateInvoicePDF } from "../utils/invoicePDF.js"; // optional if using PDF

// CREATE ORDER (Checkout)
export const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { address, paymentMethod = "COD" } = req.body;

    if (!address) {
      return res.status(400).json({ message: "Delivery address is required" });
    }

    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product",
      "name price stock"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    let totalAmount = 0;

    // Validate stock & calculate total
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.product.name}`
        });
      }

      totalAmount += item.product.price * item.quantity;
    }

    // Reduce stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Create order
    const order = await Order.create({
      user: userId,
      items: cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      })),
      totalAmount,
      address,          // ✅ SAVE ADDRESS
      paymentMethod,
      paymentStatus: "not paid"
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    // Fetch user info
    const user = await User.findById(userId);

    // Generate email HTML
    const invoiceHTML = generateInvoiceHTML(order, user);

    // Send invoice email
    await sendInvoiceEmail(
      user.email,
      `Your Order Invoice #${order._id.slice(-6)}`,
      invoiceHTML
    );

    res.status(201).json({
      message: "Order placed successfully",
      order
    });

  } catch (error) {
    console.log("ORDER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET all orders for logged-in user
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "items.product",
      "name price image"
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN — GET all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN — Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, paymentStatus },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// USER — Cancel own order
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    // User must own order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Only pending or processing can be cancelled
    if (!["pending", "processing"].includes(order.status)) {
      return res.status(400).json({
        message: "Order cannot be cancelled at this stage"
      });
    }

    order.status = "cancelled";
    await order.save();

    res.json({ message: "Order cancelled successfully", order });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
