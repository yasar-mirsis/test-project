import { Router, Request, Response, NextFunction } from "express";
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController";
import {
  validateCreateTask,
  validateUpdateTask,
  validateTaskId,
} from "../middleware/validation";

const router = Router();

/**
 * Tasks Routes
 *
 * This module defines all HTTP endpoints for task management in the to-do list application.
 * It follows RESTful conventions and applies validation middleware where appropriate.
 *
 * Endpoints:
 * - GET /tasks - List all tasks (no authentication required)
 * - GET /tasks/:id - Get a single task by ID (requires valid task ID)
 * - POST /tasks - Create a new task (requires validation of request body)
 * - PUT /tasks/:id - Update an existing task (requires valid ID and update data)
 * - DELETE /tasks/:id - Delete a task (requires valid task ID)
 *
 * @module routes/tasks
 */

/**
 * GET /tasks
 *
 * Retrieves a list of all tasks in the system.
 * No middleware validation required as no input parameters are needed.
 *
 * @route GET /tasks
 * @handler getAllTasks
 * @returns {Object} 200 - Success response with array of tasks
 */
router.get("/", getAllTasks);

/**
 * GET /tasks/:id
 *
 * Retrieves a single task by its unique identifier.
 * Applies validateTaskId middleware to ensure the ID parameter is valid.
 *
 * @route GET /tasks/:id
 * @middleware validateTaskId - Validates that :id is a positive integer
 * @handler getTaskById
 * @returns {Object} 200 - Task found
 * @returns {Object} 404 - Task not found
 * @returns {Object} 400 - Invalid task ID format
 */
router.get("/:id", validateTaskId, getTaskById);

/**
 * POST /tasks
 *
 * Creates a new task in the system.
 * Applies validateCreateTask middleware to validate the request body against CreateTaskDto schema.
 *
 * @route POST /tasks
 * @middleware validateCreateTask - Validates title, description, dueDate, and status
 * @handler createTask
 * @body {CreateTaskDto} - Task data with required title field
 * @returns {Object} 201 - Task created successfully
 * @returns {Object} 400 - Validation failed
 */
router.post("/", validateCreateTask, createTask);

/**
 * PUT /tasks/:id
 *
 * Updates an existing task with the provided data.
 * Applies both validateTaskId and validateUpdateTask middlewares.
 * All fields in the update body are optional (partial update).
 *
 * @route PUT /tasks/:id
 * @middleware validateTaskId - Validates that :id is a positive integer
 * @middleware validateUpdateTask - Validates update fields (all optional)
 * @handler updateTask
 * @body {UpdateTaskDto} - Partial task data to update
 * @returns {Object} 200 - Task updated successfully
 * @returns {Object} 404 - Task not found
 * @returns {Object} 400 - Validation failed
 */
router.put("/:id", validateTaskId, validateUpdateTask, updateTask);

/**
 * DELETE /tasks/:id
 *
 * Deletes a task from the system by its unique identifier.
 * Applies validateTaskId middleware to ensure the ID parameter is valid.
 *
 * @route DELETE /tasks/:id
 * @middleware validateTaskId - Validates that :id is a positive integer
 * @handler deleteTask
 * @returns {Object} 200 - Task deleted successfully
 * @returns {Object} 404 - Task not found
 * @returns {Object} 400 - Invalid task ID format
 */
router.delete("/:id", validateTaskId, deleteTask);

/**
 * Export the configured router for use in the main Express application.
 * This router should be mounted at the /tasks path in the main app.
 *
 * @example
 * ```typescript
 * import taskRoutes from './routes/tasks';
 * app.use('/tasks', taskRoutes);
 * ```
 */
export default router;
