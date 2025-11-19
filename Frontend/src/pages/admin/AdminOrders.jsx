import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/admin/all");
      setOrders(res.data.orders);
    } catch (err) {
      alert("Failed to load orders");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/orders/admin/${id}`, { status });
      fetchOrders();
    } catch (err) {
      alert("Unable to update status");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = orders.filter((o) => {
    const matchesStatus = filterStatus === "" || o.status === filterStatus;
    const matchesSearch =
      search === "" ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o._id.includes(search);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="py-8 space-y-6">
      <h1 className="text-3xl font-semibold">Order Management</h1>

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-4">
        <input
          placeholder="Search by user or order ID"
          className="border border-gray-300 rounded px-3 py-2 text-sm w-full sm:w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border border-gray-300 rounded px-3 py-2 text-sm w-full sm:w-48"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3">Order</th>
              <th className="p-3">User</th>
              <th className="p-3">Items</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Update</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((o) => (
              <tr key={o._id} className="border-b">
                <td className="p-3 font-mono text-xs">#{o._id.slice(-6)}</td>
                <td className="p-3">{o.user?.name}</td>

                <td className="p-3">
                  {o.items.map((item, idx) => (
                    <div key={idx}>
                      {item.quantity}× {item.product?.name}
                    </div>
                  ))}
                </td>

                <td className="p-3 font-bold">₹{o.totalAmount}</td>

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

                <td className="p-3">
                  <select
                    className="border border-gray-300 px-2 py-1 rounded text-xs"
                    value={o.status}
                    onChange={(e) => updateStatus(o._id, e.target.value)}
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
  );
}
