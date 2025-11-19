import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const [items, setItems] = useState([]);
  const [address, setAddress] = useState("");
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  const loadCart = async () => {
    try {
      const res = await API.get("/cart");
      const cartItems =
        res.data.cart?.items ||
        res.data.items ||
        [];
      setItems(cartItems);
    } catch (err) {
      console.log("Error loading cart:", err);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  if (items.length === 0) {
    return <h1 className="text-xl mt-6">Your cart is empty</h1>;
  }

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const placeOrder = async () => {
    if (!address.trim()) return alert("Please enter your delivery address");

    try {
      setPlacing(true);
      const res = await API.post("/orders", { address });

      const order = res.data.order;
      alert("Order placed successfully!");
      navigate(`/orders/${order._id}`);
    } catch (err) {
      console.log(err);
      alert("Error placing order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="py-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-semibold">Checkout</h1>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.product._id}
            className="border border-gray-200 rounded-xl p-4 flex justify-between items-center bg-white"
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {item.product.name}
              </h2>
              <p className="text-sm text-gray-500">
                ₹{item.product.price} × {item.quantity}
              </p>
            </div>

            <img
              src={`http://localhost:5000${item.product.image}`}
              className="h-16 w-16 rounded-md object-cover bg-gray-50"
            />
          </div>
        ))}
      </div>

      {/* Total */}
      <h2 className="text-2xl font-semibold">Total: ₹{total}</h2>

      {/* Address */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Delivery address
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-md p-3 text-sm"
          rows={3}
          placeholder="Flat / House No, Street, City, Pincode"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        ></textarea>
      </div>

      <button
        className="bg-gray-900 text-white px-6 py-3 rounded-md w-full text-sm hover:bg-black disabled:opacity-60"
        onClick={placeOrder}
        disabled={placing}
      >
        {placing ? "Placing order..." : "Place Order"}
      </button>
    </div>
  );
}
