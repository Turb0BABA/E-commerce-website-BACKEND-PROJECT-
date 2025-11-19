import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import useAuthStore from "../store/authStore";

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();


  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/register", form);

    console.log("REGISTER RESPONSE:", res);

      if (res.status === 201 && res.data.user) {
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      alert("Registration successful!");
      navigate("/");
      return;
    }

      // if backend returned message
      alert(res?.data?.message || "Registration failed");


    } catch (err) {
      console.log("Register Error:", err);
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Register</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          placeholder="Name"
          required
          className="border px-3 py-2 w-full rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="email"
          placeholder="Email"
          required
          className="border px-3 py-2 w-full rounded"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          required
          className="border px-3 py-2 w-full rounded"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          Register
        </button>
      </form>

      <p className="mt-4">
        Already have an account?{" "}
        <span
          className="text-blue-500 cursor-pointer"
          onClick={() => navigate("/login")}
        >
          Login here
        </span>
      </p>
    </div>
  );
}
