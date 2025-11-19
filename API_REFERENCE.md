# E-Commerce Backend API Reference

Complete reference guide for all API endpoints with request/response examples, error codes, and use cases.

---

## Quick Reference Table

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/auth/register` | ❌ | - | Register new user |
| POST | `/api/auth/login` | ❌ | - | Login user |
| GET | `/api/auth/all` | ✅ | Admin | Get all users |
| POST | `/api/products` | ✅ | Admin | Create product |
| GET | `/api/products` | ❌ | - | Get all products (paginated) |
| GET | `/api/products/:id` | ❌ | - | Get product details |
| PUT | `/api/products/:id` | ✅ | Admin | Update product |
| DELETE | `/api/products/:id` | ✅ | Admin | Delete product |
| GET | `/api/cart` | ✅ | User | Get user's cart |
| POST | `/api/cart/add` | ✅ | User | Add item to cart |
| PUT | `/api/cart/update` | ✅ | User | Update cart item quantity |
| DELETE | `/api/cart/item/:productId` | ✅ | User | Remove item from cart |
| DELETE | `/api/cart/clear` | ✅ | User | Clear entire cart |
| POST | `/api/orders` | ✅ | User | Place order (checkout) |
| GET | `/api/orders` | ✅ | User | Get user's orders |
| GET | `/api/orders/:id` | ✅ | User | Get order details |
| GET | `/api/admin/summary` | ✅ | Admin | Dashboard summary |
| GET | `/api/admin/users` | ✅ | Admin | Get all users |
| PUT | `/api/admin/users/:id/toggle` | ✅ | Admin | Toggle user status |
| GET | `/api/admin/low-stock` | ✅ | Admin | Get low stock products |
| GET | `/api/admin/orders` | ✅ | Admin | Get all orders |
| PUT | `/api/admin/orders/:id` | ✅ | Admin | Update order status |
| GET | `/api/admin/revenue` | ✅ | Admin | Get monthly revenue |
| GET | `/api/admin/top-products` | ✅ | Admin | Get top 5 products |
| GET | `/api/admin/categories` | ✅ | Admin | Get category statistics |
| GET | `/api/admin/stats` | ✅ | Admin | Get admin stats |

---

## Authentication Endpoints

### POST /api/auth/register

Register a new user account.

**Request:**
```http
POST /api/auth/register HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Request Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| name | string | ✅ | 1-255 characters |
| email | string | ✅ | Valid email, must be unique |
| password | string | ✅ | Minimum 6 characters recommended |

**Response (201 Created):**
```json
{
  "message": "User Registered Successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZjc2ZjI5ZjE5NTkxMTIzYTRlYmJjZCIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjI2OTAwNDAwLCJleHAiOjE2Mjc1MDU0MDB9.x7kZ...",
  "user": {
    "_id": "60f76f29f19591123a4ebbcd",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 400 | BAD_REQUEST | All fields required |
| 400 | DUPLICATE_EMAIL | Email already exists |
| 500 | SERVER_ERROR | Internal server error |

**Error Example (400):**
```json
{
  "message": "Email already exists"
}
```

**Notes:**
- Password is automatically hashed with bcryptjs
- Token is valid for 7 days
- User role defaults to "user"

---

### POST /api/auth/login

Authenticate user and receive JWT token.

**Request:**
```http
POST /api/auth/login HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Request Fields:**
| Field | Type | Required |
|-------|------|----------|
| email | string | ✅ |
| password | string | ✅ |

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60f76f29f19591123a4ebbcd",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| 400 | Invalid credentials |
| 500 | Internal server error |

---

### GET /api/auth/all

Get list of all users (Admin only).

**Request:**
```http
GET /api/auth/all HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "users": [
    {
      "_id": "60f76f29f19591123a4ebbcd",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "active": true
    },
    {
      "_id": "60f76f29f19591123a4ebbce",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "active": true
    }
  ]
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| 401 | Not authorized, no token |
| 403 | Admin access only |
| 500 | Internal server error |

---

## Product Endpoints

### POST /api/products

Create a new product (Admin only).

**Request:**
```http
POST /api/products HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data; boundary=----Boundary

------Boundary
Content-Disposition: form-data; name="name"

