import { useEffect, useState } from "react";
import API from "../api/axios";
import { Link } from "react-router-dom";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    try {
      const res = await API.get("/orders");
      console.log("ORDERS RECEIVED:", res.data.orders);
      setOrders(res.data.orders || []);
    } catch (err) {
      console.log("Error loading orders:", err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const cancelOrder = async (id) => {
    const confirmCancel = confirm("Cancel this order?");
    if (!confirmCancel) return;

    const res = await API.put(`/orders/cancel/${id}`);

    alert(res.data.message);
    loadOrders();
  };

  if (!orders.length)
    return <h1 className="text-xl mt-10 text-center">No orders yet.</h1>;

  return (
    <div className="py-6">
      <h1 className="text-3xl font-semibold mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          console.log("ORDER OBJECT:", order);

          const status = order?.status?.toLowerCase?.() || "";

          return (
            <div
              key={order._id}
              className="border border-gray-200 rounded-xl p-5 bg-white"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  Order #{order._id.slice(-6)}
                </h2>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    status === "delivered"
                      ? "bg-green-100 text-green-700"
                      : status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <p className="text-sm text-gray-500">
                Placed: {new Date(order.createdAt).toLocaleString()}
              </p>

              <p className="mt-1 text-lg font-semibold text-gray-900">
                Total: ₹{order.totalAmount}
              </p>

              <div className="mt-4 flex gap-3">
                <Link
                  to={`/orders/${order._id}`}
                  className="inline-block bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-black"
                >
                  View Details
                </Link>

                {["pending", "processing"].includes(status) && (
                  <button
                    onClick={() => cancelOrder(order._id)}
                    className="inline-block bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
