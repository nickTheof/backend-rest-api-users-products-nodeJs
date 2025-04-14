const express = require("express");
const globalErrorController = require("./controllers/globalError.controller");
const ApiError = require("./utils/apiError");

const app = express();

// Handle all unimplemented routes
app.use("/{*splat}", (req, res, next) => {
  next(new ApiError(`Can't find the ${req.originalUrl} on the server`, 404));
});
// Global Error Middleware
app.use(globalErrorController);

module.exports = app;
