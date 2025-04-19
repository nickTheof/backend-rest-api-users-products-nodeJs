const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const hpp = require("hpp");
const morgan = require("morgan");
const limiter = require("./middlewares/rateLimiter.middleware");
const ApiError = require("./utils/apiError");
const globalErrorController = require("./middlewares/globalErrorHandler.middleware");
const userRouter = require("./routes/user.routes");
const authRouter = require("./routes/auth.routes");
const productsRouter = require("./routes/products.routes");
const userProductsRouter = require("./routes/user.products.routes");

const app = express();
// Use helmet for setting security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // It is a restful API, so we dont need them
  })
);

// Configure the allowed origins for this backend API
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS.split(",") || [];
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  })
);

// Rate limiter Middleware to limit repeated requests to our exposed endpoints. We will exclude from rate limiting the checkpoint for checking the status of the server
app.use("/", limiter);

// Body parser with size limits
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Middleware to protect against HTTP Parameter Pollution attacks
app.use(
  hpp({
    whitelist: [],
  })
);

// Logging HTTP requests in Console in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Health check endpoint
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Mounting the application routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/user-products", userProductsRouter);

// Handle all unimplemented routes
app.all("/{*splat}", (req, res, next) => {
  next(new ApiError(`Can't find the ${req.originalUrl} on the server`, 404));
});
// Global Error Middleware
app.use(globalErrorController);

module.exports = app;
