import { useEffect, useState } from "react";
import API from "../api/axios";
import { Link } from "react-router-dom";


export default function MyOrders() {
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    try {
      const res = await API.get("/orders");

      console.log("ORDERS RECEIVED:", res.data.orders); // DEBUG

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
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => {
          console.log("ORDER OBJECT:", order); // DEBUG EACH ORDER

          const status = order?.status?.toLowerCase?.() || "";

          return (
            <div
              key={order._id}
              className="p-5 border rounded bg-white shadow"
            >
              <div className="flex justify-between">
                <h2 className="text-xl font-semibold">
                  Order #{order._id.slice(-6)}
                </h2>

                <span className="px-3 py-1 bg-gray-200 rounded font-bold">
                  {order.status}
                </span>
              </div>

              <p className="mt-2 text-gray-600">
                Placed: {new Date(order.createdAt).toLocaleString()}
              </p>

              <p className="mt-1 text-lg font-bold">
                Total: ₹{order.totalAmount}
              </p>

              <Link
                to={`/orders/${order._id}`}
                className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded"
              >
                View Details
              </Link>

              {/* CANCEL BUTTON */}
              {["pending", "processing"].includes(status) && (
                <button
                  onClick={() => cancelOrder(order._id)}
                  className="inline-block mt-3 ml-4 bg-red-600 text-white px-4 py-2 rounded"
                >
                  Cancel Order
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
