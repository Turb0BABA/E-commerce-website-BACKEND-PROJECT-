import { Link, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path ||
    (path !== "/" && location.pathname.startsWith(path));

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-semibold tracking-tight text-gray-900">
          E-Commerce
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm">
          <Link
            to="/products"
            className={`pb-1 ${
              isActive("/products")
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Products
          </Link>

          <Link
            to="/cart"
            className={`pb-1 ${
              isActive("/cart")
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Cart
          </Link>

          {!user && (
            <Link
              to="/login"
              className={`pb-1 ${
                isActive("/login")
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Login
            </Link>
          )}

          {user && (
            <>
              <Link
                to="/orders"
                className={`pb-1 ${
                  isActive("/orders")
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                My Orders
              </Link>

              <Link
                to="/profile"
                className={`pb-1 ${
                  isActive("/profile")
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Profile
              </Link>

              {user.role === "admin" && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`pb-1 ${
                      isActive("/admin/dashboard")
                        ? "text-gray-900 border-b-2 border-gray-900"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Admin
                  </Link>
                  <Link
                    to="/admin/orders"
                    className={`pb-1 ${
                      isActive("/admin/orders")
                        ? "text-gray-900 border-b-2 border-gray-900"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Orders
                  </Link>
                  <Link
                    to="/admin/users"
                    className={`pb-1 ${
                      isActive("/admin/users")
                        ? "text-gray-900 border-b-2 border-gray-900"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Users
                  </Link>
                </>
              )}

              <button
                onClick={logout}
                className="ml-3 text-red-500 text-sm hover:text-red-600"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