Gaming Laptop
------Boundary
Content-Disposition: form-data; name="price"

1299.99
------Boundary
Content-Disposition: form-data; name="category"

Electronics
------Boundary
Content-Disposition: form-data; name="stock"

25
------Boundary
Content-Disposition: form-data; name="description"

High-performance gaming laptop with RTX graphics
------Boundary
Content-Disposition: form-data; name="image"; filename="laptop.jpg"

[binary image data]
------Boundary--
```

**Request Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | ✅ | Product name |
| price | number | ✅ | Price in dollars |
| category | string | ✅ | Category (e.g., Electronics, Clothing) |
| stock | number | ✅ | Initial inventory quantity |
| description | string | ❌ | Product description |
| image | file | ❌ | Product image (JPG, PNG) |

**Response (201 Created):**
```json
{
  "message": "Product added",
  "product": {
    "_id": "60f76f29f19591123a4ebbda",
    "name": "Gaming Laptop",
    "price": 1299.99,
    "category": "Electronics",
    "stock": 25,
    "description": "High-performance gaming laptop with RTX graphics",
    "image": "/uploads/1700451234567.jpg",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| 400 | Missing required fields |
| 401 | Not authorized, no token |
| 403 | Admin access only |
| 500 | Internal server error |

**Image Upload Notes:**
- Supports: JPG, PNG, GIF
- Max file size: ~5MB (depends on multer config)
- Stored in `/uploads/` directory
- Filename: `{timestamp}.{extension}`

---

### GET /api/products

Get all products with filtering, searching, and pagination.

**Request:**
```http
GET /api/products?category=Electronics&search=laptop&sort=-price&page=1&limit=10 HTTP/1.1
Host: localhost:5000
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| category | string | - | Filter by category name |
| search | string | - | Search product name (case-insensitive) |
| sort | string | - | Sort field (prefix with `-` for descending) |
| page | integer | 1 | Page number (pagination) |
| limit | integer | 10 | Items per page |

**Response (200 OK):**
```json
{
  "total": 45,
  "page": 1,
  "pages": 5,
  "products": [
    {
      "_id": "60f76f29f19591123a4ebbda",
      "name": "Gaming Laptop",
      "price": 1299.99,
      "category": "Electronics",
      "stock": 25,
      "image": "/uploads/1700451234567.jpg",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Query Examples:**

```
GET /api/products
// Returns all products, page 1

GET /api/products?category=Electronics
// Filter by Electronics category

GET /api/products?search=laptop
// Search for "laptop" (case-insensitive)

GET /api/products?sort=-price
// Sort by price descending

GET /api/products?sort=createdAt
// Sort by creation date ascending

GET /api/products?page=2&limit=20
// Page 2 with 20 items per page

GET /api/products?category=Electronics&search=gaming&sort=-price&page=1&limit=10
// Combined filters
```

**Error Responses:**

| Status | Message |
|--------|---------|
| 500 | Internal server error |

---

### GET /api/products/:id

Get single product details.

**Request:**
```http
GET /api/products/60f76f29f19591123a4ebbda HTTP/1.1
Host: localhost:5000
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Product ObjectId |

**Response (200 OK):**
```json
{
  "product": {
    "_id": "60f76f29f19591123a4ebbda",
    "name": "Gaming Laptop",
    "price": 1299.99,
    "category": "Electronics",
    "stock": 25,
    "description": "High-performance gaming laptop with RTX graphics",
    "image": "/uploads/1700451234567.jpg",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| 404 | Product not found |
| 500 | Internal server error |

---

### PUT /api/products/:id

Update product details (Admin only).

**Request:**
```http
PUT /api/products/60f76f29f19591123a4ebbda HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

{
  "name": "High-End Gaming Laptop",
  "price": 1499.99,
  "stock": 20,
  "image": [file]
}
```

**Request Fields:** (all optional)
| Field | Type | Notes |
|-------|------|-------|
| name | string | Update product name |
| price | number | Update price |
| category | string | Update category |
| stock | number | Update inventory |
| description | string | Update description |
| image | file | Update product image |

**Response (200 OK):**
```json
{
  "message": "Product updated",
  "updatedProduct": {
    "_id": "60f76f29f19591123a4ebbda",
    "name": "High-End Gaming Laptop",
    "price": 1499.99,
    "category": "Electronics",
    "stock": 20,
    "description": "High-performance gaming laptop with RTX graphics",
    "image": "/uploads/1700451234999.jpg"
  }
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| 401 | Not authorized, no token |
| 403 | Admin access only |
| 500 | Internal server error |

---

### DELETE /api/products/:id

Delete a product (Admin only).

**Request:**
```http
DELETE /api/products/60f76f29f19591123a4ebbda HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "message": "Product deleted"
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| 401 | Not authorized, no token |
| 403 | Admin access only |
| 500 | Internal server error |

---

## Cart Endpoints

### GET /api/cart

Get logged-in user's cart.

**Request:**
```http
GET /api/cart HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "cart": {
    "_id": "60f76f29f19591123a4ebbce",
    "user": "60f76f29f19591123a4ebbcd",
    "items": [
      {
        "product": {
          "_id": "60f76f29f19591123a4ebbda",
          "name": "Gaming Laptop",
          "price": 1299.99,
          "image": "/uploads/1700451234567.jpg",
          "stock": 25
        },
        "quantity": 2
      },
      {
        "product": {
          "_id": "60f76f29f19591123a4ebbdb",
          "name": "Wireless Mouse",
          "price": 29.99,
          "image": "/uploads/1700451234568.jpg",
          "stock": 100
        },
        "quantity": 1
      }
    ]
  },
  "totalItems": 3
}
```

**Empty Cart Response:**
```json
{
  "items": [],
  "totalItems": 0
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| 401 | Not authorized, no token |
| 500 | Internal server error |

---

### POST /api/cart/add

Add item to cart or increase quantity if already in cart.

**Request:**
```http
POST /api/cart/add HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "productId": "60f76f29f19591123a4ebbda",
  "quantity": 2
}
```

**Request Fields:**
| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|-----------|
| productId | string | ✅ | - | Valid MongoDB ObjectId |
| quantity | integer | ❌ | 1 | Must be >= 1 |

**Response (200 OK):**
```json
{
  "message": "Product added to cart",
  "cart": {
    "_id": "60f76f29f19591123a4ebbce",
    "user": "60f76f29f19591123a4ebbcd",
    "items": [
      {
        "product": {
          "_id": "60f76f29f19591123a4ebbda",
          "name": "Gaming Laptop",
          "price": 1299.99,
          "image": "/uploads/1700451234567.jpg",
          "stock": 25
        },
        "quantity": 2
      }
    ]
  }
}
```

**Logic:**
- If product not in cart: add new item with quantity
- If product already in cart: increment quantity by requested amount
- If cart doesn't exist: create new cart for user

**Error Responses:**

| Status | Message |
|--------|---------|
| 404 | Product not found |
| 401 | Not authorized, no token |
| 500 | Internal server error |

---

### PUT /api/cart/update

Update quantity of item in cart.

**Request:**
```http
PUT /api/cart/update HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "productId": "60f76f29f19591123a4ebbda",
  "quantity": 3
}
```

**Request Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| productId | string | ✅ | Valid MongoDB ObjectId |
| quantity | integer | ✅ | Must be >= 1 |

**Response (200 OK):**
```json
{
  "message": "Cart updated",
  "cart": { ... }
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| 400 | Quantity must be at least 1 |
| 404 | Cart not found / Product not in cart |
| 401 | Not authorized, no token |
| 500 | Internal server error |

---

### DELETE /api/cart/item/:productId

Remove single item from cart.

**Request:**
```http
DELETE /api/cart/item/60f76f29f19591123a4ebbda HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| productId | string | Product ObjectId to remove |

**Response (200 OK):**
```json
{
  "message": "Item removed from cart",
  "cart": { ... }
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| 404 | Cart not found / Product not in cart |
| 401 | Not authorized, no token |
| 500 | Internal server error |

---

### DELETE /api/cart/clear

Clear entire cart (remove all items).

**Request:**
```http
DELETE /api/cart/clear HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "message": "Cart cleared",
  "cart": {
    "_id": "60f76f29f19591123a4ebbce",
    "user": "60f76f29f19591123a4ebbcd",
    "items": []
  }
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| 404 | Cart not found |
| 401 | Not authorized, no token |
| 500 | Internal server error |

---

## Order Endpoints

### POST /api/orders

Place order and checkout (cart to order conversion).

**Request:**
```http
POST /api/orders HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "address": "123 Main Street, New York, NY 10001",
  "paymentMethod": "COD"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| address | string | ✅ | Delivery address |
| paymentMethod | string | ❌ | Default: "COD" (Cash on Delivery) |

**Process Flow:**
1. Validate cart not empty
2. Check stock for all items
3. Decrement product stock
4. Create order with cart items
5. Clear user's cart
6. Send invoice email to user

**Response (201 Created):**
```json
{
  "message": "Order placed successfully",
  "order": {
    "_id": "60f76f29f19591123a4ebbd0",
    "user": "60f76f29f19591123a4ebbcd",
    "items": [
      {
        "product": "60f76f29f19591123a4ebbda",
        "quantity": 2,
        "price": 1299.99
      },
      {
        "product": "60f76f29f19591123a4ebbdb",
        "quantity": 1,
        "price": 29.99
      }
    ],
    "totalAmount": 2629.97,
    "address": "123 Main Street, New York, NY 10001",
    "status": "pending",
    "paymentMethod": "COD",
    "paymentStatus": "not paid",
    "createdAt": "2024-01-15T14:30:00Z",
    "updatedAt": "2024-01-15T14:30:00Z"
  }
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| 400 | Delivery address is required |
| 400 | Your cart is empty |
| 400 | Insufficient stock for {ProductName} |
| 401 | Not authorized, no token |
| 500 | Internal server error |

**Email Notification:**
- Invoice email automatically sent to user
- Subject: `Your Order Invoice #{lastSixDigitsOfOrderId}`
- Includes itemized list, total, and order details

---

### GET /api/orders

Get all orders for logged-in user.

**Request:**
```http
GET /api/orders HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "orders": [
    {
      "_id": "60f76f29f19591123a4ebbd0",
      "user": "60f76f29f19591123a4ebbcd",
      "items": [
        {
          "product": "60f76f29f19591123a4ebbda",
          "quantity": 2,
          "price": 1299.99
        }
      ],
      "totalAmount": 2629.97,
      "address": "123 Main Street, New York, NY 10001",
      "status": "pending",
      "paymentStatus": "not paid",
      "createdAt": "2024-01-15T14:30:00Z"
    }
  ]
}
```

**Features:**
- Returns user's orders sorted by creation date (newest first)
- Empty array if user has no orders

**Error Responses:**

| Status | Message |
|--------|---------|
| 401 | Not authorized, no token |
| 500 | Internal server error |

---

### GET /api/orders/:id

Get single order details (user can only view own orders, admin can view all).

**Request:**
```http
GET /api/orders/60f76f29f19591123a4ebbd0 HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "order": {
    "_id": "60f76f29f19591123a4ebbd0",
    "user": "60f76f29f19591123a4ebbcd",
    "items": [
      {
        "product": {
          "_id": "60f76f29f19591123a4ebbda",
          "name": "Gaming Laptop",
          "price": 1299.99,
          "image": "/uploads/1700451234567.jpg"
        },
        "quantity": 2,
        "price": 1299.99
      }
    ],
    "totalAmount": 2629.97,
    "address": "123 Main Street, New York, NY 10001",
    "status": "pending",
    "paymentStatus": "not paid",
    "createdAt": "2024-01-15T14:30:00Z"
  }
}
```

**Access Control:**
- User can view only their own orders
- Admin can view any order
- Returns 403 Forbidden for unauthorized access

**Error Responses:**

| Status | Message |
|--------|---------|
| 403 | Unauthorized |
| 404 | Order not found |
| 401 | Not authorized, no token |
| 500 | Internal server error |

---

## Admin Endpoints

### GET /api/admin/summary

Get dashboard summary (total users, products, orders, revenue).

**Request:**
```http
GET /api/admin/summary HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "totalUsers": 156,
  "totalOrders": 523,
  "totalProducts": 248,
  "totalRevenue": 125430.50
}
```

**Notes:**
- Revenue includes only "paid" orders
- Used for main dashboard widget

**Error Responses:**

| Status | Message |
|--------|---------|
| 401 | Not authorized, no token |
| 403 | Admin access only |
| 500 | Internal server error |

---

### GET /api/admin/users

Get list of all users in system.

**Request:**
```http
GET /api/admin/users HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "users": [
    {
      "_id": "60f76f29f19591123a4ebbcd",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "active": true,
      "createdAt": "2024-01-10T09:00:00Z"
    },
    {
      "_id": "60f76f29f19591123a4ebbce",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "admin",
      "active": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| 401 | Not authorized, no token |
| 403 | Admin access only |
| 500 | Internal server error |

---

### PUT /api/admin/users/:id/toggle

Toggle user active status (enable/disable account).

**Request:**
```http
PUT /api/admin/users/60f76f29f19591123a4ebbcd/toggle HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "message": "Status changed"
}
```

**Effect:**
- If `active: true` → becomes `false`
- If `active: false` → becomes `true`

**Error Responses:**

| Status | Message |
|--------|---------|
| 401 | Not authorized, no token |
| 403 | Admin access only |
| 500 | Internal server error |

---

### GET /api/admin/low-stock

Get products with low inventory (≤5 units).

**Request:**
```http
GET /api/admin/low-stock HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "lowStock": [
    {
      "_id": "60f76f29f19591123a4ebbda",
      "name": "Gaming Laptop",
      "stock": 3,
      "category": "Electronics"
    },
    {
      "_id": "60f76f29f19591123a4ebbdb",
      "name": "Wireless Mouse",
      "stock": 2,
      "category": "Electronics"
    }
  ]
}
```

**Use Case:**
- Alert admin about products needing restock
- Threshold: <= 5 units

**Error Responses:**

| Status | Message |
|--------|---------|
| 401 | Not authorized, no token |
| 403 | Admin access only |
| 500 | Internal server error |

---

### GET /api/admin/orders

Get all orders in system (admin only).

**Request:**
```http
GET /api/admin/orders HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "orders": [
    {
      "_id": "60f76f29f19591123a4ebbd0",
      "user": {
        "_id": "60f76f29f19591123a4ebbcd",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "items": [
        {
          "product": "60f76f29f19591123a4ebbda",
          "quantity": 2,
          "price": 1299.99
        }
      ],
      "totalAmount": 2629.97,
      "status": "pending",
      "paymentStatus": "not paid",
      "createdAt": "2024-01-15T14:30:00Z"
    }
  ]
}
```

**Features:**
- Sorted by creation date (newest first)
- Includes user information
- All orders regardless of status

**Error Responses:**

| Status | Message |
|--------|---------|
| 401 | Not authorized, no token |
| 403 | Admin access only |
| 500 | Internal server error |

---

### PUT /api/admin/orders/:id

Update order status and payment status.

**Request:**
```http
PUT /api/admin/orders/60f76f29f19591123a4ebbd0 HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "shipped",
  "paymentStatus": "paid"
}
```

**Request Fields:**
| Field | Type | Required | Allowed Values |
|-------|------|----------|----------------|
| status | string | ❌ | pending, processing, shipped, delivered, cancelled |
| paymentStatus | string | ❌ | not paid, paid |

**Response (200 OK):**
```json
{
  "message": "Order updated",
  "order": {
    "_id": "60f76f29f19591123a4ebbd0",
    "status": "shipped",
    "paymentStatus": "paid",
    ...
  }
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| 404 | Order not found |
| 401 | Not authorized, no token |
| 403 | Admin access only |
| 500 | Internal server error |

---

### GET /api/admin/revenue

Get monthly revenue breakdown.

**Request:**
```http
GET /api/admin/revenue HTTP/1.1
Host: localhost:5000
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
    },
    {
      "_id": {
        "month": 3,
        "year": 2024
      },
      "total": 18900.25
    }
  ]
}
```

**Features:**
- Only includes "paid" orders
- Sorted by year and month ascending
- Shows complete revenue history

**Error Responses:**

| Status | Message |
|--------|---------|
| 401 | Not authorized, no token |
| 403 | Admin access only |
| 500 | Internal server error |

---

### GET /api/admin/top-products

Get top 5 best-selling products.

**Request:**
```http
GET /api/admin/top-products HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "topProducts": [
    {
      "_id": "60f76f29f19591123a4ebbda",
      "totalSold": 245,
      "productDetails": {
        "_id": "60f76f29f19591123a4ebbda",
        "name": "Gaming Laptop",
        "price": 1299.99
      }
    },
    {
      "_id": "60f76f29f19591123a4ebbdb",
      "totalSold": 189,
      "productDetails": {
        "_id": "60f76f29f19591123a4ebbdb",
        "name": "Wireless Mouse",
        "price": 29.99
      }
    }
  ]
}
```

**Features:**
- Limited to top 5 products
- Sorted by total quantity sold (descending)
- Includes product details

**Error Responses:**

| Status | Message |
|--------|---------|
| 401 | Not authorized, no token |
| 403 | Admin access only |
| 500 | Internal server error |

---

### GET /api/admin/categories

Get category statistics and product count.

**Request:**
```http
GET /api/admin/categories HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "categoryStats": [
    {
      "_id": "Electronics",
      "count": 87
    },
    {
      "_id": "Clothing",
      "count": 134
    },
    {
      "_id": "Books",
      "count": 45
    },
    {
      "_id": "Home & Garden",
      "count": 62
    }
  ]
}
```

**Features:**
- Sorted by count descending
- Shows all categories
- Useful for inventory overview

**Error Responses:**

| Status | Message |
|--------|---------|
| 401 | Not authorized, no token |
| 403 | Admin access only |
| 500 | Internal server error |

---

### GET /api/admin/stats

Get admin statistics (products, users, orders, pending).

**Request:**
```http
GET /api/admin/stats HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "products": 248,
  "users": 156,
  "orders": 523,
  "pendingOrders": 47
}
```

**Notes:**
- `pendingOrders`: Count of orders with status = "pending"
- Used for dashboard quick stats

**Error Responses:**

| Status | Message |
|--------|---------|
| 401 | Not authorized, no token |
| 403 | Admin access only |
| 500 | Internal server error |

---

## HTTP Status Codes Reference

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - User lacks required permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error - Server-side error |

---

## Common Error Scenarios

### Missing Authorization Header
```http
GET /api/cart HTTP/1.1
Host: localhost:5000
```
**Response (401):**
```json
{ "message": "Not authorized, no token" }
```

**Fix:** Include `Authorization: Bearer <token>` header

---

### Invalid Token Format
```http
GET /api/cart HTTP/1.1
Host: localhost:5000
Authorization: <token>
```
**Response (401):**
```json
{ "message": "Invalid token format" }
```

**Fix:** Use format `Authorization: Bearer <token>` (note: "Bearer" prefix)

---

### Admin Access Required
```http
POST /api/products HTTP/1.1
Host: localhost:5000
Authorization: Bearer <regular_user_token>
```
**Response (403):**
```json
{ "message": "Admin access only" }
```

**Fix:** Use admin account token

---

### Insufficient Stock
```json
{
  "productId": "60f76f29f19591123a4ebbda",
  "quantity": 100
}
```
**Response (400):**
```json
{ "message": "Insufficient stock for Gaming Laptop" }
```

**Fix:** Reduce quantity or check available stock

---

## Integration Examples

### JavaScript/Axios

```javascript
const API_BASE = 'http://localhost:5000/api';

// Login
const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
  email: 'user@example.com',
  password: 'password123'
});
const token = loginResponse.data.token;

// Add to cart
await axios.post(`${API_BASE}/cart/add`, 
  {
    productId: 'product_id',
    quantity: 1
  },
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

// Place order
await axios.post(`${API_BASE}/orders`,
  {
    address: '123 Main St',
    paymentMethod: 'COD'
  },
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
```

---

## Rate Limiting & Best Practices

⚠️ **Current Status:** No rate limiting implemented. Recommendations:
- Implement express-rate-limit middleware
- Limit requests per IP/user
- Add request validation schemas
- Implement JWT refresh token rotation

---

## Webhook Events (Future)

Planned webhook events for order updates:
- `order.created`
- `order.shipped`
- `order.delivered`
- `payment.received`

---

## Contact & Support

For API issues, check:
1. Network logs (browser DevTools)
2. Server console (Backend terminal)
3. MongoDB connection status
4. JWT token validity (use jwt.io to decode)
