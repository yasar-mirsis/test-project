import { Request, Response, NextFunction } from "express";
import { z, ZodSchema, ZodError } from "zod";
import { TaskStatus } from "../types";

/**
 * Zod schema for task creation validation
 */
export const createTaskSchema: ZodSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters")
    .trim(),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .nullable(),
  dueDate: z
    .string()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      {
        message:
          "Invalid date format. Use ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)",
      },
    )
    .optional()
    .nullable(),
  status: z
    .enum([TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.DONE], {
      errorMap: () => ({
        message: `Status must be one of: ${Object.values(TaskStatus).join(", ")}`,
      }),
    })
    .default(TaskStatus.PENDING),
});

/**
 * Zod schema for task update validation (all fields optional)
 */
export const updateTaskSchema: ZodSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .nullable(),
  dueDate: z
    .string()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      {
        message:
          "Invalid date format. Use ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)",
      },
    )
    .optional()
    .nullable(),
  status: z
    .enum([TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.DONE], {
      errorMap: () => ({
        message: `Status must be one of: ${Object.values(TaskStatus).join(", ")}`,
      }),
    })
    .optional(),
});

/**
 * Zod schema for task ID validation (URL parameter)
 */
export const taskIdSchema: ZodSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "Task ID must be a positive integer")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "Task ID must be a positive integer"),
});

/**
 * Middleware factory for validating request body
 * @param schema - Zod schema to validate against
 * @returns Express middleware
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors,
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Middleware factory for validating URL parameters
 * @param schema - Zod schema to validate against
 * @returns Express middleware
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params) as never;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors,
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Middleware factory for validating query parameters
 * @param schema - Zod schema to validate against
 * @returns Express middleware
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query) as never;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors,
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Validation error handler middleware
 * Catches and formats validation errors
 */
export function validationErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
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
  next(err);
}
