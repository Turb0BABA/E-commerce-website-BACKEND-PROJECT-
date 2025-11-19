import { useParams } from "react-router-dom";
import { useEffect } from "react";
import useProductStore from "../store/productStore";
import { addToCartAPI } from "../api/cart";

export default function ProductDetails() {
  const { id } = useParams();
  const { product, fetchProductById, loading } = useProductStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    fetchProductById(id);
  }, [id]);

  if (loading || !product) return <h1>Loading...</h1>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <img 
        src={`http://localhost:5000${product.image}`} 
        className="w-full h-80 object-cover rounded"
      />

      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="mt-3 text-gray-600">{product.description}</p>

        <p className="text-2xl font-semibold mt-4">
          ₹{product.price}
        </p>

        <button
          onClick={() => addToCart(product)}
          className="mt-4 bg-green-600 text-white px-5 py-2 rounded"
        >
          Add To Cart
        </button>
      </div>
    </div>
  );
}
