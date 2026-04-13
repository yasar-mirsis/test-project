# Test-Project Architecture Document

## System Overview

This system is a RESTful API service for a to-do list application that enables users to manage tasks with full CRUD operations. The system provides endpoints to create, read, update, and delete tasks, each containing a title, description, due date, and status. The architecture follows a layered pattern with clear separation of concerns, enabling maintainability and testability.

**Key Requirements:**
- REST API for task management
- CRUD operations (Create, Read, Update, Delete)
- Task attributes: title, description, due date, status
- Status values: pending, in-progress, done
- SQLite database for persistence
- TypeScript for type safety

## Components

### 1. Express Server (Entry Point)
- **Responsibility:** Bootstrap the application, configure middleware, register routes
- **Interfaces:** 
  - `app: Express` - Express application instance
  - `listen(port: number): void` - Start server

### 2. Routes Layer (`/routes/tasks.ts`)
- **Responsibility:** Define HTTP endpoints, route requests to controllers, handle URL parameters
- **Interfaces:**
  - `GET /tasks` - List all tasks
  - `GET /tasks/:id` - Get single task
  - `POST /tasks` - Create task
  - `PUT /tasks/:id` - Update task
  - `DELETE /tasks/:id` - Delete task

### 3. Controllers Layer (`/controllers/taskController.ts`)
- **Responsibility:** Handle request/response logic, validate input, call services, format responses
- **Interfaces:**
  - `getAllTasks(req, res)` - Return all tasks
  - `getTaskById(req, res)` - Return single task or 404
  - `createTask(req, res)` - Create and return new task
  - `updateTask(req, res)` - Update and return modified task
  - `deleteTask(req, res)` - Delete task and return confirmation

### 4. Services Layer (`/services/taskService.ts`)
- **Responsibility:** Business logic, data validation, orchestrating data access
- **Interfaces:**
  - `findAll(): Promise<Task[]>` - Fetch all tasks
  - `findById(id: number): Promise<Task | null>` - Find task by ID
  - `create(data: CreateTaskDto): Promise<Task>` - Create new task
  - `update(id: number, data: UpdateTaskDto): Promise<Task | null>` - Update task
  - `delete(id: number): Promise<boolean>` - Delete task

### 5. Data Access Layer (`/repositories/taskRepository.ts`)
- **Responsibility:** Direct database operations, SQL queries, transaction management
- **Interfaces:**
  - `findAll(): Promise<Task[]>` - SELECT * FROM tasks
  - `findById(id: number): Promise<Task | null>` - SELECT * FROM tasks WHERE id = ?
  - `insert(task: CreateTaskDto): Promise<number>` - INSERT and return ID
  - `update(id: number, task: UpdateTaskDto): Promise<number>` - UPDATE WHERE id = ?
  - `delete(id: number): Promise<number>` - DELETE WHERE id = ?

### 6. Database Manager (`/database/connection.ts`)
- **Responsibility:** Initialize SQLite connection, provide query execution utilities
- **Interfaces:**
  - `getConnection(): Database` - Get database instance
  - `init(): Promise<void>` - Initialize database schema

### 7. Middleware (`/middleware/`)
- **ResponseHandler:** Standardize API responses
- **ErrorHandler:** Catch and format errors consistently
- **Validation:** Request body validation using Zod or Joi

## Data Model

### Entity: Task

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | INTEGER | Auto-generated | Primary key, auto-increment |
| title | TEXT | Yes | Task title (max 255 chars) |
| description | TEXT | No | Task description (max 5000 chars) |
| dueDate | TEXT | No | ISO 8601 date string |
| status | TEXT | Yes | Enum: 'pending', 'in-progress', 'done' |
| createdAt | TEXT | Auto-generated | ISO 8601 timestamp |
| updatedAt | TEXT | Auto-generated | ISO 8601 timestamp |

### Relationships

```
Task (singular entity, no relationships)
```

### Database Schema (SQLite)

```sql
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    dueDate TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in-progress', 'done')),
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(dueDate);
```

## API Contracts

### Base URL: `/api/v1`

---

