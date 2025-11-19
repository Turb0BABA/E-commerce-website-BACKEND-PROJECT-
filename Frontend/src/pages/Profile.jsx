import { useEffect, useState } from "react";
import API from "../api/axios";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const fetchProfile = async () => {
    try {
      const res = await API.get("/auth/me");
      setUser(res.data.user);
      setForm({
        name: res.data.user.name,
        email: res.data.user.email,
        password: "",
      });
    } catch (err) {
      alert("Error loading profile");
    }
  };

  const updateProfile = async () => {
    try {
      const res = await API.put("/auth/me", form);
      alert("Profile updated!");
      fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (!user) return <h1>Loading profile...</h1>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="space-y-4 max-w-md">
        <input
          className="border p-2 w-full rounded"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({...form, name: e.target.value})}
        />

        <input
          className="border p-2 w-full rounded"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({...form, email: e.target.value})}
        />

        <input
          className="border p-2 w-full rounded"
          placeholder="New Password (optional)"
          type="password"
          value={form.password}
          onChange={(e) => setForm({...form, password: e.target.value})}
        />

        <button
          onClick={updateProfile}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Update Profile
        </button>
      </div>
    </div>
  );
}
