# E-Commerce Backend Documentation

This document provides comprehensive documentation for the E-Commerce Backend API, including all integrated features, authentication mechanisms, data models, and endpoints.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Environment Setup](#environment-setup)
5. [Data Models](#data-models)
6. [Authentication & Authorization](#authentication--authorization)
7. [API Endpoints](#api-endpoints)
   - [Authentication Routes](#authentication-routes)
   - [Product Routes](#product-routes)
   - [Cart Routes](#cart-routes)
   - [Order Routes](#order-routes)
   - [Admin Routes](#admin-routes)
8. [Middleware](#middleware)
9. [Error Handling](#error-handling)
10. [Advanced Features](#advanced-features)

---

## Project Overview

This is a full-featured **E-Commerce Backend API** built with **Node.js**, **Express**, and **MongoDB**. The backend handles:

- **User Authentication** (JWT-based registration & login)
- **Product Management** (CRUD operations with image uploads)
- **Shopping Cart** (add, update, remove items)
- **Order Management** (checkout, order history, invoicing)
- **Admin Dashboard** (analytics, user management, low-stock alerts)
- **Email Notifications** (order invoices sent via email)

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | JWT (JSON Web Tokens) |
| **Password Hashing** | bcryptjs |
| **File Upload** | Multer |
| **Email Service** | Email utilities (SendEmail.js) |
| **Logging** | Morgan |
| **CORS** | CORS middleware |

---

## Project Structure

```
Backend/
├── server.js                          # Entry point
├── package.json                       # Dependencies
├── src/
│   ├── app.js                        # Express app configuration
│   ├── config/
│   │   └── db.js                     # MongoDB connection
│   ├── controllers/                   # Business logic
│   │   ├── auth.controller.js        # Register, Login
│   │   ├── product.controller.js     # Product CRUD
│   │   ├── cart.controller.js        # Cart operations
│   │   ├── order.controller.js       # Order checkout & management
│   │   ├── admin.controller.js       # Admin analytics & stats
│   │   └── profile.controller.js     # User profile management
│   ├── models/                        # Data schemas
│   │   ├── user.model.js             # User schema
│   │   ├── product.model.js          # Product schema
│   │   ├── order.model.js            # Order schema
│   │   └── cart.model.js             # Cart schema
│   ├── routes/                        # Route definitions
│   │   ├── auth.routes.js            # Auth endpoints
│   │   ├── product.routes.js         # Product endpoints
│   │   ├── cart.routes.js            # Cart endpoints
│   │   ├── order.routes.js           # Order endpoints
│   │   └── admin.routes.js           # Admin endpoints
│   ├── middleware/                    # Custom middleware
│   │   ├── auth.js                   # JWT protection & role-based access
│   │   └── upload.js                 # Multer file upload configuration
│   └── utils/                         # Utility functions
│       ├── email.js                  # Email sending logic
│       ├── invoice.js                # Invoice generation
│       ├── invoiceTemplate.js        # HTML invoice template
│       └── SendEmail.js              # Email service provider
├── uploads/                           # Uploaded product images
└── invoices/                          # Generated invoices
```

---

## Environment Setup

Create a `.env` file in the `Backend/` directory with the following variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce
# OR for MongoDB Atlas:
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ecommerce

# JWT
JWT_SECRET=your_jwt_secret_key_here

# CORS
CLIENT_ORIGIN=http://localhost:5173

# Email (if using email service)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Payment Gateway (future integration)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### Installation & Running

```bash
cd Backend
npm install
npm start
# Server runs on http://localhost:5000
```

---

## Data Models

### 1. User Model

Stores user account information with role-based access.

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (hashed, required),
  role: String (enum: ["user", "admin"], default: "user"),
  active: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Key Fields:**
- `role`: Determines access level ("user" for customers, "admin" for administrators)
- `active`: Used for user management (admin can deactivate accounts)

---

### 2. Product Model

Contains product information including pricing and inventory.

```javascript
{
  _id: ObjectId,
  name: String (required),
  price: Number (required),
  category: String (required),
  stock: Number (default: 0),
  description: String (default: ""),
  image: String (path to uploaded image or null),
  createdAt: Date,
  updatedAt: Date
}
```

**Key Fields:**
- `stock`: Tracks available inventory (decremented on order)
- `image`: Path to uploaded product image stored in `/uploads/`
- `category`: Used for filtering and admin analytics

---

### 3. Order Model

Represents customer orders with items, pricing, and payment status.

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, required),
  items: [
    {
      product: ObjectId (ref: Product),
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: Number (required),
  address: String (delivery address),
  status: String (enum: ["pending", "processing", "shipped", "delivered", "cancelled"], 
                   default: "pending"),
  paymentMethod: String (default: "COD"),
  paymentStatus: String (enum: ["not paid", "paid"], default: "not paid"),
  createdAt: Date,
  updatedAt: Date
}
```

**Key Features:**
- Items stored with product reference, quantity, and snapshot price
- Stock reduced on order creation
- Invoice sent via email on order placement
- Admin can update status and payment status

---

### 4. Cart Model

Tracks temporary shopping cart for each user.

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, required, unique),
  items: [
    {
      product: ObjectId (ref: Product),
      quantity: Number (min: 1, default: 1)
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

**Key Features:**
- One cart per user (unique constraint on user ID)
- Items reference products without storing quantities in products
- Cleared automatically on checkout

---

## Authentication & Authorization

### JWT Flow

1. **Registration**: User creates account → password hashed with bcryptjs → JWT token issued
2. **Login**: Credentials verified → JWT token issued
3. **Protected Routes**: Token sent in `Authorization: Bearer <token>` header → middleware verifies token

### Token Structure

```javascript
{
  id: user._id,
  email: user.email,
  role: user.role,
  iat: issued_at_timestamp,
  exp: expiration_timestamp (7 days)
}
```

### Role-Based Access Control

**Two-level protection:**

1. **`protect` middleware**: Verifies JWT token is present and valid
2. **`admin` middleware**: Verifies user role is "admin" (used after `protect`)

**Example Route:**
```javascript
router.get("/admin/summary", protect, admin, getSummary);
// Only logged-in admin users can access
```

---

## API Endpoints

### Authentication Routes

**Base URL:** `http://localhost:5000/api/auth`

#### 1. Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201 Created):**
```json
{
  "message": "User Registered Successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error (400):**
```json
{ "message": "Email already exists" }
```

---

#### 2. Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error (400):**
```json
{ "message": "Invalid credentials" }
```

---

#### 3. Get All Users (Admin Only)

```http
GET /api/auth/all
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "active": true
    }
  ]
}
```

---

### Product Routes

**Base URL:** `http://localhost:5000/api/products`

#### 1. Create Product (Admin Only)

```http
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "name": "Laptop",
  "price": 999.99,
  "category": "Electronics",
  "stock": 50,
  "description": "High-performance laptop",
  "image": <file>
}
```

**Response (201 Created):**
```json
{
  "message": "Product added",
  "product": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Laptop",
    "price": 999.99,
    "category": "Electronics",
    "stock": 50,
    "description": "High-performance laptop",
    "image": "/uploads/1700451234567.jpg"
  }
}
```

---

#### 2. Get All Products (Public)

```http
GET /api/products?category=Electronics&search=laptop&sort=price&page=1&limit=10
```

**Query Parameters:**
- `category` (optional): Filter by category
- `search` (optional): Search product name (case-insensitive regex)
- `sort` (optional): Sort by field (e.g., "price", "-createdAt")
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page

**Response (200 OK):**
```json
{
  "total": 5,
  "page": 1,
  "pages": 1,
  "products": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Laptop",
      "price": 999.99,
      "category": "Electronics",
      "stock": 50,
      "image": "/uploads/1700451234567.jpg"
    }
  ]
}
```

---

#### 3. Get Single Product

```http
GET /api/products/:id
```

**Response (200 OK):**
```json
{
  "product": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Laptop",
    "price": 999.99,
    "category": "Electronics",
    "stock": 50,
    "description": "High-performance laptop",
    "image": "/uploads/1700451234567.jpg"
  }
}
```

---

#### 4. Update Product (Admin Only)

```http
PUT /api/products/:id
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "name": "Gaming Laptop",
  "price": 1299.99,
  "stock": 45,
  "image": <file> (optional)
}
```

**Response (200 OK):**
```json
{
  "message": "Product updated",
  "updatedProduct": { ... }
}
```

---

#### 5. Delete Product (Admin Only)

```http
DELETE /api/products/:id
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{ "message": "Product deleted" }
```

---

### Cart Routes

**Base URL:** `http://localhost:5000/api/cart`

*All cart routes require authentication.*

#### 1. Get Cart

```http
GET /api/cart
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "cart": {
    "_id": "507f1f77bcf86cd799439013",
    "user": "507f1f77bcf86cd799439011",
    "items": [
      {
        "product": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Laptop",
          "price": 999.99,
          "image": "/uploads/1700451234567.jpg",
          "stock": 50
        },
        "quantity": 1
      }
    ]
  },
  "totalItems": 1
}
```

---

#### 2. Add to Cart

```http
POST /api/cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "507f1f77bcf86cd799439012",
  "quantity": 1
}
```

**Response (200 OK):**
```json
{
  "message": "Product added to cart",
  "cart": { ... }
}
```

**Notes:**
- If product already in cart, quantity increments
- If cart doesn't exist, it's created automatically

---

#### 3. Update Cart Item

```http
PUT /api/cart/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "507f1f77bcf86cd799439012",
  "quantity": 3
}
```

**Response (200 OK):**
```json
{
  "message": "Cart updated",
  "cart": { ... }
}
```

---

#### 4. Remove Item from Cart

```http
DELETE /api/cart/item/:productId
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Item removed from cart",
  "cart": { ... }
}
```

---

#### 5. Clear Cart

```http
DELETE /api/cart/clear
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Cart cleared",
  "cart": { ... }
}
```

---

### Order Routes

**Base URL:** `http://localhost:5000/api/orders`

#### 1. Place Order (Checkout)

```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "address": "123 Main Street, New York, NY 10001",
  "paymentMethod": "COD"
}
```

**Process:**
1. Validates cart not empty
2. Checks stock availability
3. Decrements stock for each product
4. Creates order
5. Clears cart
6. Sends invoice email to user

**Response (201 Created):**
```json
{
  "message": "Order placed successfully",
  "order": {
    "_id": "507f1f77bcf86cd799439014",
    "user": "507f1f77bcf86cd799439011",
    "items": [
      {
        "product": "507f1f77bcf86cd799439012",
        "quantity": 1,
        "price": 999.99
      }
    ],
    "totalAmount": 999.99,
    "address": "123 Main Street, New York, NY 10001",
    "status": "pending",
    "paymentMethod": "COD",
    "paymentStatus": "not paid",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### 2. Get User Orders

```http
GET /api/orders
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "orders": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "user": "507f1f77bcf86cd799439011",
      "items": [...],
      "totalAmount": 999.99,
      "status": "pending",
      "paymentStatus": "not paid",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### 3. Get Order by ID

```http
GET /api/orders/:id
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "order": {
    "_id": "507f1f77bcf86cd799439014",
    "user": "507f1f77bcf86cd799439011",
    "items": [
      {
        "product": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Laptop",
          "price": 999.99,
          "image": "/uploads/1700451234567.jpg"
        },
        "quantity": 1,
        "price": 999.99
      }
    ],
    "totalAmount": 999.99,
    "address": "123 Main Street, New York, NY 10001",
    "status": "pending",
    "paymentStatus": "not paid"
  }
}
```

---

### Admin Routes

**Base URL:** `http://localhost:5000/api/admin`

*All admin routes require authentication + admin role.*

#### 1. Get Dashboard Summary

```http
GET /api/admin/summary
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "totalUsers": 42,
  "totalOrders": 128,
  "totalProducts": 256,
  "totalRevenue": 45320.50
}
```

---

#### 2. Get All Users

```http
GET /api/admin/users
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "active": true
    }
  ]
}
```

---

#### 3. Toggle User Status

```http
PUT /api/admin/users/:id/toggle
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{ "message": "Status changed" }
```

---

#### 4. Get Low Stock Products

```http
GET /api/admin/low-stock
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "lowStock": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Laptop",
      "stock": 3,
      "category": "Electronics"
    }
  ]
}
```

---

#### 5. Get All Orders

```http
GET /api/admin/orders
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "orders": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "user": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "items": [...],
      "totalAmount": 999.99,
      "status": "pending",
      "paymentStatus": "not paid"
    }
  ]
}
```

---

#### 6. Update Order Status

```http
PUT /api/admin/orders/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "shipped",
  "paymentStatus": "paid"
}
```

**Response (200 OK):**
```json
{
  "message": "Order updated",
  "order": { ... }
}
```

---

#### 7. Get Monthly Revenue

```http
GET /api/admin/revenue
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "revenue": [
    {
      "_id": {
        "month": 1,
        "year": 2024
      },
      "total": 15420.50
    },
    {
      "_id": {
        "month": 2,
        "year": 2024
      },
      "total": 22350.75
    }
  ]
}
```

---

#### 8. Get Top Selling Products

```http
GET /api/admin/top-products
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "topProducts": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "totalSold": 125,
      "productDetails": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Laptop",
        "price": 999.99
      }
    }
  ]
}
```

---

#### 9. Get Category Statistics

```http
GET /api/admin/categories
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "categoryStats": [
    {
      "_id": "Electronics",
      "count": 45
    },
    {
      "_id": "Clothing",
      "count": 120
    }
  ]
}
```

---

#### 10. Get Admin Stats

```http
GET /api/admin/stats
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "products": 256,
  "users": 42,
  "orders": 128,
  "pendingOrders": 15
}
```

---

## Middleware

### 1. Authentication Middleware (`protect`)

**File:** `Backend/src/middleware/auth.js`

```javascript
export const protect = (req, res, next) => {
  // Extracts JWT from Authorization header (Bearer <token>)
  // Verifies token signature and expiration
  // Sets req.user with decoded token payload
  // Passes to next middleware or throws 401 error
};
```

**Usage:**
```javascript
router.get("/profile", protect, getProfile);
```

---

### 2. Admin Middleware (`admin`)

**File:** `Backend/src/middleware/auth.js`

```javascript
export const admin = (req, res, next) => {
  // Checks if req.user.role === "admin"
  // Throws 403 Forbidden if not admin
};
```

**Usage:**
```javascript
router.post("/products", protect, admin, addProduct);
```

---

### 3. File Upload Middleware

**File:** `Backend/src/middleware/upload.js`

```javascript
const upload = multer({
  destination: "uploads/",
  filename: `${Date.now()}.${ext}`
});
```

**Usage:**
```javascript
router.post("/products", upload.single("image"), addProduct);
```

**Features:**
- Stores files in `uploads/` directory
- Generates unique filenames using timestamp
- Preserves original file extension

---

## Error Handling

The API returns standardized error responses:

### 400 Bad Request
```json
{ "message": "All fields required" }
{ "message": "Quantity must be at least 1" }
```

### 401 Unauthorized
```json
{ "message": "Not authorized, no token" }
{ "message": "Invalid token" }
```

### 403 Forbidden
```json
{ "message": "Admin access only" }
{ "message": "Unauthorized" }
```

### 404 Not Found
```json
{ "message": "Product not found" }
{ "message": "Order not found" }
```

### 500 Internal Server Error
```json
{ "message": "<error_details>" }
```

---

## Advanced Features

### 1. Email Notifications

**Files:**
- `Backend/src/utils/email.js` - Email sending logic
- `Backend/src/utils/invoiceTemplate.js` - HTML invoice template
- `Backend/src/utils/SendEmail.js` - Email service provider

**Trigger:** Automatically sent when order is placed

**Content:** Invoice with order details, items, and total amount

---

### 2. Invoice Generation

**Process:**
1. Order created with all items and pricing
2. HTML invoice generated from template
3. Invoice emailed to user
4. Optionally saved to `invoices/` directory

**Template includes:**
- Order ID
- Customer details
- Itemized list
- Total amount
- Order status

---

### 3. Stock Management

**Features:**
- Stock decremented on order creation
- Low-stock alerts (products with ≤ 5 units)
- Admin endpoint to monitor low-stock items
- Prevents overselling (validates stock before order)

---

### 4. Role-Based Access Control

**User Roles:**
- **user** (default): Can view products, manage own cart/orders, view own profile
- **admin**: Full access to products, orders, users, analytics

**Admin-Only Features:**
- Product CRUD operations
- User management (deactivate accounts)
- Order status updates
- Dashboard analytics
- Revenue reports
- Category statistics

---

### 5. Analytics Dashboard

**Admin can view:**
- Total users, products, orders
- Total revenue (paid orders only)
- Monthly revenue trends
- Top 5 selling products
- Category breakdown
- Pending orders count

---

## Setup Instructions

### 1. Install Dependencies

```bash
cd Backend
npm install
```

### 2. Configure Environment

Create `.env` file with required variables (see [Environment Setup](#environment-setup))

### 3. Connect to MongoDB

Ensure MongoDB is running:
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env
```

### 4. Start Server

```bash
npm start
```

Server runs on `http://localhost:5000`

---

## Testing the API

### Using cURL

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123"}'
```

**Get Products:**
```bash
curl http://localhost:5000/api/products
```

**Add to Cart (requires token):**
```bash
curl -X POST http://localhost:5000/api/cart/add \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"productId":"<product_id>","quantity":1}'
```

### Using Postman

1. Import the API endpoints into Postman
2. Set `{{token}}` variable in pre-request script
3. Use environment variables for `base_url` and `token`

---

## Security Considerations

✅ **Implemented:**
- Password hashing with bcryptjs
- JWT authentication
- Role-based access control
- CORS configuration
- Protected admin routes

⚠️ **Recommendations:**
- Use HTTPS in production
- Add rate limiting
- Implement request validation schemas
- Add input sanitization
- Monitor and log suspicious activities
- Use environment variables for secrets
- Implement refresh token rotation

---

## Troubleshooting

### "Not authorized, no token"
- Ensure `Authorization: Bearer <token>` header is included
- Verify token is valid and not expired

### "Admin access only"
- Confirm user role is "admin" in database
- Check JWT token contains correct role

### "Product not found"
- Verify product ID is correct ObjectId format
- Check product exists in MongoDB

### "Cart not found"
- Cart is created on first add-to-cart action
- Ensure user is authenticated

### CORS errors
- Check `CLIENT_ORIGIN` in `.env`
- Verify frontend URL matches CORS configuration

---

## Future Enhancements

- Payment gateway integration (Razorpay, Stripe)
- Product reviews and ratings
- Wishlist functionality
- Coupon and discount system
- Advanced search filters
- Product recommendations
- Notification preferences
- Two-factor authentication
- Order tracking with real-time updates

---

## Support

For issues or questions, refer to the code comments or contact the development team.
