import { AppError } from "../errors/AppError.js";

export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    const body = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    };

    if (err.details) {
      body.error.details = err.details;
    }

    if (process.env.NODE_ENV === "development") {
      body.error.stack = err.stack;
    }

    return res.status(err.statusCode).json(body);
  }

  const body = {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    },
  };

  if (process.env.NODE_ENV === "development") {
    body.error.stack = err.stack;
  }

  res.status(500).json(body);
}
