import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

/* =====================================================
   1. ADMIN SUMMARY  (/admin/summary)
===================================================== */
export const getSummary = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();

    const revenueData = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    res.json({
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   2. GET ALL USERS  (/auth/all)
===================================================== */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   3. LOW STOCK PRODUCTS (/admin/low-stock)
===================================================== */
export const getLowStock = async (req, res) => {
  try {
    const lowStock = await Product.find({ stock: { $lte: 5 } })
      .select("name stock category");

    res.json({ lowStock });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   4. TOGGLE USER ACTIVE STATUS  (Optional)
===================================================== */
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.active = !user.active;
    await user.save();
    res.json({ message: "Status changed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   5. BASIC USER LIST  (Optional)
===================================================== */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   6. ADVANCED DASHBOARD: ADMIN STATS (Not used by dashboard)
===================================================== */
export const getAdminStats = async (req, res) => {
  try {
    const products = await Product.countDocuments();
    const users = await User.countDocuments();
    const orders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "Pending" });

    res.json({ products, users, orders, pendingOrders });
  } catch (error) {
    res.status(500).json({ message: "Failed to load admin stats" });
  }
};

/* =====================================================
   7. MONTHLY REVENUE (Optional)
===================================================== */
export const getMonthlyRevenue = async (req, res) => {
  try {
    const revenue = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({ revenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   8. TOP SELLING PRODUCTS  (Optional)
===================================================== */
export const getTopProducts = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
    ]);

    res.json({ topProducts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   9. CATEGORY BREAKDOWN (Optional)
===================================================== */
export const getCategoryStats = async (req, res) => {
  try {
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({ categoryStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
