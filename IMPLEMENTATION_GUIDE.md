# Backend Implementation Guide & Best Practices

Comprehensive guide for understanding and maintaining the E-Commerce backend architecture.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Code Organization](#code-organization)
3. [Authentication System](#authentication-system)
4. [Data Flow](#data-flow)
5. [Business Logic](#business-logic)
6. [Middleware Pipeline](#middleware-pipeline)
7. [Error Handling](#error-handling)
8. [Database Schema](#database-schema)
9. [File Upload System](#file-upload-system)
10. [Email & Notifications](#email--notifications)
11. [Admin Features](#admin-features)
12. [Security Best Practices](#security-best-practices)
13. [Performance Optimization](#performance-optimization)
14. [Testing Guide](#testing-guide)
15. [Deployment Checklist](#deployment-checklist)

---

## Architecture Overview

### MVC Pattern (Modified)

The backend follows a **Model-View-Controller** pattern:

```
Request → Routes → Middleware → Controllers → Models → Database
                                    ↓
                              Business Logic
                                    ↓
                              Response
```

**Components:**
- **Models**: Data schema definitions (Mongoose schemas)
- **Controllers**: Business logic and request handling
- **Routes**: URL endpoints and middleware chains
- **Middleware**: Authentication, authorization, file uploads
- **Utils**: Helper functions (email, invoicing)

---

## Code Organization

### Folder Structure Explained

```
Backend/
├── server.js
│   └── Entry point
│       Loads environment variables
│       Connects to MongoDB
│       Starts Express server
│
├── src/
│   ├── app.js
│   │   └── Express app configuration
│   │       CORS setup, middleware mounting, route registration
│   │
│   ├── config/db.js
│   │   └── MongoDB connection
│   │       Mongoose connection with error handling
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   │   └── registerUser(), loginUser()
│   │   │       User authentication logic
│   │   │
│   │   ├── product.controller.js
│   │   │   └── addProduct(), getProducts(), updateProduct(), deleteProduct()
│   │   │       Product CRUD with filtering and pagination
│   │   │
│   │   ├── cart.controller.js
│   │   │   └── getCart(), addToCart(), updateCartItem(), removeCartItem(), clearCart()
│   │   │       Shopping cart operations
│   │   │
│   │   ├── order.controller.js
│   │   │   └── placeOrder(), getUserOrders(), getOrderById(), updateOrderStatus()
│   │   │       Order management and checkout
│   │   │
│   │   ├── admin.controller.js
│   │   │   └── getSummary(), getMonthlyRevenue(), getTopProducts(), etc.
│   │   │       Admin dashboard analytics
│   │   │
│   │   └── profile.controller.js
│   │       └── getProfile(), updateProfile()
│   │           User profile management
│   │
│   ├── models/
│   │   ├── user.model.js
│   │   │   └── Schema: name, email, password, role, active
│   │   │       Indexes: email (unique)
│   │   │
│   │   ├── product.model.js
│   │   │   └── Schema: name, price, category, stock, description, image
│   │   │       Indexes: category, name
│   │   │
│   │   ├── order.model.js
│   │   │   └── Schema: user, items[], totalAmount, status, paymentStatus
│   │   │       References: User, Product
│   │   │
│   │   └── cart.model.js
│   │       └── Schema: user, items[]
│   │           Unique index: user
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   │   └── POST /register, /login
│   │   │       GET /all (admin)
│   │   │
│   │   ├── product.routes.js
│   │   │   └── POST / (admin), GET /, GET /:id, PUT /:id (admin), DELETE /:id (admin)
│   │   │
│   │   ├── cart.routes.js
│   │   │   └── GET /, POST /add, PUT /update, DELETE /item/:id, DELETE /clear
│   │   │
│   │   ├── order.routes.js
│   │   │   └── POST /, GET /, GET /:id, PUT /:id (admin)
│   │   │
│   │   └── admin.routes.js
│   │       └── All admin analytics and management endpoints
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   │   └── protect: JWT verification
│   │   │       admin: Role checking
│   │   │
│   │   └── upload.js
│   │       └── Multer disk storage configuration
│   │
│   └── utils/
│       ├── email.js
│       │   └── sendInvoiceEmail() function
│       │
│       ├── invoiceTemplate.js
│       │   └── generateInvoiceHTML() function
│       │
│       ├── invoice.js
│       │   └── Invoice generation utilities
│       │
│       └── SendEmail.js
│           └── Email service provider (SMTP/API)
│
├── uploads/
│   └── Product images stored here
│
└── invoices/
    └── Generated invoice PDFs/HTMLs
```

---

## Authentication System

### JWT Flow Diagram

```
1. REGISTRATION
   User Input → registerUser() → Hash Password → Create User → Sign JWT Token → Return Token + User

2. LOGIN
   User Input → loginUser() → Compare Password → Sign JWT Token → Return Token + User

3. PROTECTED REQUEST
   Request + Token → protect middleware → Verify JWT → Extract User Data → next() → Controller
```

### JWT Token Structure

```javascript
// Payload stored in JWT
{
  "id": "60f76f29f19591123a4ebbcd",      // User MongoDB ObjectId
  "email": "user@example.com",
  "role": "user",                         // or "admin"
  "iat": 1700000000,                      // Issued At (timestamp)
  "exp": 1700604000                       // Expiration (7 days later)
}
```

### Authentication Implementation

**File:** `Backend/src/middleware/auth.js`

```javascript
export const protect = (req, res, next) => {
  try {
    // 1. Extract token from "Authorization: Bearer <token>" header
    const authHeader = req.headers.authorization;
    const [type, token] = authHeader.split(" ");

    // 2. Verify token signature with JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach user data to request object
    req.user = decoded;

    // 4. Pass control to next middleware/controller
    next();
  } catch (err) {
    // Return 401 if token invalid/expired
    return res.status(401).json({ message: "Invalid token" });
  }
};
```

### Adding Authentication to Routes

```javascript
// Public route (no auth needed)
router.get("/products", getProducts);

// Protected route (auth required)
router.post("/cart/add", protect, addToCart);

// Admin-only route (auth + admin role required)
router.post("/products", protect, admin, addProduct);
```

---

## Data Flow

### Checkout & Order Creation Flow

```
┌─────────────────────────────────────────────────┐
│ User Places Order                               │
│ POST /api/orders { address, paymentMethod }    │
└────────────────────┬────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ Controller: placeOrder()                         │
└────────────────────┬────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ 1. Get User's Cart                              │
│    Cart.findOne({ user: userId })               │
└────────────────────┬────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ 2. Validate Cart & Stock                        │
│    - Check cart not empty                       │
│    - Check stock availability for each item     │
└────────────────────┬────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ 3. Reduce Product Stock                         │
│    For each item: Product.updateOne({           │
│      $inc: { stock: -quantity }                 │
│    })                                           │
└────────────────────┬────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ 4. Create Order Document                        │
│    Order.create({                               │
│      user: userId,                              │
│      items: [...],                              │
│      totalAmount,                               │
│      status: "pending",                         │
│      paymentStatus: "not paid"                  │
│    })                                           │
└────────────────────┬────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ 5. Clear User's Cart                            │
│    cart.items = []                              │
│    cart.save()                                  │
└────────────────────┬────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ 6. Generate & Send Invoice Email                │
│    generateInvoiceHTML(order)                   │
│    sendInvoiceEmail(user.email, html)           │
└────────────────────┬────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ 7. Return Order Confirmation                    │
│    Response: { message, order }                 │
└─────────────────────────────────────────────────┘
```

### Product Management Flow

```
ADD PRODUCT:
Image Upload (Multer) → Filename Generated → Stored in /uploads/ → Path saved in DB

UPDATE PRODUCT:
New Image Upload (optional) → Old Image Path Replaced → DB Updated → Response sent

DELETE PRODUCT:
Product.findByIdAndDelete() → Stock decremented in orders (if referenced) → File cleanup (optional)
```

---

## Business Logic

### Key Business Rules

#### 1. **Stock Management**
```javascript
// Before placing order, validate stock
for (const item of cart.items) {
  if (item.product.stock < item.quantity) {
    throw Error("Insufficient stock");
  }
}

// After order created, reduce stock
for (const item of cart.items) {
  await Product.findByIdAndUpdate(item.product._id, {
    $inc: { stock: -item.quantity }
  });
}
```

#### 2. **Cart Deduplication**
```javascript
// When adding item to cart:
// If product already exists in cart, increment quantity
const existingItem = cart.items.find(
  item => item.product.toString() === productId
);

if (existingItem) {
  existingItem.quantity += quantity;  // Increment
} else {
  cart.items.push({ product: productId, quantity });  // New item
}
```

#### 3. **Price Snapshot**
```javascript
// Order items store price at time of purchase
const orderItem = {
  product: item.product._id,
  quantity: item.quantity,
  price: item.product.price  // Snapshot (not live price)
};
```

#### 4. **Revenue Calculation**
```javascript
// Only count paid orders
const revenueData = await Order.aggregate([
  { $match: { paymentStatus: "paid" } },
  { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
]);
```

---

## Middleware Pipeline

### Request Processing Order

```
Express Server
    ↓
1. CORS Middleware
   ├─ Checks origin
   └─ Sets headers
    ↓
2. Body Parser Middleware
   ├─ Parses JSON
   └─ Parses URL-encoded
    ↓
3. Cookie Parser Middleware
   └─ Parses cookies
    ↓
4. Morgan Logging Middleware
   └─ Logs request details
    ↓
5. Static Files Middleware (for /uploads)
   └─ Serves images
    ↓
6. Route Handler
    ↓
    ├─ If Route Matches:
    │  └─ Authentication Middleware (protect)
    │     ├─ If present, verifies JWT
    │     └─ Attaches user to req
    │        ↓
    │     Authorization Middleware (admin)
    │     ├─ If present, checks role
    │     └─ Proceeds if admin
    │        ↓
    │     File Upload Middleware (upload)
    │     ├─ If present, handles file
    │     └─ Stores file, sets req.file
    │        ↓
    │     Controller Function
    │     └─ Processes request & sends response
    │
    └─ If No Match:
       └─ 404 Not Found
```

---

## Error Handling

### Error Handling Pattern

```javascript
export const controllerFunction = async (req, res) => {
  try {
    // 1. Validate input
    const { required_field } = req.body;
    if (!required_field) {
      return res.status(400).json({ message: "Field required" });
    }

    // 2. Query database
    const data = await Model.findById(id);
    if (!data) {
      return res.status(404).json({ message: "Not found" });
    }

    // 3. Business logic
    const result = await processData(data);

    // 4. Success response
    res.json({ message: "Success", result });

  } catch (error) {
    // Catch-all error handler
    console.error("Error:", error);
    res.status(500).json({ message: error.message });
  }
};
```

### Standard Error Responses

```javascript
// 400 Bad Request
res.status(400).json({ message: "Validation failed" });

// 401 Unauthorized
res.status(401).json({ message: "Not authorized, no token" });

// 403 Forbidden
res.status(403).json({ message: "Admin access only" });

// 404 Not Found
res.status(404).json({ message: "Resource not found" });

// 500 Server Error
res.status(500).json({ message: error.message });
```

---

## Database Schema

### User Schema

```javascript
{
  _id: ObjectId,
  name: String (required, trimmed),
  email: String (required, unique, lowercase),
  password: String (hashed, required),
  role: String (enum: ["user", "admin"], default: "user"),
  active: Boolean (default: true),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Indexes:
// - email (unique)
// - role (for admin queries)
```

### Product Schema

```javascript
{
  _id: ObjectId,
  name: String (required, trimmed),
  price: Number (required),
  category: String (required, trimmed),
  stock: Number (required, default: 0),
  description: String (default: ""),
  image: String (optional, path to file),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Indexes:
// - category (for filtering)
// - name (for search)
```

### Order Schema

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: "User", required),
  items: [
    {
      product: ObjectId (ref: "Product"),
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: Number (required),
  address: String,
  status: String (enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
                  default: "pending"),
  paymentMethod: String (default: "COD"),
  paymentStatus: String (enum: ["not paid", "paid"], default: "not paid"),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Indexes:
// - user (for user queries)
// - status (for filtering)
// - createdAt (for sorting)
```

### Cart Schema

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: "User", required, unique),
  items: [
    {
      product: ObjectId (ref: "Product"),
      quantity: Number (min: 1)
    }
  ],
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Indexes:
// - user (unique for one cart per user)
```

---

## File Upload System

### Multer Configuration

**File:** `Backend/src/middleware/upload.js`

```javascript
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  // Destination folder
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  // Filename generation
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });
export default upload;
```

### Usage in Routes

```javascript
// Single file upload
router.post(
  "/products",
  protect,
  admin,
  upload.single("image"),  // "image" is form field name
  addProduct
);

// Accessing uploaded file in controller
export const addProduct = async (req, res) => {
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
  // ...
};
```

### File Storage

```
/uploads/
├── 1700451234567.jpg
├── 1700451234568.png
├── 1700451234569.jpg
└── ...
```

**Serving Files:**
```javascript
// In app.js
app.use("/uploads", express.static("uploads"));

// Access via browser
http://localhost:5000/uploads/1700451234567.jpg
```

---

## Email & Notifications

### Email Flow

**Files Involved:**
- `Backend/src/utils/email.js` - Main email sending function
- `Backend/src/utils/invoiceTemplate.js` - HTML invoice template
- `Backend/src/utils/SendEmail.js` - SMTP/Email provider

### Invoice Email Process

```
1. Order Created
        ↓
2. Generate HTML Invoice
   generateInvoiceHTML(order, user)
        ↓
3. Send Email
   sendInvoiceEmail(user.email, subject, htmlContent)
        ↓
4. Email Service (SMTP/SendGrid/etc)
        ↓
5. Delivered to User
```

### Email Template Example

```html
<html>
  <body>
    <h1>Your Order Invoice</h1>
    <p>Order ID: {{orderId}}</p>
    <table>
      <tr>
        <th>Product</th>
        <th>Qty</th>
        <th>Price</th>
      </tr>
      {{items}}
    </table>
    <p>Total: ${{totalAmount}}</p>
  </body>
</html>
```

---

## Admin Features

### Dashboard Summary
```javascript
// Endpoint: GET /api/admin/summary
{
  totalUsers: Count all users,
  totalOrders: Count all orders,
  totalProducts: Count all products,
  totalRevenue: Sum all paid orders
}
```

### Monthly Revenue Report
```javascript
// Aggregation pipeline
db.orders.aggregate([
  { $match: { paymentStatus: "paid" } },
  {
    $group: {
      _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
      total: { $sum: "$totalAmount" }
    }
  },
  { $sort: { "_id.year": 1, "_id.month": 1 } }
])
```

### Top Products Report
```javascript
// Aggregation pipeline
db.orders.aggregate([
  { $unwind: "$items" },
  {
    $group: {
      _id: "$items.product",
      totalSold: { $sum: "$items.quantity" }
    }
  },
  { $sort: { totalSold: -1 } },
  { $limit: 5 },
  {
    $lookup: {
      from: "products",
      localField: "_id",
      foreignField: "_id",
      as: "productDetails"
    }
  }
])
```

---

## Security Best Practices

### ✅ Implemented

1. **Password Hashing**
   ```javascript
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

2. **JWT Authentication**
   ```javascript
   const token = jwt.sign(payload, SECRET, { expiresIn: "7d" });
   ```

3. **Role-Based Access Control**
   ```javascript
   if (req.user.role !== "admin") {
     return res.status(403).json({ message: "Admin access only" });
   }
   ```

4. **CORS Configuration**
   ```javascript
   app.use(cors({
     origin: process.env.CLIENT_ORIGIN,
     credentials: true
   }));
   ```

5. **Environment Variables**
   ```javascript
   import dotenv from "dotenv";
   dotenv.config();
   const JWT_SECRET = process.env.JWT_SECRET;
   ```

### ⚠️ Recommendations for Production

1. **Add Rate Limiting**
   ```javascript
   import rateLimit from "express-rate-limit";
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   });
   app.use("/api/", limiter);
   ```

2. **Input Validation**
   ```javascript
   import { body, validationResult } from "express-validator";
   router.post("/register", [
     body("email").isEmail(),
     body("password").isLength({ min: 8 })
   ], registerUser);
   ```

3. **SQL Injection Prevention**
   - Already protected by Mongoose ODM

4. **CSRF Protection**
   ```javascript
   import csrf from "csurf";
   app.use(csrf());
   ```

5. **Helmet Security Headers**
   ```javascript
   import helmet from "helmet";
   app.use(helmet());
   ```

6. **Use HTTPS**
   - Deploy with SSL certificate

7. **Refresh Token Rotation**
   - Implement short-lived access tokens + refresh tokens

---

## Performance Optimization

### Database Query Optimization

#### 1. **Pagination**
```javascript
// Instead of:
const products = await Product.find();

// Use pagination:
const page = req.query.page || 1;
const limit = req.query.limit || 10;
const skip = (page - 1) * limit;
const products = await Product.find().skip(skip).limit(limit);
```

#### 2. **Projection (Select Fields)**
```javascript
// Instead of:
const users = await User.find();

// Select only needed fields:
const users = await User.find().select("-password");
```

#### 3. **Indexing**
```javascript
// In schema:
userSchema.index({ email: 1 });
productSchema.index({ category: 1 });
orderSchema.index({ user: 1 });
```

#### 4. **Aggregation Pipeline**
```javascript
// Instead of fetching and processing in app:
const revenue = await Order.aggregate([
  { $match: { paymentStatus: "paid" } },
  { $group: { _id: null, total: { $sum: "$totalAmount" } } }
]);
```

### Caching Strategies

```javascript
// Cache product list (simple example)
let cachedProducts = null;
let cacheExpiry = null;

export const getProducts = async (req, res) => {
  if (cachedProducts && Date.now() < cacheExpiry) {
    return res.json({ products: cachedProducts, fromCache: true });
  }

  const products = await Product.find();
  cachedProducts = products;
  cacheExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

  res.json({ products });
};
```

---

## Testing Guide

### Unit Testing (Jest)

```javascript
// tests/auth.test.js
import { registerUser } from "../controllers/auth.controller.js";

describe("Auth Controller", () => {
  test("should register user with valid input", async () => {
    const req = {
      body: {
        name: "John",
        email: "john@example.com",
        password: "pass123"
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("should reject duplicate email", async () => {
    // Test implementation
  });
});
```

### Integration Testing (Supertest)

```javascript
// tests/api.test.js
import request from "supertest";
import app from "../src/app.js";

describe("API Integration Tests", () => {
  test("GET /api/products should return products", async () => {
    const response = await request(app)
      .get("/api/products")
      .expect(200);

    expect(response.body).toHaveProperty("products");
    expect(Array.isArray(response.body.products)).toBe(true);
  });

  test("POST /api/auth/register should create user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "testpass123"
      })
      .expect(201);

    expect(response.body).toHaveProperty("token");
  });
});
```

### Manual Testing with cURL

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'

# Add product (with token)
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer <token>" \
  -F "name=Laptop" \
  -F "price=999.99" \
  -F "category=Electronics" \
  -F "stock=50" \
  -F "image=@laptop.jpg"
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured (.env file)
- [ ] MongoDB Atlas or production DB connection tested
- [ ] API tested locally with all endpoints
- [ ] Unit tests passing
- [ ] Security headers added (helmet)
- [ ] Rate limiting configured
- [ ] HTTPS certificate obtained
- [ ] Email service configured

### Deployment Steps

1. **Install Production Dependencies**
   ```bash
   npm install --production
   ```

2. **Set Environment Variables**
   ```bash
   export NODE_ENV=production
   export PORT=5000
   export MONGODB_URI=mongodb+srv://...
   export JWT_SECRET=<strong_secret>
   export CLIENT_ORIGIN=https://yourdomain.com
   ```

3. **Build & Start**
   ```bash
   npm start
   ```

4. **Use Process Manager (PM2)**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "ecommerce-api"
   pm2 save
   pm2 startup
   ```

5. **Set Up Reverse Proxy (Nginx)**
   ```nginx
   server {
     listen 80;
     server_name yourdomain.com;

     location / {
       proxy_pass http://localhost:5000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

6. **SSL Certificate (Let's Encrypt)**
   ```bash
   certbot certonly --standalone -d yourdomain.com
   ```

### Post-Deployment

- [ ] Monitor logs for errors
- [ ] Test all endpoints
- [ ] Monitor database connections
- [ ] Set up backups
- [ ] Monitor performance metrics
- [ ] Update documentation

---

## Troubleshooting

### Common Issues

**1. "Cannot find module 'mongoose'"**
```bash
# Fix: Install missing dependency
npm install mongoose
```

**2. "MongooseError: Model.findByIdAndUpdate() requires a callback"**
```bash
# Fix: Update MongoDB/Mongoose version
npm update mongoose
```

**3. "CORS error: No 'Access-Control-Allow-Origin' header"**
```javascript
// Fix: Check CORS configuration in app.js
// Verify CLIENT_ORIGIN matches frontend URL
```

**4. "JWT token expired"**
```javascript
// Fix: Generate new token
// Token valid for 7 days by default
```

**5. "File upload fails - EACCES permission denied"**
```bash
# Fix: Create uploads directory with permissions
mkdir -p uploads
chmod 755 uploads
```

---

## Extending the Backend

### Adding New Feature

**Example: Product Reviews**

1. Create Review model
   ```javascript
   // models/review.model.js
   const reviewSchema = new Schema({
     product: { ref: "Product" },
     user: { ref: "User" },
     rating: Number,
     comment: String
   });
   ```

2. Create Review controller
   ```javascript
   // controllers/review.controller.js
   export const addReview = async (req, res) => { ... };
   export const getReviews = async (req, res) => { ... };
   ```

3. Create Review routes
   ```javascript
   // routes/review.routes.js
   router.post("/:productId", protect, addReview);
   router.get("/:productId", getReviews);
   ```

4. Register routes in app.js
   ```javascript
   app.use("/api/reviews", reviewRoutes);
   ```

---

## Resources

- **Mongoose Documentation**: https://mongoosejs.com/docs/
- **Express.js Guide**: https://expressjs.com/
- **JWT Guide**: https://jwt.io/
- **MongoDB Aggregation**: https://docs.mongodb.com/manual/aggregation/

