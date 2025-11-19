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
    <div className="py-6">
      <h1 className="text-3xl font-semibold">Order Details</h1>

      <div className="mt-6 border border-gray-200 rounded-xl p-5 bg-white space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Order #{order._id.slice(-6)}
          </h2>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              order.status === "delivered"
                ? "bg-green-100 text-green-700"
                : order.status === "cancelled"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {order.status}
          </span>
        </div>

        <p className="text-sm text-gray-500">
          Placed on: {new Date(order.createdAt).toLocaleString()}
        </p>

        <p className="text-lg font-semibold text-gray-900">
          Total Amount: ₹{order.totalAmount}
        </p>

        <p className="text-sm text-gray-700 mt-2">
          <span className="font-semibold">Delivery Address:</span>
          <br />
          {order.address}
        </p>

        <p className="text-sm text-gray-700">
          <span className="font-semibold">Payment:</span>{" "}
          {order.paymentMethod || "COD"}
        </p>

        <div className="border-t border-gray-200 pt-4 mt-2">
          <h3 className="text-lg font-semibold mb-3">Items</h3>

          <div className="space-y-3">
            {order.items?.map((i) => (
              <div
                key={i.product._id}
                className="border border-gray-200 rounded-xl p-3 flex justify-between items-center"
              >
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {i.product.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    ₹{i.price} × {i.quantity}
                  </p>
                </div>

                <img
                  src={`http://localhost:5000${i.product.image}`}
                  alt={i.product.name}
                  className="h-14 w-14 object-cover rounded-md bg-gray-50"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
