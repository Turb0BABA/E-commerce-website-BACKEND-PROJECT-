import { useEffect, useState } from "react";
import API from "../api/axios";
import useAuthStore from "../store/authStore";
import { addToCartAPI } from "../api/cart";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const user = useAuthStore((state) => state.user);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("");
  const [priceRange, setPriceRange] = useState(50000);

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 6;

  const handleAddToCart = async (productId) => {
    if (!user) return alert("Please login to add products to cart.");

    try {
      const res = await addToCartAPI(productId, 1);

      if (res.status === 200 || res.status === 201) {
        alert("Product added to cart!");
      } else {
        alert(res.data?.message || "Failed to add to cart");
      }
    } catch (err) {
      alert("Error adding to cart");
      console.log(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      const list = res.data.products || [];
      setProducts(list);
      setFiltered(list);
    } catch (err) {
      console.log("Error loading products:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let data = [...products];

    if (search.trim() !== "") {
      data = data.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category !== "all") {
      data = data.filter((p) => p.category === category);
    }

    data = data.filter((p) => p.price <= priceRange);

    if (sort === "low-high") data.sort((a, b) => a.price - b.price);
    if (sort === "high-low") data.sort((a, b) => b.price - a.price);

    setFiltered(data);
    setPage(1);
  }, [search, category, priceRange, sort, products]);

  const totalPages = Math.ceil(filtered.length / limit);
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-semibold text-gray-900">Products</h1>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

      {/* SEARCH */}
      <div>
      <label className="text-sm text-gray-600">Search</label>
      <input
        type="text"
        placeholder="Search products..."
        className="border px-3 py-2 w-full rounded focus:ring focus:ring-blue-200"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      </div>

      {/* CATEGORY FILTER */}
    <div>
      <label className="text-sm text-gray-600">Category</label>
      <select
        className="border px-3 py-2 w-full rounded"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="all">All Products</option>
        <option value="electronics">Electronics</option>
        <option value="shoes">Shoes</option>
        <option value="fashion">Fashion</option>
        <option value="home">Home & Kitchen</option>
      </select>
    </div>

    {/* PRICE SLIDER */}
    <div>
      <label className="text-sm text-gray-600 flex justify-between">
        <span>Price Range</span>
        <span className="font-semibold text-gray-800">₹{priceRange}</span>
      </label>
      <input
        type="range"
        min="500"
        max="50000"
        value={priceRange}
        className="w-full"
        onChange={(e) => setPriceRange(Number(e.target.value))}
      />
    </div>

    {/* SORTING */}
    <div>
      <label className="text-sm text-gray-600">Sort</label>
      <select
        className="border px-3 py-2 w-full rounded"
        value={sort}
        onChange={(e) => setSort(e.target.value)}
      >
        <option value="">Default</option>
        <option value="low-high">Price: Low → High</option>
        <option value="high-low">Price: High → Low</option>
      </select>
    </div>

  </div>

</div>


      {/* PRODUCTS GRID */}
      {paginated.length === 0 ? (
        <p className="text-gray-600">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {paginated.map((p) => (
            <div
              key={p._id}
              className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-sm transition"
            >
              <img
                src={`http://localhost:5000${p.image}`}
                alt={p.name}
                className="h-40 w-full object-cover mb-3 rounded-md bg-gray-50"
              />

              <h2 className="text-lg font-semibold text-gray-900">{p.name}</h2>
              <p className="text-sm text-gray-500">{p.category}</p>
              <div className="mt-2 flex items-center justify-between">
              <p className="text-lg font-bold">₹{p.price}</p>
                {p.stock === 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                OUT OF STOCK
            </span>
          )}
        </div>

            <button
              className={`w-full py-2 rounded mt-3 text-white ${
                p.stock === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={() => p.stock !== 0 && handleAddToCart(p._id)}
              disabled={p.stock === 0}
            >
              {p.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex justify-center mt-4 gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 text-sm rounded-md ${
              page === i + 1
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
