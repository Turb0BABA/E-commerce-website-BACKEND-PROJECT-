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
      console.log(err);
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

  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      filterStatus === "" || o.status === filterStatus;

    const matchesSearch =
      search === "" ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o._id.includes(search);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>

      {/* FILTER BAR */}
      <div className="flex gap-4 mb-6">

        <input
          placeholder="Search by user or order ID"
          className="border rounded px-3 py-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border rounded px-3 py-2"
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

      {/* ORDERS TABLE */}
      <div className="bg-white shadow p-4 rounded">
        <table className="w-full border">
          <thead className="bg-gray-100 border">
            <tr>
              <th className="p-2">Order ID</th>
              <th className="p-2">User</th>
              <th className="p-2">Items</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Status</th>
              <th className="p-2">Update</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((o) => (
              <tr key={o._id} className="border">

                <td className="p-2 font-mono text-sm">{o._id}</td>

                <td className="p-2">{o.user?.name}</td>

                <td className="p-2">
                  {o.items.map((item, idx) => (
                    <div key={idx}>
                      {item.quantity}× {item.product?.name}
                    </div>
                  ))}
                </td>

                <td className="p-2 font-bold">₹{o.totalAmount}</td>

                <td className="p-2">{o.status}</td>

                <td className="p-2">
                  <select
                    className="border px-2 py-1 rounded"
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
