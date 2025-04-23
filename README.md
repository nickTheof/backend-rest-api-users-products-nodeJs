# 🛒 Node.js RESTful API – User & Product Management

This project is a Node.js/Express-based REST API for managing users, products, and user-product relationships, with secure authentication, role-based access control, and MongoDB integration.

## 📌 Features

- 🔐 JWT-based Authentication
- 👤 User CRUD with email validation
- 🛍️ Product CRUD with duplicate prevention
- 📦 Users can purchase/manage their products
- 📊 Admin purchasing statistics aggregation
- 🛡️ Role-based access control (`ADMIN`, `EDITOR`, `READER`)
- 📄 Swagger documentation
- 🧪 Jest testing
- 📝 Clean architecture (MVC + Services)
- 📦 MongoDB with Mongoose
- 👻 Soft deletion support for users

---

## 🚀 Getting Started

### 🔧 Prerequisites

- Node.js >= 16
- MongoDB instance (local or Atlas)
- `npm` or `yarn`

### 🛠️ Installation

1. **Clone the Repository**

```bash
git clone git@github.com:nickTheof/backend-rest-api-users-products-nodeJs.git
cd backend-rest-api-users-products-nodeJs
npm install
```

2. **Set Up Environment Variables**
   Create a .env file in the root:

```env
PORT=3000
NODE_ENV=development
TESTING=falsy
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_MAX_REQUESTS=100
MONGODB_URI=your_mongo_db_production_uri
MONGODB_URI_TEST=your_mongo_db_testing_uri
JSONWEBTOKEN_SECRET=your_json_web_token_secrer
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
REDIRECT_URI=http://localhost:3000/api/v1/auth/google/callback
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4200,http://localhost:3000
```

3. **🧑‍💻 Development**

```bash
npm run dev
```

4. **🧪 Run Tests**

```bash
npm run test
```

5. **### 🏭 Production Environment**

```bash
npm run start
```

## About Project

1. **🔒 Authentication Flow**

- Local login: Register → Login → Receive JWT
- Google login: Frontend gets code → Calls /auth/google?code=... → Receives JWT
- JWT is required in Authorization: Bearer <token> for protected routes

2. ** 🔒 Roles & Permissions**

| Role   | Access                                    |
| ------ | ----------------------------------------- |
| ADMIN  | Full CRUD, manage users, products & stats |
| EDITOR | Limited access, Manage products           |
| READER | Limited access, Can manage own products   |

3. ** 🛣️ API Endpoints **

## 📡 API Endpoints

| Method | Endpoint                                            | Description                                     | Auth Required    |
| ------ | --------------------------------------------------- | ----------------------------------------------- | ---------------- |
| GET    | `/api/v1/health`                                    | Check the if the server is running              | ❌               |
| GET    | `/api/v1/api-docs`                                  | Swagger documentantion                          | ❌               |
| POST   | `/api/v1/auth/register`                             | Register a new local user                       | ❌               |
| POST   | `/api/v1/auth/login`                                | Log in with local credentials                   | ❌               |
| GET    | `/api/v1/auth/google/callback`                      | Google OAuth login (redirect URL)               | ❌               |
| GET    | `/api/v1/users`                                     | Get all users                                   | ✅ Admin         |
| POST   | `/api/v1/users`                                     | Create a new user                               | ✅ Admin         |
| GET    | `/api/v1/users/:id`                                 | Get details of specific user                    | ✅ Admin         |
| PATCH  | `/api/v1/users/:id`                                 | Update a user                                   | ✅ Admin         |
| DELETE | `/api/v1/users/:id`                                 | DELETE a user                                   | ✅ Admin         |
| GET    | `/api/v1/users/me`                                  | Get current authenticated user                  | ✅               |
| PATCH  | `/api/v1/users/me`                                  | Update current authenticated user               | ✅               |
| DELETE | `/api/v1/users/me`                                  | Soft-delete current authenticated user          | ✅               |
| PATCH  | `/api/v1/users/me/change-password`                  | Change current authenticated user password      | ✅               |
| GET    | `/api/v1/products`                                  | Retrieve all available products                 | ❌               |
| GET    | `/api/v1/products/:id`                              | Get details of specific product                 | ❌               |
| POST   | `/api/v1/products`                                  | Create a new product                            | ✅ Admin/Editor  |
| PATCH  | `/api/v1/products/:id`                              | Update a product by ID                          | ✅ Admin/Editor  |
| DELETE | `/api/v1/products/:id`                              | Delete a product by ID                          | ✅ Admin/Editor  |
| GET    | `/api/v1/user-products/me`                          | Get current user’s products                     | ✅               |
| POST   | `/api/v1/user-products/me`                          | Add products to current user                    | ✅               |
| PATCH  | `/api/v1/user-products/me`                          | Update product quantity for current user        | ✅               |
| GET    | `/api/v1/user-products/stats/user-purchasing-stats` | Get user purchasing statistics                  | ✅ Admin         |
| GET    | `/api/v1/user-products/`                            | Get all users' products                         | ✅ Admin, Editor |
| GET    | `/api/v1/user-products/:userId`                     | Get all products of a specific user             | ✅ Admin, Editor |
| POST   | `/api/v1/user-products/:userId`                     | Create products for a specific user             | ✅ Admin         |
| PATCH  | `/api/v1/user-products/:userId/products/:productId` | Update a specific product’s quantity by user ID | ✅ Admin         |
| DELETE | `/api/v1/user-products/:userId/products/:productId` | Delete a specific product from a user           | ✅ Admin         |
