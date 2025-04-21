const m2s = require("mongoose-to-swagger");
const User = require("./models/user.model");
const Product = require("./models/product.model");

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
  },
};
