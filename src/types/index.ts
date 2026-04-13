/**
 * Task status enumeration
 */
export enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in-progress",
  DONE = "done",
}

/**
 * Task entity interface
 */
export interface Task {
  id: number;
  title: string;
  description: string | null;
  dueDate: Date | null;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for creating a new task
 */
export interface CreateTaskDto {
  title: string;
  description?: string | null;
  dueDate?: Date | null;
  status?: TaskStatus;
}

/**
 * DTO for updating an existing task
 */
export interface UpdateTaskDto {
  title?: string;
  description?: string | null;
  dueDate?: Date | null;
  status?: TaskStatus;
}
