# Task Management API Documentation

## Overview

This is a RESTful API service for managing tasks in a to-do list application. The API provides full CRUD (Create, Read, Update, Delete) operations for tasks with attributes including title, description, due date, and status.

**Base URL:** `http://localhost:3000`

**Content-Type:** All requests and responses use `application/json`

## Authentication

This API currently does not require authentication. All endpoints are publicly accessible.

## Response Format

All API responses follow a consistent JSON structure:

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message",
  "count": 0
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message describing the issue",
  "details": [
    {
      "field": "field.name",
      "message": "Validation error message"
    }
  ]
}
```

## Data Types

### Task Object

| Field         | Type           | Description                                                      |
| ------------- | -------------- | ---------------------------------------------------------------- |
| `id`          | number         | Unique identifier for the task (auto-generated)                  |
| `title`       | string         | Task title (required, 1-200 characters)                          |
| `description` | string \| null | Detailed description of the task (optional, max 1000 characters) |
| `dueDate`     | string \| null | Due date in ISO 8601 format (optional, must be in the future)    |
| `status`      | string         | Current status: `"pending"`, `"in-progress"`, or `"done"`        |
| `createdAt`   | string         | Timestamp when the task was created (ISO 8601)                   |
| `updatedAt`   | string         | Timestamp when the task was last updated (ISO 8601)              |

### Task Status Values

| Status        | Description                           |
| ------------- | ------------------------------------- |
| `pending`     | Task has been created but not started |
| `in-progress` | Task is currently being worked on     |
| `done`        | Task has been completed               |

### CreateTaskDto

Request body for creating a new task.

| Field         | Type           | Required | Description                                         |
| ------------- | -------------- | -------- | --------------------------------------------------- |
| `title`       | string         | Yes      | Task title (1-200 characters)                       |
| `description` | string \| null | No       | Task description (max 1000 characters)              |
| `dueDate`     | string \| null | No       | Due date in ISO 8601 format (must be in the future) |
| `status`      | string         | No       | Initial status (default: `"pending"`)               |

### UpdateTaskDto

Request body for updating an existing task. All fields are optional for partial updates.

| Field         | Type           | Required | Description                              |
| ------------- | -------------- | -------- | ---------------------------------------- |
| `title`       | string         | No       | Updated task title (1-200 characters)    |
| `description` | string \| null | No       | Updated task description                 |
| `dueDate`     | string \| null | No       | Updated due date (must be in the future) |
| `status`      | string         | No       | Updated status                           |

## Endpoints

### 1. List All Tasks

Retrieve a list of all tasks in the system.

**Endpoint:** `GET /tasks`

**Request:**

```http
GET /tasks HTTP/1.1
Host: localhost:3000
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Complete project documentation",
      "description": "Write API docs and README",
      "dueDate": "2026-04-20T10:00:00.000Z",
      "status": "in-progress",
      "createdAt": "2026-04-13T08:00:00.000Z",
      "updatedAt": "2026-04-13T09:00:00.000Z"
    },
    {
      "id": 2,
      "title": "Review pull requests",
      "description": null,
      "dueDate": null,
      "status": "pending",
      "createdAt": "2026-04-13T08:30:00.000Z",
      "updatedAt": "2026-04-13T08:30:00.000Z"
    }
  ],
  "count": 2
}
```

---

### 2. Get Task by ID

Retrieve a single task by its unique identifier.

**Endpoint:** `GET /tasks/:id`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | The unique task identifier (must be a positive integer) |

**Request:**

```http
GET /tasks/1 HTTP/1.1
Host: localhost:3000
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Complete project documentation",
    "description": "Write API docs and README",
    "dueDate": "2026-04-20T10:00:00.000Z",
    "status": "in-progress",
    "createdAt": "2026-04-13T08:00:00.000Z",
    "updatedAt": "2026-04-13T09:00:00.000Z"
  }
}
```

**Response:** `404 Not Found`

```json
{
  "success": false,
  "error": "Task with ID 999 not found"
}
```

**Response:** `400 Bad Request`

```json
{
  "success": false,
  "error": "Invalid task ID. Must be a positive integer."
}
```

---

### 3. Create Task

Create a new task in the system.

**Endpoint:** `POST /tasks`

**Request Body:** `CreateTaskDto`

**Request:**

```http
POST /tasks HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write API docs and README",
  "dueDate": "2026-04-20T10:00:00.000Z",
  "status": "pending"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": 3,
    "title": "Complete project documentation",
    "description": "Write API docs and README",
    "dueDate": "2026-04-20T10:00:00.000Z",
    "status": "pending",
    "createdAt": "2026-04-13T10:00:00.000Z",
    "updatedAt": "2026-04-13T10:00:00.000Z"
  },
  "message": "Task created successfully"
}
```

**Response:** `400 Bad Request` (Validation Error)

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "title",
      "message": "Title is required"
    },
    {
      "field": "dueDate",
      "message": "Due date must be in the future"
    }
  ]
}
```

