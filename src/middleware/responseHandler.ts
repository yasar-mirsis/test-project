import { Request, Response, NextFunction } from "express";

/**
 * Standard API response interface
 */
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

/**
 * Response handler utility functions
 * Provides consistent response formatting across the API
 */

/**
 * Send a success response
 * @param res - Express response object
 * @param statusCode - HTTP status code (default: 200)
 * @param data - Response data
 * @param message - Optional success message
 */
export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  data: T,
  message?: string,
): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  res.status(statusCode).json(response);
}

/**
 * Send an error response
 * @param res - Express response object
 * @param statusCode - HTTP status code
 * @param error - Error message
 * @param details - Optional error details (e.g., validation errors)
 */
export function sendError(
  res: Response,
  statusCode: number,
  error: string,
  details?: unknown[],
): void {
  const response: ApiResponse = {
    success: false,
    error,
  };

  if (details) {
    (response as Record<string, unknown>).details = details;
  }

  res.status(statusCode).json(response);
}

/**
 * Send a not found response
 * @param res - Express response object
 * @param resource - Name of the resource that was not found
 * @param identifier - Optional identifier for the resource
 */
export function sendNotFound(
  res: Response,
  resource: string = "Resource",
  identifier?: string | number,
): void {
  const message = identifier
    ? `${resource} with ID ${identifier} not found`
    : `${resource} not found`;

  sendError(res, 404, message);
}

/**
 * Send a bad request response
 * @param res - Express response object
 * @param error - Error message
 * @param details - Optional validation error details
 */
export function sendBadRequest(
  res: Response,
  error: string,
  details?: unknown[],
): void {
  sendError(res, 400, error, details);
}

/**
 * Send an unauthorized response
 * @param res - Express response object
 * @param message - Optional error message
 */
export function sendUnauthorized(res: Response, message?: string): void {
  sendError(
    res,
    401,
    message || "Unauthorized access. Please authenticate first.",
  );
}

/**
 * Send a forbidden response
 * @param res - Express response object
 * @param message - Optional error message
 */
export function sendForbidden(res: Response, message?: string): void {
  sendError(res, 403, message || "Access denied to this resource.");
}

/**
 * Send an internal server error response
 * @param res - Express response object
 * @param message - Optional error message
 */
export function sendInternalServerError(
  res: Response,
  message: string = "Internal server error",
): void {
  sendError(res, 500, message);
}

/**
 * Middleware to wrap async route handlers and catch errors
 * This prevents unhandled promise rejections in async route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
