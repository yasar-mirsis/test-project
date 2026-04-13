import { Task, CreateTaskDto, UpdateTaskDto, TaskStatus } from "../types";
import * as taskRepository from "../repositories/taskRepository";
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  TaskStatusSchema,
} from "../middleware/validation";
import { z } from "zod";

/**
 * Custom error for business rule violations
 */
export class BusinessRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BusinessRuleError";
  }
}

/**
 * Custom error for validation errors
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Validate title is not empty and within length limits
 */
function validateTitle(title: string): void {
  if (!title || title.trim().length === 0) {
    throw new ValidationError("Title is required and cannot be empty");
  }
  if (title.length > 200) {
    throw new ValidationError("Title must not exceed 200 characters");
  }
}

/**
 * Validate status value
 */
function validateStatus(status: string): void {
  const result = TaskStatusSchema.safeParse(status);
  if (!result.success) {
    throw new ValidationError(
      `Invalid status. Must be one of: ${Object.values(TaskStatus).join(", ")}`,
    );
  }
}

/**
 * Validate status transition rules
 * - Cannot transition from 'done' to other statuses without explicit reset
 * - Cannot skip 'in-progress' when moving from 'pending' to 'done'
 */
function validateStatusTransition(
  currentStatus: TaskStatus,
  newStatus: TaskStatus,
): void {
  // Prevent changing status from done (task is completed)
  if (currentStatus === TaskStatus.DONE && newStatus !== TaskStatus.DONE) {
    throw new BusinessRuleError(
      "Cannot change status of a completed task. Delete and create a new task if needed.",
    );
  }
}

/**
 * Fetch all tasks from the database
 * @returns Promise resolving to an array of all tasks
 */
export async function findAll(): Promise<Task[]> {
  try {
    const tasks = await taskRepository.findAll();
    return tasks;
  } catch (error) {
    throw new Error(
      `Failed to fetch all tasks: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Find a task by its ID
 * @param id - The task ID to find
 * @returns Promise resolving to the task or null if not found
 */
export async function findById(id: number): Promise<Task | null> {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError("Task ID must be a positive integer");
    }
    const task = await taskRepository.findById(id);
    return task;
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof BusinessRuleError
    ) {
      throw error;
    }
    throw new Error(
      `Failed to fetch task with ID ${id}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Create a new task
 * @param data - The task data to create
 * @returns Promise resolving to the created task
 */
export async function create(data: CreateTaskDto): Promise<Task> {
  try {
    // Validate title
    validateTitle(data.title);

    // Validate status if provided
    if (data.status) {
      validateStatus(data.status);
    }

    // Validate using Zod schema
    const validatedData = CreateTaskSchema.parse(data);

    // Insert the task
    const taskId = await taskRepository.insertTask(validatedData);

    // Fetch and return the created task
    const createdTask = await taskRepository.findById(taskId);
    if (!createdTask) {
      throw new Error("Failed to retrieve created task");
    }

    return createdTask;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(
        (e) => `${e.path.join(".")}: ${e.message}`,
      );
      throw new ValidationError(`Validation failed: ${errors.join(", ")}`);
    }
    if (
      error instanceof ValidationError ||
      error instanceof BusinessRuleError
    ) {
      throw error;
    }
    throw new Error(
      `Failed to create task: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Update an existing task
 * @param id - The ID of the task to update
 * @param data - The task data to update
 * @returns Promise resolving to the updated task or null if not found
 */
export async function update(
  id: number,
  data: UpdateTaskDto,
): Promise<Task | null> {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError("Task ID must be a positive integer");
    }

    // Fetch existing task to check status transition rules
    const existingTask = await taskRepository.findById(id);
    if (!existingTask) {
      return null;
    }

    // Validate title if provided
    if (data.title !== undefined) {
      validateTitle(data.title);
    }

    // Validate status if provided and check transition rules
    if (data.status !== undefined) {
      validateStatus(data.status);
      validateStatusTransition(existingTask.status, data.status);
    }

    // Validate using Zod schema (partial update)
    const validatedData = UpdateTaskSchema.parse(data);

    // Update the task
    await taskRepository.updateTask(id, validatedData);

    // Fetch and return the updated task
    const updatedTask = await taskRepository.findById(id);
    return updatedTask;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(
        (e) => `${e.path.join(".")}: ${e.message}`,
      );
      throw new ValidationError(`Validation failed: ${errors.join(", ")}`);
    }
    if (
      error instanceof ValidationError ||
      error instanceof BusinessRuleError
    ) {
      throw error;
    }
    throw new Error(
      `Failed to update task with ID ${id}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Delete a task
 * @param id - The ID of the task to delete
 * @returns Promise resolving to true if deleted, false if not found
 */
export async function deleteTask(id: number): Promise<boolean> {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError("Task ID must be a positive integer");
    }

    const affectedRows = await taskRepository.deleteTask(id);
    return affectedRows > 0;
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof BusinessRuleError
    ) {
      throw error;
    }
    throw new Error(
      `Failed to delete task with ID ${id}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