### 1. List All Tasks
- **Method:** `GET`
- **Path:** `/api/v1/tasks`
- **Query Parameters:**
  - `status` (optional): Filter by status (pending, in-progress, done)
  - `limit` (optional): Max results (default: 100)
  - `offset` (optional): Pagination offset (default: 0)
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Complete project",
      "description": "Finish the architecture document",
      "dueDate": "2026-04-20T00:00:00.000Z",
      "status": "in-progress",
      "createdAt": "2026-04-13T10:00:00.000Z",
      "updatedAt": "2026-04-13T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 100,
    "offset": 0
  }
}
```

---

### 2. Get Task by ID
- **Method:** `GET`
- **Path:** `/api/v1/tasks/:id`
- **Path Parameters:**
  - `id` (required): Task ID (integer)
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Complete project",
    "description": "Finish the architecture document",
    "dueDate": "2026-04-20T00:00:00.000Z",
    "status": "in-progress",
    "createdAt": "2026-04-13T10:00:00.000Z",
    "updatedAt": "2026-04-13T10:00:00.000Z"
  }
}
```
- **Response:** `404 Not Found`
```json
{
  "success": false,
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task with ID 999 not found"
  }
}
```

---

### 3. Create Task
- **Method:** `POST`
- **Path:** `/api/v1/tasks`
- **Request Body:**
```json
{
  "title": "Complete project",
  "description": "Finish the architecture document",
  "dueDate": "2026-04-20T00:00:00.000Z",
  "status": "pending"
}
```
- **Validation Rules:**
  - `title`: required, string, max 255 chars
  - `description`: optional, string, max 5000 chars
  - `dueDate`: optional, valid ISO 8601 date
  - `status`: optional, enum ['pending', 'in-progress', 'done'], default 'pending'
- **Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 2,
    "title": "Complete project",
    "description": "Finish the architecture document",
    "dueDate": "2026-04-20T00:00:00.000Z",
    "status": "pending",
    "createdAt": "2026-04-13T12:00:00.000Z",
    "updatedAt": "2026-04-13T12:00:00.000Z"
  }
}
```
- **Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {"field": "title", "message": "Title is required"}
    ]
  }
}
```

---

### 4. Update Task
- **Method:** `PUT`
- **Path:** `/api/v1/tasks/:id`
- **Path Parameters:**
  - `id` (required): Task ID
- **Request Body:**
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "dueDate": "2026-04-25T00:00:00.000Z",
  "status": "done"
}
```
- **Note:** All fields optional; only provided fields are updated
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Updated task title",
    "description": "Updated description",
    "dueDate": "2026-04-25T00:00:00.000Z",
    "status": "done",
    "createdAt": "2026-04-13T10:00:00.000Z",
    "updatedAt": "2026-04-13T14:00:00.000Z"
  }
}
```

---

