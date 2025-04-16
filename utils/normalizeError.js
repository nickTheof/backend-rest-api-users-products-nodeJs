function normalizeError(err) {
  const normalizedError = { ...err };

  normalizedError.name = err.name;
  normalizedError.message = err.message;
  normalizedError.stack = err.stack;
  normalizedError.statusCode = err.statusCode || 500;
  normalizedError.status = err.status || "fail";

  return normalizedError;
}

module.exports = normalizeError;
