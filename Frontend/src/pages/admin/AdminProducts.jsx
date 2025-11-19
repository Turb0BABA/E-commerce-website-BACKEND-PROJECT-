import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data.products);
    } catch (err) {
      console.log("Error loading admin products:", err);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;

    try {
      await API.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.log("Delete failed:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="py-8">
      <h1 className="text-3xl font-semibold mb-6">Product Management</h1>

      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3">Image</th>
              <th className="p-3">Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-b">
                <td className="p-3">
                  <img
                    src={`http://localhost:5000${p.image}`}
                    className="w-16 h-16 object-cover rounded-md border"
                  />
                </td>

                <td className="p-3">{p.name}</td>
                <td className="p-3 font-semibold">₹{p.price}</td>
                <td className="p-3">{p.stock}</td>

                <td className="p-3 flex gap-3">
                  <button
                    className="text-blue-600 hover:underline text-sm"
                    onClick={() =>
                      (window.location.href = `/admin/edit-product/${p._id}`)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="text-red-600 hover:underline text-sm"
                    onClick={() => deleteProduct(p._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
