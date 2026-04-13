import Database from "better-sqlite3";
import path from "path";

let db: Database.Database | null = null;

/**
 * Get the database connection instance
 * Creates a new connection if one doesn't exist
 */
export function getConnection(): Database.Database {
  if (!db) {
    const dbPath = process.env.DATABASE_PATH
      ? path.resolve(process.env.DATABASE_PATH)
      : path.resolve(__dirname, "../../database/todo.db");

    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
  }
  return db;
}

/**
 * Initialize the database and create the tasks table
 */
export function init(): void {
  const connection = getConnection();

  connection.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      dueDate TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in-progress', 'done')),
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

/**
 * Close the database connection
 */
export function close(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Execute a query with parameters
 */
export function query<T = unknown>(sql: string, params: unknown[] = []): T[] {
  const connection = getConnection();
  const statement = connection.prepare(sql);
  return statement.all(params) as T[];
}

/**
 * Execute a query that returns a single row
 */
export function queryOne<T = unknown>(
  sql: string,
  params: unknown[] = [],
): T | undefined {
  const connection = getConnection();
  const statement = connection.prepare(sql);
  return statement.get(params) as T | undefined;
}

/**
 * Execute an insert statement and return the last insert row ID
 */
export function insert(sql: string, params: unknown[] = []): number {
  const connection = getConnection();
  const statement = connection.prepare(sql);
  const result = statement.run(params);
  return result.lastInsertRowid as number;
}

/**
 * Execute an update or delete statement and return the number of changes
 */
export function execute(sql: string, params: unknown[] = []): number {
  const connection = getConnection();
  const statement = connection.prepare(sql);
  const result = statement.run(params);
  return result.changes;
}
