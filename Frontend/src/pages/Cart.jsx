import { useEffect, useState } from "react";
import API from "../api/axios";
import { Link } from "react-router-dom";

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    try {
      const res = await API.get("/cart");

      // Backend returns either:
      // { cart: { items: [...] }, totalItems }
      // OR
      // { items: [], totalItems: 0 }
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

  const increaseQty = async (productId) => {
    await API.put("/cart/update", { productId, quantity: +1 });
    loadCart();
  };

  const decreaseQty = async (productId) => {
    await API.put("/cart/update", { productId, quantity: -1 });
    loadCart();
  };

  const removeItem = async (productId) => {
    await API.delete(`/cart/item/${productId}`);
    loadCart();
  };

  useEffect(() => {
    loadCart();
  }, []);

  if (loading) return <h2>Loading cart...</h2>;

  if (items.length === 0)
    return <h1 className="text-xl">Your cart is empty</h1>;

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Your Cart</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.product._id} className="border p-4 rounded flex justify-between">
            
            <div>
              <h2 className="text-xl">{item.product.name}</h2>
              <p>₹{item.product.price} × {item.quantity}</p>
            </div>

            <div className="flex gap-3">
              <button 
                className="px-3 bg-gray-300 rounded"
                onClick={() => decreaseQty(item.product._id)}
              >
                -
              </button>

              <button 
                className="px-3 bg-green-600 text-white rounded"
                onClick={() => increaseQty(item.product._id)}
              >
                +
              </button>

              <button
                className="px-3 bg-red-600 text-white rounded"
                onClick={() => removeItem(item.product._id)}
              >
                Remove
              </button>
            </div>

          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold mt-6">Total: ₹{total}</h2>

      <Link
        to="/checkout"
        className="inline-block mt-4 bg-blue-600 text-white px-5 py-2 rounded"
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}
