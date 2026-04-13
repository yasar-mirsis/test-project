# Test Project - Task Management API

A RESTful API service for managing tasks in a to-do list application. Built with TypeScript, Express.js, and SQLite.

## Overview

This system provides a complete CRUD (Create, Read, Update, Delete) API for task management. Each task contains a title, description, due date, and status. The architecture follows a layered pattern with clear separation of concerns, enabling maintainability and testability.

### Key Features

- REST API for task management
- Full CRUD operations
- Task attributes: title, description, due date, status
- Status values: `pending`, `in-progress`, `done`
- SQLite database for persistence
- TypeScript for type safety
- Zod validation for runtime type checking
- Comprehensive error handling

## Technology Stack

| Technology            | Purpose                       |
| --------------------- | ----------------------------- |
| **Node.js**           | Runtime environment           |
| **Express.js**        | Web framework                 |
| **TypeScript**        | Type-safe development         |
| **SQLite**            | Database (zero-configuration) |
| **better-sqlite3**    | SQLite driver                 |
| **Zod**               | Runtime validation            |
| **Jest**              | Testing framework             |
| **ESLint + Prettier** | Code quality                  |

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Git

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-org/test-project.git
cd test-project
```

2. Install dependencies:

```bash
npm install
```

3. Build the TypeScript code:

```bash
npm run build
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory (optional - defaults are provided):

```env
# Server Configuration
PORT=3000
HOST=localhost

# Database Configuration
DATABASE_PATH=./data/tasks.db

# Optional: Enable debug mode
DEBUG=true
```

| Variable        | Default           | Description                  |
| --------------- | ----------------- | ---------------------------- |
| `PORT`          | `3000`            | Server port number           |
| `HOST`          | `localhost`       | Server host address          |
| `DATABASE_PATH` | `./data/tasks.db` | Path to SQLite database file |
| `DEBUG`         | `false`           | Enable debug logging         |

## Running the Application

### Development Mode

Run the application in development mode with hot-reload:

```bash
npm run dev
```

### Production Mode

Build and run in production mode:

```bash
npm run build
npm start
```

### Test Mode

Run tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

## Project Structure

```
test-project/
├── src/
│   ├── controllers/      # Request handlers
│   │   └── taskController.ts
│   ├── database/         # Database connection
│   │   └── connection.ts
│   ├── middleware/       # Express middleware
│   │   └── validation.ts
│   ├── repositories/     # Data access layer
│   │   └── taskRepository.ts
│   ├── routes/           # Route definitions
│   │   └── tasks.ts
│   ├── services/         # Business logic
│   │   └── taskService.ts
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   ├── app.ts            # Express app configuration
│   └── server.ts         # Server entry point
├── tests/                # Test files
├── docs/                 # API documentation
│   └── API.md
├── data/                 # SQLite database (auto-created)
├── .env                  # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## API Endpoints

| Method   | Endpoint     | Description       |
| -------- | ------------ | ----------------- |
| `GET`    | `/tasks`     | List all tasks    |
| `GET`    | `/tasks/:id` | Get a single task |
| `POST`   | `/tasks`     | Create a new task |
| `PUT`    | `/tasks/:id` | Update a task     |
| `DELETE` | `/tasks/:id` | Delete a task     |

For detailed API documentation, see [docs/API.md](docs/API.md).

## Usage Examples

### Creating a Task

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write API docs and README",
    "dueDate": "2026-04-20T10:00:00.000Z",
    "status": "pending"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Complete project documentation",
    "description": "Write API docs and README",
    "dueDate": "2026-04-20T10:00:00.000Z",
    "status": "pending",
    "createdAt": "2026-04-13T08:00:00.000Z",
    "updatedAt": "2026-04-13T08:00:00.000Z"
  },
  "message": "Task created successfully"
}
```

### Getting All Tasks

```bash
curl http://localhost:3000/tasks
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Complete project documentation",
      "description": "Write API docs and README",
      "dueDate": "2026-04-20T10:00:00.000Z",
      "status": "pending",
      "createdAt": "2026-04-13T08:00:00.000Z",
      "updatedAt": "2026-04-13T08:00:00.000Z"
    }
  ],
  "count": 1
}
```

### Updating a Task

```bash
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress"
  }'
```

### Deleting a Task

```bash
curl -X DELETE http://localhost:3000/tasks/1
```

## Available Scripts

| Command                 | Description                              |
| ----------------------- | ---------------------------------------- |
| `npm install`           | Install dependencies                     |
| `npm start`             | Start production server                  |
| `npm run dev`           | Start development server with hot-reload |
| `npm run build`         | Compile TypeScript to JavaScript         |
| `npm run clean`         | Remove build artifacts                   |
| `npm test`              | Run tests                                |
| `npm run test:coverage` | Run tests with coverage report           |
| `npm run lint`          | Run ESLint                               |
| `npm run lint:fix`      | Run ESLint with auto-fix                 |
| `npm run format`        | Format code with Prettier                |

## Architecture

The application follows a layered architecture pattern:

1. **Routes Layer** - Defines HTTP endpoints and routes requests
2. **Controllers Layer** - Handles request/response logic and validation
3. **Services Layer** - Contains business logic and data validation
4. **Repositories Layer** - Direct database operations
5. **Database Layer** - SQLite connection and query utilities

For detailed architecture documentation, see [AGENTS.md](AGENTS.md).

## Validation Rules

- **Title**: Required, 1-200 characters
- **Description**: Optional, max 1000 characters
- **Due Date**: Optional, must be in ISO 8601 format and in the future
- **Status**: Must be `pending`, `in-progress`, or `done`

## Business Rules

- Task IDs must be positive integers
- A task cannot be created without a title
- Due dates must be in the future
- Once a task is marked as `done`, its status cannot be changed

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

---

This project is managed by the SDLC Pipeline. Implementation tasks are tracked as GitHub/GitLab issues.
Each issue is solved by an autonomous agent on its own branch with a pull request.
