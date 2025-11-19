import { useEffect, useState } from "react";
import API from "../api/axios";
import { Link } from "react-router-dom";

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    try {
      const res = await API.get("/cart");

      const cartItems =
        res.data.cart?.items ||
        res.data.items ||
        [];

      setItems(cartItems);
      setLoading(false);
    } catch (err) {
      console.log("Error loading cart:", err);
      setItems([]);
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQty) => {
    if (newQty < 1) return;

    await API.put("/cart/update", { productId, quantity: newQty });
    loadCart();
  };

  const removeItem = async (productId) => {
    await API.delete(`/cart/item/${productId}`);
    loadCart();
  };

  useEffect(() => {
    loadCart();
  }, []);

  if (loading) return <h2 className="p-6">Loading cart...</h2>;

  if (items.length === 0)
    return <h1 className="text-xl p-6">Your cart is empty</h1>;

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Cart items */}
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-3xl font-semibold mb-2">Your Cart</h1>

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

            <div className="flex items-center gap-3">
              <button
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                onClick={() =>
                  updateQuantity(item.product._id, item.quantity - 1)
                }
              >
                −
              </button>

              <span className="text-sm">{item.quantity}</span>

              <button
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                onClick={() =>
                  updateQuantity(item.product._id, item.quantity + 1)
                }
              >
                +
              </button>

              <button
                className="px-3 py-1 rounded-md text-sm bg-red-600 text-white"
                onClick={() => removeItem(item.product._id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="border border-gray-200 rounded-xl p-5 bg-white h-fit">
        <h2 className="text-xl font-semibold mb-3">Summary</h2>
        <p className="flex justify-between text-sm text-gray-700 mb-2">
          <span>Subtotal</span>
          <span>₹{total}</span>
        </p>
        <p className="flex justify-between text-sm text-gray-500 mb-4">
          <span>Delivery</span>
          <span>₹0</span>
        </p>
        <p className="flex justify-between text-lg font-semibold text-gray-900">
          <span>Total</span>
          <span>₹{total}</span>
        </p>

        <Link
          to="/checkout"
          className="mt-5 block text-center bg-gray-900 text-white py-2.5 rounded-md text-sm hover:bg-black"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
