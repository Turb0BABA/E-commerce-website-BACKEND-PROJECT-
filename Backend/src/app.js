import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

// import routes
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import adminRoutes from "./routes/admin.routes.js";


const app = express();


// FIXED CORS CONFIG

app.use(
  cors({
    origin: "http://localhost:5173",
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle OPTIONS preflight manually (fixes your crash)
// The cors package above handles CORS, so no need for manual headers here.
// REQUIRED MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// STATIC FILES
app.use("/uploads", express.static("uploads"));

// ROUTES

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);


export default app;
