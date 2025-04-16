const logger = require("../utils/logger");
const ApiError = require("../utils/apiError");
const normalizeError = require("../utils/normalizeError");

// Transform mongoose Cast Error to Customed ApiError to handle this error in production environment
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ApiError(message, 400);
};

// Transform mongoose validation Errors to Customed ApiError to handle these errors in production environment
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new ApiError(message, 400);
};

// Transform mongoose and MongoDB driver connections Errors to Customed ApiError to handle these errors in production environment
const handleMongoConnectionError = (err) => {
  const message = "Cannot connect to the database. Please try again later.";
  return new ApiError(message, 503);
};

// Transform jsonWebTokenError for invalid format of token to Customed ApiError to handle this error in production environment. This can be thrown in jsonwebtoken.verify() method.
const handleJWTError = () =>
  new ApiError("Invalid token. Please log in again!", 401);

// Transform TokenExpiredError for expired token to Customed ApiError to handle this error in production environment. This can be thrown in jsonwebtoken.verify() method.
const handleJWTExpiredError = () =>
  new ApiError("Your token has expired! Please log in again.", 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // In production, We send a specific generic response to the client for all the errors that happens and are not operationals/ business logic errors
    res.status(500).json({
      status: "fail",
      message: "Something went wrong",
    });
  }
};

const globalErrorController = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "fail";

  if (process.env.NODE_ENV === "development") {
    logger.warn(err);
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = normalizeError(err);

    if (error.name === "CastError") {
      error = handleCastErrorDB(error);
    }
    if (error.name === "ValidationError") {
      error = handleValidationErrorDB(error);
    }

    if (
      error.name === "MongooseServerSelectionError" ||
      error.name === "MongoNetworkError" ||
      error.name === "MongoTimeoutError"
    ) {
      error = handleMongoConnectionError(error);
    }

    if (error.name === "JsonWebTokenError") {
      error = handleJWTError();
    }
    if (error.name === "TokenExpiredError") {
      error = handleJWTExpiredError();
    }

    const logPayload = {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack,
      route: req.originalUrl,
      method: req.method,
    };

    if (!error.isOperational) {
      logger.error(logPayload);
    } else {
      logger.warn(logPayload);
    }

    sendErrorProd(error, res);
  }
};

module.exports = globalErrorController;
