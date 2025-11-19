import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="py-10 space-y-10">
      {/* Hero */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-tight">
            Shop the latest products with a clean & fast experience.
          </h1>
          <p className="mt-4 text-gray-600 text-lg">
            Browse products, manage your cart, place orders, and track them in a
            smooth, minimal interface designed for performance and clarity.
          </p>

          <div className="mt-6 flex gap-4">
            <Link
              to="/products"
              className="px-6 py-3 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-black"
            >
              Start Shopping
            </Link>
            <Link
              to="/orders"
              className="px-6 py-3 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
            >
              View My Orders
            </Link>
          </div>
        </div>

        <div className="border border-dashed border-gray-300 rounded-xl p-6 bg-white">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            What this project showcases
          </h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• JWT-based auth with protected routes</li>
            <li>• Product listing with search, sorting & filters</li>
            <li>• Cart & checkout backed by database</li>
            <li>• Order placement, tracking & admin management</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
