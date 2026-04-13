import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { TaskStatus } from "../types";

/**
 * Zod schema for validating task status
 */
export const TaskStatusSchema = z.enum([
  TaskStatus.PENDING,
  TaskStatus.IN_PROGRESS,
  TaskStatus.DONE,
]);

/**
 * Zod schema for creating a new task
 */
export const CreateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must not exceed 200 characters")
    .trim(),
  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .optional()
    .nullable(),
  dueDate: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .refine(
      (date) => !date || new Date(date) > new Date(),
      "Due date must be in the future",
    ),
  status: TaskStatusSchema.default(TaskStatus.PENDING),
});

/**
 * Zod schema for updating an existing task (all fields optional)
 */
export const UpdateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must not exceed 200 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .optional()
    .nullable(),
  dueDate: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .refine(
      (date) => !date || new Date(date) > new Date(),
      "Due date must be in the future",
    ),
  status: TaskStatusSchema.optional(),
});

/**
 * Zod schema for task ID parameter validation
 */
export const TaskIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID must be a number")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "ID must be a positive integer"),
});

/**
 * Validation middleware factory
 * Creates a middleware function that validates request data against a schema
 *
 * @param schema - The Zod schema to validate against
 * @param source - Where to get data from ('body', 'query', or 'params')
 * @returns Express middleware function
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  source: "body" | "query" | "params" = "body",
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = source === "body" ? req.body : req[source];
      const validatedData = schema.parse(data);

      // Attach validated data to request object
      if (source === "body") {
        req.body = validatedData as unknown;
      } else {
        req[source] = validatedData as unknown;
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        res.status(400).json({
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
 * Middleware to validate task creation request body
 */
export const validateCreateTask = validateRequest(CreateTaskSchema, "body");

/**
 * Middleware to validate task update request body
 */
export const validateUpdateTask = validateRequest(UpdateTaskSchema, "body");

/**
 * Middleware to validate task ID from URL parameters
 */
export const validateTaskId = validateRequest(TaskIdSchema, "params");

/**
 * Error handling middleware for validation errors
 * Must be placed after all routes
 */
export function validationErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (err instanceof z.ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    res.status(400).json({
      error: "Validation failed",
      details: errors,
    });
    return;
  }
  next(err);
}
