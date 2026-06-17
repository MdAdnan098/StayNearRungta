/**
 * Catch-all 404 handler – attach to routes that don't match anything.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global error handler – must be the last middleware registered.
 */
const errorHandler = (err, req, res, next) => {
  // If the response status is still 200 (no explicit status set), use 500
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Mongoose bad ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    err.message = "Resource not found – invalid ID format";
  }

  // Mongoose duplicate key (e.g. unique mobile number)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    err.message = `Duplicate value: ${field} already exists`;
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    err.message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    err.message = "Invalid token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    err.message = "Token has expired";
  }

  // Multer errors
  if (err.code === "LIMIT_FILE_COUNT") {
    statusCode = 400;
    err.message = "Too many files – maximum 10 photos allowed";
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    err.message = "File too large – maximum size is 10 MB per image";
  }

  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
