import { Task, TaskStatus, CreateTaskDto, UpdateTaskDto } from "../types";
import { getConnection } from "../database/connection";

/**
 * Repository layer for task data access
 * Handles direct database operations
 */

/**
 * Map database row to Task object
 */
function mapRowToTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as number,
    title: row.title as string,
    description: (row.description as string) ?? null,
    dueDate: row.dueDate ? new Date(row.dueDate as string) : null,
    status: row.status as TaskStatus,
    createdAt: new Date(row.createdAt as string),
    updatedAt: new Date(row.updatedAt as string),
  };
}

/**
 * Get all tasks from database
 * @returns Promise resolving to array of all tasks
 */
export async function findAll(): Promise<Task[]> {
  const db = getConnection();
  const rows = db
    .prepare("SELECT * FROM tasks ORDER BY createdAt DESC")
    .all() as Record<string, unknown>[];
  return rows.map(mapRowToTask);
}

/**
 * Find task by ID
 * @param id - Task ID
 * @returns Promise resolving to task or null if not found
 */
export async function findById(id: number): Promise<Task | null> {
  const db = getConnection();
  const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as
    | Record<string, unknown>
    | undefined;

  if (!row) {
    return null;
  }
  return mapRowToTask(row);
}

/**
 * Create a new task
 * @param task - Task data to create
 * @returns Promise resolving to created task
 */
export async function create(task: CreateTaskDto): Promise<Task> {
  const db = getConnection();

  const insert = db.prepare(`
    INSERT INTO tasks (title, description, dueDate, status)
    VALUES (?, ?, ?, ?)
  `);

  const result = insert.run(
    task.title,
    task.description ?? null,
    task.dueDate?.toISOString() ?? null,
    task.status ?? TaskStatus.PENDING,
  );

  const newId = result.lastInsertRowid as number;

  // Fetch the created task
  const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(newId) as
    | Record<string, unknown>
    | undefined;

  if (!row) {
    throw new Error("Failed to create task");
  }

  return mapRowToTask(row);
}

/**
 * Update an existing task
 * @param id - Task ID
 * @param task - Task data to update
 * @returns Promise resolving to updated task or null if not found
 */
export async function update(
  id: number,
  task: UpdateTaskDto,
): Promise<Task | null> {
  const db = getConnection();

  // Build dynamic update query based on provided fields
  const updates: string[] = [];
  const values: unknown[] = [];

  if (task.title !== undefined) {
    updates.push("title = ?");
    values.push(task.title);
  }

  if (task.description !== undefined) {
    updates.push("description = ?");
    values.push(task.description ?? null);
  }

  if (task.dueDate !== undefined) {
    updates.push("dueDate = ?");
    values.push(task.dueDate?.toISOString() ?? null);
  }

  if (task.status !== undefined) {
    updates.push("status = ?");
    values.push(task.status);
  }

  if (updates.length === 0) {
    // No fields to update, return current task
    return findById(id);
  }

  // Always update the updatedAt timestamp
  updates.push("updatedAt = datetime('now')");

  values.push(id);

  const sql = `UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`;

  db.prepare(sql).run(...values);

  // Fetch the updated task
  const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as
    | Record<string, unknown>
    | undefined;

  if (!row) {
    return null;
  }

  return mapRowToTask(row);
}

/**
 * Delete a task
 * @param id - Task ID
 * @returns Promise resolving to true if deleted, false if not found
 */
export async function deleteTask(id: number): Promise<boolean> {
  const db = getConnection();

  const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);

  return result.changes > 0;
}

export default {
  findAll,
  findById,
  create,
  update,
  delete: deleteTask,
};
