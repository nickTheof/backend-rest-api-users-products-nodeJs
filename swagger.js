const m2s = require("mongoose-to-swagger");
const User = require("./models/user.model");
const Product = require("./models/product.model");
const { format } = require("morgan");

exports.options = {
  openapi: "3.1.0",
  info: {
    version: "1.0.0",
    title: "Users and Products CRUD API",
    description:
      "An application for creating users, products and choosing products for user",
    contact: {
      name: "API Support",
      url: "https://aueb.gr",
      email: "support@example.com",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local Server",
    },
  ],
  components: {
    schemas: {
      User: m2s(User),
      Product: m2s(Product),
    },
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    tags: [
      {
        name: "Users",
        description: "Endpoints for User",
      },
      {
        name: "Products",
        description: "Endpoints for Products",
      },
      {
        name: "Users and Products",
        description: "Endpoints for Users and Products",
      },
      {
        name: "Auth",
        description: "Endpoints for Authentication",
      },
    ],
  },
  paths: {
    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login local user",
        description: "Login user",
        security: [],
        requestBody: {
          description:
            "User sends email and password, receives JWT token in response",
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "test@mail.com" },
                  password: { type: "string", example: "12345" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Token returned",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      type: "string",
                      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Authorization failed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "fail",
                    },
                    data: {
                      type: "string",
                      example: "User not logged in",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Local registration of a user",
        description: "Register a local user",
        security: [],
        requestBody: {
          description:
            "User sends email, password, confirmation password and receives JWT token in response",
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "confirmPassword"],
                properties: {
                  email: { type: "string", example: "test@mail.com" },
                  password: { type: "string", example: "12345" },
                  confirmPassword: { type: "string", example: "12345" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Successful local registration of a user",
          },
          400: {
            description: "Authorization failed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "error",
                    },
                    data: {
                      type: "string",
                      example: "User already exists",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/google/callback": {
      get: {
        tags: ["Auth"],
        summary: "Google OAuth2 Login Callback",
        description:
          "Handles Google OAuth2 login by processing the authorization code and returning user info.",
        security: [],
        parameters: [
          {
            name: "code",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Google OAuth2 authorization code",
          },
        ],
        responses: {
          200: {
            description: "Succseful google Login. Token returned",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      type: "string",
                      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Authentication failed",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Problem in Google Login",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/users": {
      get: {
        tags: ["Users"],
        summary: "Get all user in a list",
        description:
          "Returns a list of all users. Require an authenticated user with admin role",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of all users",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/User",
                  },
                },
              },
            },
          },
          401: {
            description: "Access restriction to not authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Access denied. No token provided",
                },
              },
            },
          },
          403: {
            description: "Access restriction to not admin authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Forbidden: insufficient permissions",
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Users"],
        summary: "Create a new user. Admin action",
        description:
          "Returns a new created User by an admin. Require an authenticated user with admin role",
        security: [{ bearerAuth: [] }],
        requestBody: {
          description: "JSON with user data",
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  firstname: { type: "string" },
                  lastname: { type: "string" },
                  email: { type: "string" },
                  password: { type: "string" },
                  address: {
                    type: "object",
                    properties: {
                      area: { type: "string" },
                      road: { type: "string" },
                    },
                  },
                  phone: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string" },
                        number: { type: "string" },
                      },
                    },
                  },
                  googleId: {
                    type: "string",
                  },
                  avatar: {
                    type: "string",
                  },
                  authProvider: {
                    type: "string",
                    enum: ["local", "google"],
                    default: "local",
                  },
                  roles: {
                    type: "array",
                    items: {
                      type: "string",
                      enum: ["READER", "ADMIN", "EDITOR"],
                      default: "READER",
                    },
                  },
                  isActive: {
                    type: "boolean",
                    default: true,
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description:
              "JSON response of a succcessfully creation of a new user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid request body data",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Invalid input data",
                },
              },
            },
          },
          401: {
            description: "Access restriction to not authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Access denied. No token provided",
                },
              },
            },
          },
          403: {
            description: "Access restriction to not admin authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Forbidden: insufficient permissions",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user details by user id. Admin action",
        description: "Return user details for a specific user id",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID of the user to find",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "JSON response of a succcessfully fetch of a user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid user id",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "User with id 15151515 was not found",
                },
              },
            },
          },
          401: {
            description: "Access restriction to not authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Access denied. No token provided",
                },
              },
            },
          },
          403: {
            description: "Access restriction to not admin authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Forbidden: insufficient permissions",
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Update user by user id. Admin action",
        description: "Update user with a specific user id",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID of the user to update",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          description: "JSON with user data",
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["isActive"],
                properties: {
                  firstname: { type: "string" },
                  lastname: { type: "string" },
                  email: { type: "string" },
                  address: {
                    type: "object",
                    properties: {
                      area: { type: "string" },
                      road: { type: "string" },
                    },
                  },
                  phone: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string" },
                        number: { type: "string" },
                      },
                    },
                  },
                  googleId: {
                    type: "string",
                  },
                  avatar: {
                    type: "string",
                  },
                  authProvider: {
                    type: "string",
                    enum: ["local", "google"],
                    default: "local",
                  },
                  roles: {
                    type: "array",
                    items: {
                      type: "string",
                      enum: ["READER", "ADMIN", "EDITOR"],
                      default: "READER",
                    },
                  },
                  isActive: {
                    type: "boolean",
                    default: true,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "JSON response of a succcessfully updated user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid user id",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "User with id 15151515 was not found",
                },
              },
            },
          },
          401: {
            description: "Access restriction to not authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Access denied. No token provided",
                },
              },
            },
          },
          403: {
            description: "Access restriction to not admin authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Forbidden: insufficient permissions",
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete user by user id. Admin action",
        description: "Delete user with a specific user id",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID of the user to delete",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "JSON response of a succcessfully delete of a user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid user id",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "User with id 15151515 was not found",
                },
              },
            },
          },
          401: {
            description: "Access restriction to not authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Access denied. No token provided",
                },
              },
            },
          },
          403: {
            description: "Access restriction to not admin authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Forbidden: insufficient permissions",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/users/me": {
      get: {
        tags: ["Users"],
        summary: "Get current authenticated user details",
        description: "Get current authenticated user data",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "JSON response of a current authenticated user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Access restriction to not authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Access denied. No token provided",
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Update current authenticated user details",
        description: "Update current authenticated user details",
        security: [{ bearerAuth: [] }],
        requestBody: {
          description: "JSON with user data to update",
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["isActive"],
                properties: {
                  firstname: { type: "string" },
                  lastname: { type: "string" },
                  email: { type: "string" },
                  address: {
                    type: "object",
                    properties: {
                      area: { type: "string" },
                      road: { type: "string" },
                    },
                  },
                  phone: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string" },
                        number: { type: "string" },
                      },
                    },
                  },
                  avatar: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description:
              "JSON response for a successful update of the current authneticated user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Access restriction to not authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Access denied. No token provided",
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete current authenticated user",
        description:
          "Delete current authenticated user. Soft delete implementation. User set to be inactive",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description:
              "JSON response for a successful soft delete of the current authneticated user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Access restriction to not authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Access denied. No token provided",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/users/me/change-password": {
      patch: {
        tags: ["Users"],
        summary: "Change password of a local registered user who is logged in",
        description:
          "Route to change the password of a current authenticated user with local authProvider",
        security: [{ bearerAuth: [] }],
        requestBody: {
          description:
            "User sends currentPassword, newPassword and newPasswordConfirm",
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "currentPassword",
                  "newPassword",
                  "newPasswordConfirm",
                ],
                properties: {
                  currentPassword: { type: "string", example: "12345" },
                  newPassword: { type: "string", example: "123456" },
                  newPasswordConfirm: { type: "string", example: "123456" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description:
              "JSON response for a successful password of the current authenticated user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid request body data",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message:
                    "New password and new password confirm must be the same",
                },
              },
            },
          },
          401: {
            description: "Access restriction to not authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Access denied. No token provided",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/products": {
      get: {
        tags: ["Products"],
        summary: "Get all products in a list",
        description: "Return a list with the products",
        responses: {
          200: {
            description: "List of all products",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Product",
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Products"],
        summary: "Create a new Product. Admin and Editor Action",
        description:
          "Returns a new successfully created product. Require an authenticated user with admin or editor role",
        security: [{ bearerAuth: [] }],
        requestBody: {
          description: "JSON data with product data",
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["product", "cost", "category"],
                properties: {
                  product: { type: "string", example: "Product 1" },
                  description: {
                    type: "string",
                    example: "Product 1 description",
                  },
                  cost: { type: "number", example: 3.5 },
                  quantity: { type: "number", example: 2 },
                  category: {
                    type: "array",
                    items: {
                      type: "string",
                      enum: [
                        "electronics",
                        "clothing",
                        "home",
                        "beauty",
                        "toys",
                        "sports",
                        "books",
                        "food",
                      ],
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description:
              "JSON response of a succcessfully creation of a new product",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      $ref: "#/components/schemas/Product",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid request body data",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Invalid input data",
                },
              },
            },
          },
          401: {
            description: "Access restriction to not authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Access denied. No token provided",
                },
              },
            },
          },
          403: {
            description:
              "Access restriction to authenticated users with only READER role",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Forbidden: insufficient permissions",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get Product details by product id",
        description: "Return product details for a specific product id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID of the of the product to fetch",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "JSON response of a succcessfully fetch of a product",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      $ref: "#/components/schemas/Product",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid product id",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Invalid ID",
                },
              },
            },
          },
          404: {
            description: "Invalid ID. Product not found to update",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Product with id 15151515 was not found",
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Products"],
        summary:
          "Update product with a specific product id. Admin or Editor Action",
        description: "Update product with a specific product id",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID of the of the product to update",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          description: "JSON data with product data to update",
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["quantity"],
                properties: {
                  product: { type: "string", example: "Product 1" },
                  description: {
                    type: "string",
                    example: "Product 1 description",
                  },
                  cost: { type: "number", example: 3.5 },
                  quantity: { type: "number", example: 2 },
                  category: {
                    type: "array",
                    items: {
                      type: "string",
                      enum: [
                        "electronics",
                        "clothing",
                        "home",
                        "beauty",
                        "toys",
                        "sports",
                        "books",
                        "food",
                      ],
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "JSON response of a succcessfully update of a product",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      $ref: "#/components/schemas/Product",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid product id",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Invalid Id",
                },
              },
            },
          },
          401: {
            description: "Access restriction to not authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Access denied. No token provided",
                },
              },
            },
          },
          403: {
            description:
              "Access restriction to authenticated users with only READER role",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Forbidden: insufficient permissions",
                },
              },
            },
          },
          404: {
            description: "Invalid ID. Product not found to update",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Product with id 15151515 was not found",
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Products"],
        summary:
          "Delete product with a specific product id. Admin or Editor Action",
        description: "Delete product with a specific product id",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID of the of the product to delete",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "JSON response of a succcessfully fetch of a product",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      $ref: "#/components/schemas/Product",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid product id",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Invalid ID",
                },
              },
            },
          },
          401: {
            description: "Access restriction to not authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Access denied. No token provided",
                },
              },
            },
          },
          403: {
            description:
              "Access restriction to authenticated users with only READER role",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Forbidden: insufficient permissions",
                },
              },
            },
          },
          404: {
            description: "Invalid ID. Product not found to update",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Product with id 15151515 was not found",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/user-products/me": {
      get: {
        tags: ["Users and Products"],
        summary: "Get all products of a current authenticated user",
        description: "Returns a list of all products of a logged in user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description:
              "Get all products from a current authenticated user's product list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: {
                      type: "object",
                      properties: {
                        _id: { type: "string" },
                        products: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              _id: { type: "string" },
                              product: { type: "string" },
                              cost: { type: "number" },
                              quantity: { type: "number" },
                              date: { type: "date", format: "date-time" },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Access restriction to not authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Access denied. No token provided",
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Users and Products"],
        summary: "Insert a product in the current authenticated user",
        description:
          "Push a new product to the list of the products of the logged in user",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          description:
            "JSON Data with the products to insert in the user's product list",
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["products"],
                properties: {
                  products: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        product: { type: "string" },
                        quantity: { type: "number" },
                        cost: { type: "number" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Get the user with the updated products list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Access restriction to not authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Access denied. No token provided",
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Users and Products"],
        summary:
          "Update a Product quantity of a specific product id of the current authenticated user",
        description:
          "Change the quantity of a specific product of the logged in user",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          description:
            "JSON data with the product id and the quantity to update",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  productId: { type: "string" },
                  quantity: { type: "number" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Get the user with the updated products list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "Product id not found",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Product not found",
                },
              },
            },
          },
          401: {
            description: "Access restriction to not authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Access denied. No token provided",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/user-products/stats/user-purchasing-stats": {
      get: {
        tags: ["Users and Products"],
        summary:
          "Get the statistics of all products in the users list. Admin action",
        description:
          "Return specific statistics of all products in the users list",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Get all products from a specific user's product list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          _id: {
                            type: "object",
                            properties: {
                              email: { type: "string" },
                              product: { type: "string" },
                            },
                          },
                          total_amount: { type: "number" },
                          count: { type: "number" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Access restriction to not authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Access denied. No token provided",
                },
              },
            },
          },
          403: {
            description: "Access restriction to not admin authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Forbidden: insufficient permissions",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/user-products": {
      get: {
        tags: ["Users and Products"],
        summary: "Get all products of the users list. Admin or Editor Action",
        description: "Return a list of all products in the users collection",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Get all products from a specific user's product list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          _id: { type: "string" },
                          email: { type: "string" },
                          products: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                product: { type: "string" },
                                cost: { type: "number" },
                                quantity: { type: "number" },
                                date: { type: "date", format: "date-time" },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Access restriction to not authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Access denied. No token provided",
                },
              },
            },
          },
          403: {
            description: "Access restriction to not admin authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Forbidden: insufficient permissions",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/user-products/{userId}": {
      get: {
        tags: ["Users and Products"],
        summary:
          "Get all products of a specific user by user id. Admin or Editor action",
        description: "Returns a list with all products of a specific user.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "userId",
            in: "path",
            description: "The user id of the specific user",
            required: "true",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Get all products from a specific user's product list",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      product: { type: "string" },
                      cost: { type: "number" },
                      quantity: { type: "number" },
                      date: { type: "date", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "User id not found",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "User not found",
                },
              },
            },
          },
          400: {
            description: "Invalid id",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Invalid id",
                },
              },
            },
          },
          401: {
            description: "Access restriction to not authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Access denied. No token provided",
                },
              },
            },
          },
          403: {
            description: "Access restriction to not admin authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Forbidden: insufficient permissions",
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Users and Products"],
        summary: "Insert a product in a specific user by his id. Admin action",
        description:
          "Push products to the list of the products of a specific user",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "userId",
            in: "path",
            description: "The user id of the specific user",
            required: "true",
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          description:
            "JSON Data with the products to insert in the user's product list",
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["products"],
                properties: {
                  products: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        product: { type: "string" },
                        quantity: { type: "number" },
                        cost: { type: "number" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Get the user with the updated products list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "User id not found",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "User not found",
                },
              },
            },
          },
          400: {
            description: "Invalid id",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Invalid id",
                },
              },
            },
          },
          401: {
            description: "Access restriction to not authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Access denied. No token provided",
                },
              },
            },
          },
          403: {
            description: "Access restriction to not admin authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Forbidden: insufficient permissions",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/user-products/{userId}/products/{productId}": {
      patch: {
        tags: ["Users and Products"],
        summary:
          "Update the quantity of a specific product of a specific user. Admin action",
        description:
          "Change the quantity of a specific product of a specific user by product and user id",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "userId",
            in: "path",
            description: "The user id of the specific user",
            required: "true",
            schema: {
              type: "string",
            },
          },
          {
            name: "productId",
            in: "path",
            description:
              "The product id of the specific product in the user's product list",
            required: "true",
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  quantity: {
                    type: "number",
                    example: 5,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description:
              "Successful update of the quantity of a product from the user's product list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "Invalid user or product id",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "User or product not found",
                },
              },
            },
          },
          401: {
            description: "Access restriction to not authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Access denied. No token provided",
                },
              },
            },
          },
          403: {
            description: "Access restriction to not admin authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Forbidden: insufficient permissions",
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Users and Products"],
        summary: "Delete a specific product of a specific user. Admin action",
        description: "Remove a product from a user's product list",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "userId",
            in: "path",
            description: "The user id of the specific user",
            required: "true",
            schema: {
              type: "string",
            },
          },
          {
            name: "productId",
            in: "path",
            description:
              "The product id of the specific product in the user's product list",
            required: "true",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description:
              "Successful delete of a product from the user's product list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "Invalid user or product id",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "User or product not found",
                },
              },
            },
          },
          401: {
            description: "Access restriction to not authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Access denied. No token provided",
                },
              },
            },
          },
          403: {
            description: "Access restriction to not admin authenticated users",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  message: "Forbidden: insufficient permissions",
                },
              },
            },
          },
        },
      },
    },
  },
};
