/**
 * Task status enumeration
 */
export type TaskStatus = "pending" | "in-progress" | "done";

/**
 * Task entity interface
 */
export interface Task {
  id: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating a new task
 */
export interface CreateTaskDto {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  status?: TaskStatus;
}

/**
 * DTO for updating an existing task
 */
export interface UpdateTaskDto {
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  status?: TaskStatus;
}
