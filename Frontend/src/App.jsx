import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import MyOrders from "./pages/MyOrders.jsx";
import OrderDetails from "./pages/OrderDetails.jsx";




export default function App() {
  console.log("APP RENDERED");

  return (
    <BrowserRouter>
      <Navbar />
      <div className="p-4">
        <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/products" element={<Products />} />
  <Route path="/product/:id" element={<ProductDetails />} />

  <Route path="/cart" element={<Cart />} />
  <Route path="/checkout" element={<Checkout />} />

  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* USER ORDERS */}
  <Route path="/orders" element={<MyOrders />} />
  <Route path="/orders/:id" element={<OrderDetails />} />

  <Route path="/profile" element={<Profile />} />

  {/* ADMIN */}
  <Route path="/admin/add-product" element={<AddProduct />} />
  <Route path="/admin/edit-product/:id" element={<EditProduct />} />
  <Route path="/admin/orders" element={<AdminOrders />} />
  <Route path="/admin/users" element={<AdminUsers />} />
  <Route path="/admin/dashboard" element={<AdminDashboard />} />
  <Route path="/admin/products" element={<AdminProducts />} />
</Routes> 

      </div>
    </BrowserRouter>
  );
}
