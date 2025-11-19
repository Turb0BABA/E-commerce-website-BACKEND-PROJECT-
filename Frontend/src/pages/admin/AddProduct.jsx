import { useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function AddProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "electronics",
    stock: "",
    description: "",
  });

  const [image, setImage] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    Object.keys(form).forEach((key) => fd.append(key, form[key]));
    if (image) fd.append("image", image);

    try {
      await API.post("/products", fd);
      alert("Product added successfully!");
      navigate("/admin/products");
    } catch (err) {
      alert("Failed to add product");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Add Product</h1>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          name="name"
          className="border p-2 w-full rounded"
          placeholder="Product Name"
          onChange={handleChange}
          required
        />

        <input
          name="price"
          type="number"
          className="border p-2 w-full rounded"
          placeholder="Price"
          onChange={handleChange}
          required
        />

        <select
          name="category"
          className="border p-2 w-full rounded"
          onChange={handleChange}
        >
          <option value="electronics">Electronics</option>
          <option value="shoes">Shoes</option>
          <option value="fashion">Fashion</option>
          <option value="home">Home</option>
        </select>

        <input
          name="stock"
          type="number"
          className="border p-2 w-full rounded"
          placeholder="Stock"
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          className="border p-2 w-full rounded"
          placeholder="Description"
          onChange={handleChange}
        ></textarea>

        <input
          type="file"
          className="border p-2 w-full rounded"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button className="bg-blue-600 text-white px-6 py-2 rounded w-full">
          Add Product
        </button>
      </form>
    </div>
  );
}
