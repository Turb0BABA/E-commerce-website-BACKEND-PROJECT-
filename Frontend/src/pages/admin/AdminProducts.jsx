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
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Product Management</h1>

      <table className="w-full">
        <thead>
          <tr className="border-b text-left">
            <th className="p-2">Name</th>
            <th className="p-2">Price</th>
            <th className="p-2">Stock</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => (
            <tr key={p._id} className="border-b">
              <td className="p-2">{p.name}</td>
              <td className="p-2">₹{p.price}</td>
              <td className="p-2">{p.stock}</td>
              <td className="p-2 flex gap-4">
                <button
                  className="text-blue-500"
                  onClick={() =>
                    (window.location.href = `/admin/edit-product/${p._id}`)
                  }
                >
                  Edit
                </button>

                <button
                  className="text-red-500"
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
  );
}
