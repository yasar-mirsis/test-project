import { query, queryOne, insert, execute } from "../database/connection";
import { Task, CreateTaskDto, UpdateTaskDto } from "../types";

/**
 * Find all tasks in the database
 * @returns Promise resolving to an array of all tasks
 */
export function findAll(): Promise<Task[]> {
  const sql = "SELECT * FROM tasks ORDER BY createdAt DESC";
  try {
    const result = query<Task>(sql);
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(
      new Error(
        `Failed to fetch all tasks: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}

/**
 * Find a task by its ID
 * @param id - The task ID to find
 * @returns Promise resolving to the task or null if not found
 */
export function findById(id: number): Promise<Task | null> {
  const sql = "SELECT * FROM tasks WHERE id = ?";
  try {
    const result = queryOne<Task>(sql, [id]);
    return Promise.resolve(result ?? null);
  } catch (error) {
    return Promise.reject(
      new Error(
        `Failed to fetch task with ID ${id}: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}

/**
 * Insert a new task into the database
 * @param task - The task data to insert
 * @returns Promise resolving to the ID of the inserted task
 */
export function insertTask(task: CreateTaskDto): Promise<number> {
  const sql = `
    INSERT INTO tasks (title, description, dueDate, status)
    VALUES (?, ?, ?, ?)
  `;
  const params = [
    task.title,
    task.description ?? null,
    task.dueDate ?? null,
    task.status ?? "pending",
  ];

  try {
    const id = insert(sql, params);
    return Promise.resolve(id);
  } catch (error) {
    return Promise.reject(
      new Error(
        `Failed to insert task: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}

/**
 * Update an existing task in the database
 * @param id - The ID of the task to update
 * @param task - The task data to update
 * @returns Promise resolving to the number of affected rows (1 if updated, 0 if not found)
 */
export function updateTask(id: number, task: UpdateTaskDto): Promise<number> {
  const updatableFields: (keyof UpdateTaskDto)[] = [
    "title",
    "description",
    "dueDate",
    "status",
  ];
  const setClauses: string[] = [];
  const params: unknown[] = [];

  // Build SET clauses only for provided fields
  for (const field of updatableFields) {
    if (task[field] !== undefined) {
      setClauses.push(`${field} = ?`);
      params.push(task[field] as unknown);
    }
  }

  // If no fields to update, return 0
  if (setClauses.length === 0) {
    return Promise.resolve(0);
  }

  // Add updatedAt timestamp
  setClauses.push("updatedAt = datetime('now')");

  const sql = `UPDATE tasks SET ${setClauses.join(", ")} WHERE id = ?`;
  params.push(id);

  try {
    const changes = execute(sql, params);
    return Promise.resolve(changes);
  } catch (error) {
    return Promise.reject(
      new Error(
        `Failed to update task with ID ${id}: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}

/**
 * Delete a task from the database
 * @param id - The ID of the task to delete
 * @returns Promise resolving to the number of affected rows (1 if deleted, 0 if not found)
 */
export function deleteTask(id: number): Promise<number> {
  const sql = "DELETE FROM tasks WHERE id = ?";
  try {
    const changes = execute(sql, [id]);
    return Promise.resolve(changes);
  } catch (error) {
    return Promise.reject(
      new Error(
        `Failed to delete task with ID ${id}: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}
