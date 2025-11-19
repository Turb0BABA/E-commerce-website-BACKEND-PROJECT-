import { useParams } from "react-router-dom";
import { useEffect } from "react";
import useProductStore from "../store/productStore";
import useAuthStore from "../store/authStore";
import { addToCartAPI } from "../api/cart";

export default function ProductDetails() {
  const { id } = useParams();
  const { product, fetchProductById, loading } = useProductStore();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchProductById(id);
  }, [id, fetchProductById]);

  if (loading || !product)
    return <h1 className="text-xl p-6">Loading product...</h1>;

  const handleAddToCart = async () => {
    if (!user) {
      alert("Please login to add products to cart.");
      return;
    }

    try {
      const res = await addToCartAPI(product._id, 1);

      if (res.status === 200 || res.status === 201) {
        alert("Product added to cart!");
      } else {
        alert(res.data?.message || "Failed to add to cart");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding product to cart");
    }
  };

  return (
    <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Image */}
      <div className="border border-gray-200 rounded-xl bg-white p-4">
        <img
          src={`http://localhost:5000${product.image}`}
          alt={product.name}
          className="w-full h-80 object-cover rounded-md bg-gray-50"
        />
      </div>

      {/* Details */}
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-gray-900">
          {product.name}
        </h1>

        <p className="text-gray-600">{product.description}</p>

        <p className="text-2xl font-semibold text-gray-900">
          ₹{product.price}
        </p>

        <p className="text-sm text-gray-500">
          Category: <span className="font-medium">{product.category}</span>
        </p>

        <p className="text-sm text-gray-500">
          In stock:{" "}
          <span className="font-medium">
            {product.stock > 0 ? product.stock : "Out of stock"}
          </span>
        </p>

        <button
          onClick={handleAddToCart}
          className="mt-4 bg-gray-900 text-white px-6 py-3 rounded-md text-sm hover:bg-black disabled:opacity-50"
          disabled={product.stock <= 0}
        >
          {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
}
