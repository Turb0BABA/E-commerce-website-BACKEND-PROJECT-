import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import useAuthStore from "../store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", form);
      console.log("LOGIN RESPONSE:", res);

      if (res.status === 200 && res.data.user) {
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);

      alert("Login successful!");
  
      if (res.data.user.role === "admin") navigate("/admin/dashboard");
      else navigate("/");
      return;
      }

      alert(res?.data?.message || "Login failed");

    } catch (error) {
      console.error("Login error:", error);
      alert(error?.response?.data?.message || "An error occurred while logging in.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Login</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

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
          Login
        </button>
      </form>

      <p className="mt-4">
        New user?{" "}
        <span
          className="text-blue-500 cursor-pointer"
          onClick={() => navigate("/register")}
        >
          Register here
        </span>
      </p>
    </div>
  );
}
