const logger = require("../utils/logger");

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
    if (!err.isOperational) {
      logger.error(err);
    } else {
      logger.warn(err);
    }
    sendErrorProd(err, res);
  }
};

module.exports = globalErrorController;
