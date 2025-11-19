import { useEffect, useState } from "react";
import API from "../api/axios";
import { useParams } from "react-router-dom";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  const loadOrder = async () => {
    try {
      const res = await API.get(`/orders/${id}`);
      setOrder(res.data.order);
    } catch (err) {
      console.log("Error loading order:", err);
      alert("Unable to load order");
    }
  };

  useEffect(() => {
    loadOrder();
  }, []);

  if (!order) return <h1 className="text-xl p-6">Loading...</h1>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Order Details</h1>

      <div className="mt-6 border rounded p-5 bg-white shadow">
        <h2 className="text-xl font-semibold mb-2">
          Order #{order._id.slice(-6)}
        </h2>

        <p className="text-gray-600">
          Placed on: {new Date(order.createdAt).toLocaleString()}
        </p>

        <p className="text-gray-800 font-semibold text-lg mt-3">
          Total Amount: ₹{order.totalAmount}
        </p>
        <p className="mt-2">
          <span className="font-semibold">Delivery Address:</span><br />
          {order.address}
        </p>

        <p className="mt-2">
          <span className="font-semibold">Payment:</span>{" "}
          {order.paymentMethod || "COD"}
        </p>

        <p className="mt-2">
          <span className="font-semibold">Status:</span>{" "}
          <span
            className={`px-3 py-1 rounded text-sm font-bold ${
              order.status === "delivered"
                ? "bg-green-200 text-green-700"
                : order.status === "cancelled"
                ? "bg-red-200 text-red-700"
                : "bg-yellow-200 text-yellow-800"
            }`}
          >
            {order.status}
          </span>
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Items</h3>

        <div className="space-y-3">
          {order.items?.map((i) => (

            <div
              key={i.product._id}
              className="border p-4 rounded flex justify-between"
            >
              <div>
                <h4 className="font-semibold">{i.product.name}</h4>
                <p>
                  ₹{i.price} × {i.quantity}
                </p>
              </div>

              <img
                src={`http://localhost:5000${i.product.image}`}
                alt={i.product.name}
                className="h-16 w-16 object-cover rounded"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
