# AGENTS.md — test-project

This file describes the project for AI agents working on implementation issues.

## Project Context

Project: test-project

## Architecture

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
  - `init(): Promise<v

[... truncated for brevity ...]

## Working Guidelines

- Read this file and README.md before starting any work
- Follow existing code patterns and conventions
- Write clean, production-quality code with proper error handling
- Create or update tests if a testing setup exists
- Do NOT run git commands — the pipeline handles commits and pushes
- Do NOT ask questions — you are running in an automated pipeline