import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/axios";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await API.get(`/products/${id}`);
      setProduct(res.data.product);
    };
    load();
  }, []);

  const updateProduct = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    Object.keys(product).forEach((key) => fd.append(key, product[key]));
    if (image) fd.append("image", image);

    try {
      await API.put(`/products/${id}`, fd);
      alert("Product updated!");
      navigate("/admin/products");
    } catch (err) {
      alert("Update failed!");
    }
  };

  if (!product) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>

      <form className="space-y-4" onSubmit={updateProduct}>
        <input
          className="border p-2 w-full rounded"
          value={product.name}
          onChange={(e) => setProduct({ ...product, name: e.target.value })}
        />

        <input
          type="number"
          className="border p-2 w-full rounded"
          value={product.price}
          onChange={(e) => setProduct({ ...product, price: e.target.value })}
        />

        <select
          className="border p-2 w-full rounded"
          value={product.category}
          onChange={(e) => setProduct({ ...product, category: e.target.value })}
        >
          <option value="electronics">Electronics</option>
          <option value="shoes">Shoes</option>
          <option value="fashion">Fashion</option>
          <option value="home">Home</option>
        </select>

        <input
          type="number"
          className="border p-2 w-full rounded"
          value={product.stock}
          onChange={(e) => setProduct({ ...product, stock: e.target.value })}
        />

        <textarea
          className="border p-2 w-full rounded"
          value={product.description}
          onChange={(e) =>
            setProduct({ ...product, description: e.target.value })
          }
        ></textarea>

        <input
          type="file"
          className="border p-2 w-full rounded"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button className="bg-blue-600 text-white px-6 py-2 rounded w-full">
          Save Changes
        </button>
      </form>
    </div>
  );
}
