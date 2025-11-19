import useAuthStore from "../store/authStore";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">E-Commerce</Link>

      <div className="flex gap-6">

        <Link to="/products">Products</Link>
        <Link to="/cart">Cart</Link>

        {/* If not logged in */}
        {!user && <Link to="/login">Login</Link>}

        {/* If logged in */}
        {user && (
          <>
            <Link to="/orders">My Orders</Link>
            <Link to="/profile">Profile</Link>

            {/* Admin only */}
            {user.role === "admin" && (
              <>
                <Link to="/admin/dashboard">Admin Dashboard</Link>
                <Link to="/admin/orders">Order Management</Link>
                <Link to="/admin/users">Manage Users</Link>
              </>
            )}

            <button
              onClick={logout}
              className="text-red-400 hover:text-red-300"
            >
              Logout
            </button>
          </>
        )}

      </div>
    </nav>
  );
}
