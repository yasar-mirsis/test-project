import { Router } from "express";
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
 * GET /tasks
 * List all tasks
 */
router.get("/", getAllTasks);

/**
 * GET /tasks/:id
 * Get a single task by ID
 */
router.get("/:id", validateTaskId, getTaskById);

/**
 * POST /tasks
 * Create a new task
 */
router.post("/", validateCreateTask, createTask);

/**
 * PUT /tasks/:id
 * Update an existing task
 */
router.put("/:id", validateTaskId, validateUpdateTask, updateTask);

/**
 * DELETE /tasks/:id
 * Delete a task
 */
router.delete("/:id", validateTaskId, deleteTask);

export default router;
