import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const [items, setItems] = useState([]); // FIXED
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  const loadCart = async () => {
    try {
      const res = await API.get("/cart");

      // FIX: cart.items is the real array
      const cartItems = res.data.cart?.items || [];

      setItems(cartItems);
    } catch (err) {
      console.log("Checkout Load Error:", err);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  if (items.length === 0) {
    return <h1 className="text-xl">Your cart is empty</h1>;
  }

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const placeOrder = async () => {
    if (!address.trim()) return alert("Please enter your address");

    try {
      const res = await API.post("/orders", { address });

      if (res.status === 201) {
        alert("Order placed successfully!");
        navigate("/orders");
      } else {
        alert(res.data.message || "Order failed");
      }
    } catch (err) {
      console.log("Order Error:", err);
      alert("Something went wrong while placing the order");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Checkout</h1>

      <h2 className="text-xl mb-3 font-semibold">Order Summary</h2>

      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div key={item.product._id} className="border rounded p-4">
            <h3 className="text-lg font-semibold">{item.product.name}</h3>
            <p>
              ₹{item.product.price} × {item.quantity}
            </p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold mb-4">Total: ₹{total}</h2>

      <textarea
        className="w-full border p-3 rounded mb-4"
        placeholder="Delivery Address..."
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      ></textarea>

      <button
        onClick={placeOrder}
        className="bg-green-600 text-white px-6 py-2 rounded"
      >
        Place Order
      </button>
    </div>
  );
}
