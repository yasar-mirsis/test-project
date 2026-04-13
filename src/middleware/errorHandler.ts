import { Request, Response, NextFunction } from "express";
import { sendError } from "./responseHandler";

/**
 * Custom error types for the application
 */
export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Global error handler middleware
 * Must be placed after all routes and accept 4 parameters
 *
 * @param err - The error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 */
export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Log error for debugging (in production, use a proper logging service)
  console.error("Error:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  // Default to 500 Internal Server Error
  const statusCode = err.statusCode || 500;

  // Build error response
  const errorResponse = {
    success: false,
    error: err.message || "Internal server error",
  };

  // In development, include stack trace
  if (process.env.NODE_ENV === "development") {
    (errorResponse as Record<string, unknown>).stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found handler for unmatched routes
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Create an operational error wrapper
 * Use this for expected errors (validation, not found, etc.)
 *
 * @param message - Error message
 * @param statusCode - HTTP status code
 * @returns Error object with operational flag
 */
export function createOperationalError(
  message: string,
  statusCode: number,
): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}

/**
 * Validation error handler
 * Handles Zod validation errors from the validation middleware
 */
export function validationErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Check if this is a ZodError
  if (err.name === "ZodError") {
    const zodError = err as Record<string, unknown>;
    const errors = (
      zodError.errors as Array<{ path: string[]; message: string }>
    ).map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors,
    });
    return;
  }

  // Pass other errors to the main error handler
  next(err);
}

/**
 * Database error handler
 * Handles database-related errors gracefully
 */
export function databaseErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Check for common database errors
  const errorMessage = err.message.toLowerCase();

  if (errorMessage.includes("sqlite") || errorMessage.includes("database")) {
    console.error("Database error:", err);

    res.status(500).json({
      success: false,
      error: "Database operation failed. Please try again later.",
    });
    return;
  }

  // Pass other errors to the main error handler
  next(err);
}
