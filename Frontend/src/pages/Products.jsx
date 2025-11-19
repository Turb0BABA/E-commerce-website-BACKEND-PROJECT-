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

  /* =====================================================
      ADD TO CART
  ====================================================== */
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

  /* =====================================================
      FETCH PRODUCTS
  ====================================================== */
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

  /* =====================================================
      FILTERS + SORTING
  ====================================================== */
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

  /* =====================================================
      PAGINATION
  ====================================================== */
  const totalPages = Math.ceil(filtered.length / limit);
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  /* =====================================================
      RENDER
  ====================================================== */
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        
        {/* Search */}
        <input
          type="text"
          placeholder="Search products..."
          className="border px-3 py-2 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Category */}
        <select
          className="border px-3 py-2 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="shoes">Shoes</option>
          <option value="fashion">Fashion</option>
          <option value="home">Home & Kitchen</option>
        </select>

        {/* Price */}
        <div>
          <label className="block mb-1 text-sm font-semibold">
            Max Price: ₹{priceRange}
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

        {/* Sorting */}
        <select
          className="border px-3 py-2 rounded"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Sort by</option>
          <option value="low-high">Price: Low → High</option>
          <option value="high-low">Price: High → Low</option>
        </select>
      </div>

      {/* PRODUCT GRID */}
      {paginated.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {paginated.map((p) => (
            <div key={p._id} className="border rounded p-4 shadow">
              <img
                src={`http://localhost:5000${p.image}`}
                alt={p.name}
                className="h-40 w-full object-cover mb-3"
              />

              <h2 className="text-xl font-semibold">{p.name}</h2>
              <p className="text-gray-600">{p.category}</p>
              <p className="text-lg font-bold mt-2">₹{p.price}</p>

              <button
                className="bg-blue-600 text-white w-full py-2 rounded mt-3"
                onClick={() => handleAddToCart(p._id)}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION BUTTONS */}
      <div className="flex justify-center mt-6 gap-3">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-4 py-2 rounded ${
              page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
