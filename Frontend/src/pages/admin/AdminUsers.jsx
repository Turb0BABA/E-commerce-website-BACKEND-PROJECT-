import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    try {
      const res = await API.get("/auth/all");
      setUsers(res.data.users);
    } catch (err) {
      alert("Failed to load users");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="py-8">
      <h1 className="text-3xl font-semibold mb-6">Users</h1>

      <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 font-medium">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