### 5. Delete Task
- **Method:** `DELETE`
- **Path:** `/api/v1/tasks/:id`
- **Path Parameters:**
  - `id` (required): Task ID
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": null
}
```

## Technology Stack

| Technology | Purpose | Justification |
|------------|---------|---------------|
| **Node.js** | Runtime environment | Mature, extensive ecosystem, excellent for I/O-bound APIs |
| **Express.js** | Web framework | Lightweight, minimal overhead, industry standard for Node.js APIs |
| **TypeScript** | Programming language | Type safety, better IDE support, refactoring safety, catches errors at compile time |
| **SQLite** | Database | Zero-configuration, serverless, ideal for simple apps and development; single file storage |
| **better-sqlite3** | SQLite driver | Synchronous API, better performance, type-safe queries |
| **Zod** | Validation | TypeScript-first schema validation, runtime type checking |
| **Jest** | Testing framework | Excellent TypeScript support, mocking capabilities, fast execution |
| **ESLint + Prettier** | Code quality | Consistent code style, catches common errors |

## Data Flow

### Request Lifecycle (Create Task Example)

1. **Client Request**
   - Client sends `POST /api/v1/tasks` with JSON body

2. **Express Middleware**
   - `cors()` middleware handles cross-origin requests
   - `json()` middleware parses request body
   - `morgan()` middleware logs request

3. **Routing Layer**
   - Express matches route pattern `POST /tasks`
   - Route handler invokes `createTask` controller

4. **Controller Layer**
   - Extract `id`, `body` from request
   - Validate request body using Zod schema
   - Call `taskService.create(validatedData)`

5. **Service Layer**
   - Apply business logic (e.g., status transitions)
   - Sanitize input data
   - Call `taskRepository.insert(data)`

6. **Repository Layer**
   - Execute SQL: `INSERT INTO tasks (...) VALUES (...)`
   - Return inserted row ID
   - Fetch created task: `SELECT * FROM tasks WHERE id = ?`

7. **Database Layer**
   - SQLite executes query
   - Returns result set

8. **Response Assembly**
   - Repository returns Task entity
   - Service wraps and returns
   - Controller formats response with success wrapper
   - Express sends JSON response to client

### Error Flow

1. Error thrown at any layer
2. Error propagates up to Express error handler
3. `ErrorHandler` middleware catches error
4. Error transformed to standard error format
5. Appropriate HTTP status code sent
6. Error logged for debugging

## Security Considerations

### 1. Input Validation
- All incoming data validated using Zod schemas
- Type coercion prevents injection attacks
- Maximum field lengths prevent buffer overflow

### 2. SQL Injection Prevention
- Parameterized queries using better-sqlite3
- No string concatenation in SQL statements
- Prepared statements for all queries

### 3. Rate Limiting
- Implement `express-rate-limit` middleware
- Default: 100 requests per 15 minutes per IP
- Prevents brute force and DDoS attacks

### 4. CORS Configuration
- Restrict allowed origins to known domains
- Configure allowed methods and headers
- Disable credentials unless needed

### 5. Error Handling
- Never expose internal error details to clients
- Log full errors server-side only
- Return generic error messages to users

### 6. Data Privacy
- No sensitive data stored (no authentication currently)
- SQLite file permissions restricted
- Database file not committed to version control

### 7. Dependency Security
- Regular `npm audit` for vulnerability scanning
- Pin dependency versions in package-lock.json
- Use only well-maintained packages with active communities

## Scalability Notes

### Current Architecture Limitations

1. **Single SQLite Database**
   - SQLite is file-based, limiting concurrent writes
   - Not suitable for high-traffic production scenarios
   - Solution: Migrate to PostgreSQL/MySQL for scaling

2. **Monolithic Deployment**
   - All components in single process
   - Hard to scale individual components
   - Solution: Consider microservices for large-scale

### Scaling Strategies

1. **Vertical Scaling**
   - Increase server resources (CPU, RAM)
   - Easiest initial approach for growing traffic

2. **Read Replicas**
   - For SQLite: Create read-only copies
   - Route read operations to replicas
   - Write operations go to primary

3. **Caching Layer**
   - Add Redis for frequently accessed data
   - Cache task lists by user/status
   - Reduce database queries significantly

4. **Load Balancing**
   - Deploy multiple instances behind load balancer
   - Session affinity not needed (stateless API)
   - Use sticky sessions if file-based state required

5. **Database Migration Path**
   - Design repository pattern for easy database swap
   - Abstract database-specific operations
   - Target PostgreSQL for production scaling

### Performance Optimization

1. **Database Indexes**
   - Index on `status` for filtered queries
   - Index on `dueDate` for date-range queries
   - Consider composite indexes for common query patterns

2. **Query Optimization**
   - Use pagination to limit result sets
   - Select only needed fields
   - Avoid N+1 query patterns

3. **Async Processing**
   - Offload heavy operations to worker queues
   - Use Bull or Agenda for background jobs
   - Implement for future features like notifications

### Monitoring Recommendations

1. **Application Performance Monitoring (APM)**
   - Track request latency, error rates
   - Monitor database query performance
   - Set up alerts for anomalies

2. **Logging**
   - Structured JSON logs for easy parsing
   - Correlation IDs for request tracing
   - Log levels: error, warn, info, debug

3. **Health Checks**
   - `/health` endpoint for load balancer probes
   - Check database connectivity
   - Report system status
