# test-project

## Overview

This system is a RESTful API service for a to-do list application that enables users to manage tasks with full CRUD operations. The system provides endpoints to create, read, update, and delete tasks, each containing a title, description, due date, and status. The architecture follows a layered pattern with clear separation of concerns, enabling maintainability and testability.

**Key Requirements:**
- REST API for task management
- CRUD operations (Create, Read, Update, Delete)
- Task attributes: title, description, due date, status
- Status values: pending, in-progress, done
- SQLite database for persistence
- TypeScript for type safety


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


---

This project is managed by the SDLC Pipeline. Implementation tasks are tracked as GitHub/GitLab issues.
Each issue is solved by an autonomous agent on its own branch with a pull request.