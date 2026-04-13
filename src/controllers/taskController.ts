import { Request, Response, NextFunction } from "express";
import * as taskService from "../services/taskService";
import { CreateTaskDto, UpdateTaskDto, Task } from "../types";

/**
 * Get all tasks
 * Returns a list of all tasks in the system
 * HTTP Status: 200
 */
export async function getAllTasks(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tasks: Task[] = await taskService.findAll();
    res.status(200).json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a task by ID
 * Returns a single task or 404 if not found
 * HTTP Status: 200 or 404
 */
export async function getTaskById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);

    // Validate ID is a valid positive integer
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        error: "Invalid task ID. Must be a positive integer.",
      });
      return;
    }

    const task = await taskService.findById(id);

    if (!task) {
      res.status(404).json({
        success: false,
        error: `Task with ID ${id} not found`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    // Handle validation errors from service layer
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * Create a new task
 * Creates a task and returns the created task with 201 status
 * HTTP Status: 201 or 400
 */
export async function createTask(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const taskData: CreateTaskDto = req.body;

    // Validate required fields
    if (!taskData.title || taskData.title.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: "Title is required",
      });
      return;
    }

    const createdTask = await taskService.create(taskData);

    res.status(201).json({
      success: true,
      data: createdTask,
      message: "Task created successfully",
    });
  } catch (error) {
    // Handle validation errors
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }
    // Handle business rule violations
    if (error instanceof Error && error.name === "BusinessRuleError") {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * Update an existing task
 * Updates a task and returns the updated task
 * HTTP Status: 200, 400, or 404
 */
export async function updateTask(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const taskData: UpdateTaskDto = req.body;

    // Validate ID is a valid positive integer
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        error: "Invalid task ID. Must be a positive integer.",
      });
      return;
    }

    const updatedTask = await taskService.update(id, taskData);

    if (!updatedTask) {
      res.status(404).json({
        success: false,
        error: `Task with ID ${id} not found`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updatedTask,
      message: "Task updated successfully",
    });
  } catch (error) {
    // Handle validation errors
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }
    // Handle business rule violations
    if (error instanceof Error && error.name === "BusinessRuleError") {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * Delete a task
 * Deletes a task and returns confirmation
 * HTTP Status: 200, 400, or 404
 */
export async function deleteTask(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);

    // Validate ID is a valid positive integer
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        error: "Invalid task ID. Must be a positive integer.",
      });
      return;
    }

    const deleted = await taskService.deleteTask(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: `Task with ID ${id} not found`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Task with ID ${id} deleted successfully`,
      data: null,
    });
  } catch (error) {
    // Handle validation errors
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }
    // Handle business rule violations
    if (error instanceof Error && error.name === "BusinessRuleError") {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
}
