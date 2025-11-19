import { useEffect, useState } from "react";
import API from "../api/axios";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders");
      setOrders(res.data.orders);
    } catch (error) {
      console.error(error);
      alert("Error fetching orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (!orders.length) return <h1>No orders found</h1>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-5">Your Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="border rounded p-4 shadow bg-white"
          >
            <h2 className="text-xl font-semibold">
              Order #{order._id.slice(-6)}
            </h2>

            <p className="text-gray-600">
              Status: <span className="font-semibold">{order.status}</span>
            </p>

            <p className="text-gray-600 mb-3">
              Total Amount: ₹{order.totalAmount}
            </p>

            <ul className="list-disc ml-6">
              {order.items.map((item, i) => (
                <li key={i}>
                  {item.quantity}× {item.product?.name} — ₹{item.price}
                </li>
              ))}
            </ul>

            <p className="text-gray-500 text-sm mt-3">
              Placed on: {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
