import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function AdminDashboard() {
  const [summary, setSummary] = useState({});
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  const fetchData = async () => {
    try {
      const summaryRes = await API.get("/admin/summary");
      const ordersRes = await API.get("/admin/orders");
      const productRes = await API.get("/products");
      const usersRes = await API.get("/auth/all");
      const lowStockRes = await API.get("/admin/low-stock");

      setSummary(summaryRes.data);
      setOrders(ordersRes.data.orders);
      setProducts(productRes.data.products);
      setUsers(usersRes.data.users);
      setLowStock(lowStockRes.data.lowStock);
    } catch (err) {
      console.log(err);
      alert("Error loading admin dashboard");
    }
  };

  const updateOrderStatus = async (id, status) => {
  try {
    await API.put(`/admin/orders/${id}`, { status });
    fetchData();
  } catch (err) {
    alert("Failed to update order status");
  }
};


  const deleteProduct = async (id) => {
    try {
      await API.delete(`/products/${id}`);
      fetchData();
    } catch (err) {
      alert("Error deleting product");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-12">

      {/* ======================= SUMMARY CARDS ======================= */}
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Users", value: summary.totalUsers },
          { title: "Orders", value: summary.totalOrders },
          { title: "Products", value: summary.totalProducts },
          { title: "Revenue", value: `₹${summary.totalRevenue}` },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white shadow rounded p-5 text-center border hover:shadow-lg transition"
          >
            <h2 className="text-gray-500">{item.title}</h2>
            <p className="text-3xl font-bold mt-2">{item.value}</p>
          </div>
        ))}
      </div>

      {/* ======================= ORDERS SECTION ======================= */}
      <div className="bg-white p-6 rounded shadow border">
        <h2 className="text-2xl font-bold mb-4">Orders</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">User</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b">
                  <td className="p-3">{o._id.slice(-6)}</td>
                  <td className="p-3">{o.user?.name}</td>
                  <td className="p-3 font-semibold">₹{o.totalAmount}</td>
                  <td className="p-3">{o.status}</td>

                  <td className="p-3">
                    <select
                      className="border px-2 py-1 rounded"
                      value={o.status}
                      onChange={(e) =>
                        updateOrderStatus(o._id, e.target.value)
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================= PRODUCTS SECTION ======================= */}
      <div className="bg-white p-6 rounded shadow border">
        <h2 className="text-2xl font-bold mb-4">Products</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">₹{p.price}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded"
                      onClick={() => deleteProduct(p._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================= LOW STOCK SECTION ======================= */}
      <div className="bg-white p-6 rounded shadow border">
        <h2 className="text-2xl font-bold mb-4">Low Stock Alerts</h2>

        <table className="w-full text-left border">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Stock Left</th>
            </tr>
          </thead>

          <tbody>
            {lowStock.map((p) => (
              <tr key={p._id} className="border-b">
                <td className="p-3">{p.name}</td>
                <td className="p-3 text-red-600 font-bold">{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ======================= USERS SECTION ======================= */}
      <div className="bg-white p-6 rounded shadow border">
        <h2 className="text-2xl font-bold mb-4">Users</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
