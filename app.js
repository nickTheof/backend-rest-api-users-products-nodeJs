const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const hpp = require("hpp");
const morgan = require("morgan");
const limiter = require("./middlewares/rateLimiter.middleware");
const ApiError = require("./utils/apiError");
const globalErrorController = require("./middlewares/globalErrorHandler.middleware");
const userRouter = require("./routes/user.routes");

const app = express();
// Use helmet for setting security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // It is a restful API, so we dont need them
  })
);

// Configure the allowed origins for this backend API
app.use(
  cors({
    origin: ["http:127.0.0.1:5173"],
    credentials: true,
  })
);

// Rate limiter Middleware to limit repeated requests to our exposed endpoints
app.use("/", limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Mounting the application routes
app.use("/api/v1/users", userRouter);

// Handle all unimplemented routes
app.use("/{*splat}", (req, res, next) => {
  next(new ApiError(`Can't find the ${req.originalUrl} on the server`, 404));
});
// Global Error Middleware
app.use(globalErrorController);

module.exports = app;