**Response:** `400 Bad Request` (Missing Title)

```json
{
  "success": false,
  "error": "Title is required"
}
```

---

### 4. Update Task

Update an existing task. All fields in the request body are optional for partial updates.

**Endpoint:** `PUT /tasks/:id`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | The unique task identifier |

**Request Body:** `UpdateTaskDto` (all fields optional)

**Request:**

```http
PUT /tasks/1 HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "status": "done"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Complete project documentation",
    "description": "Write API docs and README",
    "dueDate": "2026-04-20T10:00:00.000Z",
    "status": "done",
    "createdAt": "2026-04-13T08:00:00.000Z",
    "updatedAt": "2026-04-13T10:30:00.000Z"
  },
  "message": "Task updated successfully"
}
```

**Response:** `404 Not Found`

```json
{
  "success": false,
  "error": "Task with ID 999 not found"
}
```

**Response:** `400 Bad Request` (Business Rule Violation)

```json
{
  "success": false,
  "error": "Cannot change status of a completed task. Delete and create a new task if needed."
}
```

---

### 5. Delete Task

Delete a task from the system.

**Endpoint:** `DELETE /tasks/:id`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | The unique task identifier |

**Request:**

```http
DELETE /tasks/1 HTTP/1.1
Host: localhost:3000
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Task with ID 1 deleted successfully",
  "data": null
}
```

**Response:** `404 Not Found`

```json
{
  "success": false,
  "error": "Task with ID 999 not found"
}
```

---

## Error Codes

| HTTP Status Code            | Description        | When                                                        |
| --------------------------- | ------------------ | ----------------------------------------------------------- |
| `200 OK`                    | Success            | Request completed successfully                              |
| `201 Created`               | Resource created   | New task created successfully                               |
| `400 Bad Request`           | Invalid request    | Validation error, invalid input, or business rule violation |
| `404 Not Found`             | Resource not found | Task with specified ID does not exist                       |
| `500 Internal Server Error` | Server error       | Unexpected server-side error                                |

## Validation Rules

### Title

- Required for task creation
- Minimum 1 character
- Maximum 200 characters
- Leading and trailing whitespace is trimmed

### Description

- Optional
- Maximum 1000 characters

### Due Date

- Optional
- Must be in ISO 8601 format (e.g., `"2026-04-20T10:00:00.000Z"`)
- Must be in the future (greater than current date/time)

### Status

- Must be one of: `"pending"`, `"in-progress"`, `"done"`
- Default value when creating: `"pending"`
- Cannot change status from `"done"` to any other status (business rule)

## Business Rules

1. **Task ID Validation:** All task IDs must be positive integers.
2. **Title Requirement:** A task cannot be created without a title.
3. **Due Date Constraint:** Due dates must be in the future.
4. **Status Transition:** Once a task is marked as `"done"`, its status cannot be changed. To modify a completed task, delete it and create a new one.

## Examples

### cURL Examples

```bash
# List all tasks
curl http://localhost:3000/tasks

# Get a single task
curl http://localhost:3000/tasks/1

# Create a new task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn TypeScript",
    "description": "Complete the TypeScript tutorial",
    "dueDate": "2026-05-01T00:00:00.000Z",
    "status": "pending"
  }'

# Update a task (partial update)
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress"
  }'

# Delete a task
curl -X DELETE http://localhost:3000/tasks/1
```

### JavaScript Fetch Examples

```javascript
// List all tasks
const response = await fetch("http://localhost:3000/tasks");
const data = await response.json();

// Create a new task
const newTask = await fetch("http://localhost:3000/tasks", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "New Task",
    description: "Task description",
    dueDate: "2026-05-01T00:00:00.000Z",
  }),
});
const created = await newTask.json();

// Update a task
const updated = await fetch("http://localhost:3000/tasks/1", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ status: "done" }),
});
const result = await updated.json();

// Delete a task
const deleted = await fetch("http://localhost:3000/tasks/1", {
  method: "DELETE",
});
const confirmation = await deleted.json();
```

## Rate Limiting

Currently, no rate limiting is implemented. This may be added in future versions.

## Versioning

This API is currently at version 1.0.0. Version information will be included in the URL path in future versions (e.g., `/api/v1/tasks`).
