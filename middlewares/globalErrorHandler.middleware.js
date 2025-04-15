const logger = require("../utils/logger");
const ApiError = require("../utils/apiError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ApiError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new ApiError(message, 400);
};

const handleMongoConnectionError = (err) => {
  const message = "Cannot connect to the database. Please try again later.";
  return new ApiError(message, 503);
};

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
    let error = err;

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
