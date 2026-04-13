import { Task, TaskStatus, CreateTaskDto, UpdateTaskDto } from "../types";
import taskRepository from "../repositories/taskRepository";

/**
 * Service layer for task business logic
 * Handles validation, data transformation, and orchestrates data access
 */

/**
 * Validate task status value
 */
function isValidStatus(status: string): boolean {
  return Object.values(TaskStatus).includes(status as TaskStatus);
}

/**
 * Validate task title - must be non-empty string
 */
function validateTitle(title: unknown): asserts title is string {
  if (typeof title !== "string" || title.trim().length === 0) {
    throw new Error("Title is required and must be a non-empty string");
  }
}

/**
 * Validate status transition - prevent invalid state changes
 * Rules:
 * - Can transition from any status to any other status
 * - Once done, can only go back to pending or in-progress
 */
function validateStatusTransition(
  currentStatus: TaskStatus,
  newStatus: TaskStatus,
): void {
  // Allow all transitions for now - business rule can be extended
  // Example restriction: prevent going from done back to in-progress
  if (
    currentStatus === TaskStatus.DONE &&
    newStatus === TaskStatus.IN_PROGRESS
  ) {
    throw new Error(
      "Cannot transition from 'done' to 'in-progress'. Please transition to 'pending' first.",
    );
  }
}

/**
 * Get all tasks
 * @returns Promise resolving to array of all tasks
 */
export async function findAll(): Promise<Task[]> {
  try {
    const tasks = await taskRepository.findAll();
    return tasks;
  } catch (error) {
    console.error("Error fetching all tasks:", error);
    throw new Error("Failed to fetch tasks");
  }
}

/**
 * Get task by ID
 * @param id - Task ID
 * @returns Promise resolving to task or null if not found
 */
export async function findById(id: number): Promise<Task | null> {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid task ID");
    }
    const task = await taskRepository.findById(id);
    return task;
  } catch (error) {
    console.error(`Error fetching task with ID ${id}:`, error);
    throw new Error("Failed to fetch task");
  }
}

/**
 * Create a new task
 * @param data - Task creation data
 * @returns Promise resolving to created task
 */
export async function create(data: CreateTaskDto): Promise<Task> {
  try {
    // Validate title
    validateTitle(data.title);

    // Validate status if provided
    if (data.status !== undefined && data.status !== null) {
      if (!isValidStatus(data.status)) {
        throw new Error(
          `Invalid status. Must be one of: ${Object.values(TaskStatus).join(", ")}`,
        );
      }
    }

    // Create task with default status if not provided
    const taskData: CreateTaskDto = {
      title: data.title.trim(),
      description: data.description ?? null,
      dueDate: data.dueDate ?? null,
      status: data.status ?? TaskStatus.PENDING,
    };

    const task = await taskRepository.create(taskData);
    return task;
  } catch (error) {
    if (error instanceof Error) {
      // Rethrow validation errors
      if (
        error.message.includes("Title is required") ||
        error.message.includes("Invalid status")
      ) {
        throw error;
      }
    }
    console.error("Error creating task:", error);
    throw new Error("Failed to create task");
  }
}

/**
 * Update an existing task
 * @param id - Task ID
 * @param data - Task update data
 * @returns Promise resolving to updated task or null if not found
 */
export async function update(
  id: number,
  data: UpdateTaskDto,
): Promise<Task | null> {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid task ID");
    }

    // Get current task to check status transition
    const currentTask = await taskRepository.findById(id);
    if (!currentTask) {
      return null;
    }

    // Validate title if provided
    if (data.title !== undefined) {
      validateTitle(data.title);
    }

    // Validate status transition if status is being updated
    if (data.status !== undefined && data.status !== null) {
      if (!isValidStatus(data.status)) {
        throw new Error(
          `Invalid status. Must be one of: ${Object.values(TaskStatus).join(", ")}`,
        );
      }
      validateStatusTransition(currentTask.status, data.status);
    }

    // Prepare update data
    const updateData: UpdateTaskDto = {
      title: data.title?.trim(),
      description: data.description,
      dueDate: data.dueDate,
      status: data.status,
    };

    const task = await taskRepository.update(id, updateData);
    return task;
  } catch (error) {
    if (error instanceof Error) {
      // Rethrow validation errors
      if (
        error.message.includes("Title is required") ||
        error.message.includes("Invalid status") ||
        error.message.includes("Cannot transition")
      ) {
        throw error;
      }
    }
    console.error(`Error updating task with ID ${id}:`, error);
    throw new Error("Failed to update task");
  }
}

/**
 * Delete a task
 * @param id - Task ID
 * @returns Promise resolving to true if deleted, false if not found
 */
export async function deleteTask(id: number): Promise<boolean> {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid task ID");
    }

    const deleted = await taskRepository.delete(id);
    return deleted;
  } catch (error) {
    console.error(`Error deleting task with ID ${id}:`, error);
    throw new Error("Failed to delete task");
  }
}

export default {
  findAll,
  findById,
  create,
  update,
  delete: deleteTask,
};
