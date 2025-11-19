import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function AdminDashboard() {
  const [summary, setSummary] = useState({});
  const [orders, setOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  const fetchData = async () => {
    try {
      const summaryRes = await API.get("/admin/summary");
      const ordersRes = await API.get("/admin/orders");
      const lowStockRes = await API.get("/admin/low-stock");

      setSummary(summaryRes.data);
      setOrders(ordersRes.data.orders);
      setLowStock(lowStockRes.data.lowStock);
    } catch (err) {
      console.log(err);
      alert("Error loading dashboard");
    }
  };

  useEffect(() => {
  const load = async () => {
    const res = await API.get(`/products/${id}`);
    setProduct(res.data.product);
  };
  load();
}, [id]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Product Management</h1>

        <a
          href="/admin/add-product"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Product
        </a>
      </div>

      {/* =================== SUMMARY CARDS =================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Users", value: summary.totalUsers },
          { label: "Total Orders", value: summary.totalOrders },
          { label: "Total Products", value: summary.totalProducts },
          { label: "Revenue", value: `₹${summary.totalRevenue}` },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 hover:shadow-md transition"
          >
            <p className="text-gray-500 text-sm">{item.label}</p>
            <h2 className="text-3xl font-bold mt-2">{item.value}</h2>
          </div>
        ))}
      </div>

      {/* =================== RECENT ORDERS =================== */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-4">Recent Orders</h2>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-sm text-gray-700">
              <th className="p-3">Order</th>
              <th className="p-3">User</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {orders.slice(0, 5).map((o) => (
              <tr key={o._id} className="border-b">
                <td className="p-3 font-mono text-sm">#{o._id.slice(-6)}</td>
                <td className="p-3">{o.user?.name}</td>
                <td className="p-3 font-semibold">₹{o.totalAmount}</td>

                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      o.status === "delivered"
                        ? "bg-green-100 text-green-700"
                        : o.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* =================== LOW STOCK =================== */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-4">Low Stock Products</h2>

        {lowStock.length === 0 ? (
          <p className="text-gray-600">All products are in good stock.</p>
        ) : (
          <div className="space-y-2">
            {lowStock.map((p) => (
              <div
                key={p._id}
                className="flex justify-between bg-gray-50 border rounded p-3"
              >
                <span>{p.name}</span>
                <span className="text-red-600 font-semibold">{p.stock} left</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
