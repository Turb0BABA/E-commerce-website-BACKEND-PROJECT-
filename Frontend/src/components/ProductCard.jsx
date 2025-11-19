import { Link } from "react-router-dom";
import { addToCartAPI } from "../api/cart";

export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="border rounded p-4 shadow hover:shadow-lg cursor-pointer">
      <img 
        src={`http://localhost:5000${product.image}`} 
        alt={product.name}
        className="h-40 w-full object-cover mb-3"
      />

      <h2 className="text-lg font-semibold">{product.name}</h2>
      <p className="text-gray-600">₹{product.price}</p>

      <Link 
        to={`/product/${product._id}`}
        className="mt-3 inline-block bg-blue-600 text-white px-3 py-1 rounded"
      >
        View Details
      </Link>

      <button
        onClick={() => addToCartAPI(product._id)}
        className="bg-green-600 text-white w-full py-2 rounded mt-3"
      >
        Add to Cart
      </button>
    </div>
  );
}
