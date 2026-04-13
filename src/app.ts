import express, { Application, Request, Response, NextFunction } from "express";
import taskRoutes from "./routes/tasks";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { init as initDatabase } from "./database/connection";

/**
 * Create and configure the Express application
 *
 * This module initializes the Express app, configures middleware,
 * registers routes, and sets up error handling.
 *
 * @module app
 */

/**
 * Express application instance
 */
export const app: Application = express();

/**
 * Initialize the database connection
 */
async function initializeDatabase(): Promise<void> {
  try {
    initDatabase();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

/**
 * Configure middleware for the application
 */
function configureMiddleware(): void {
  // JSON parser - parse JSON request bodies
  app.use(express.json());

  // URL-encoded parser - parse URL-encoded request bodies
  app.use(express.urlencoded({ extended: true }));

  // Logging middleware - log incoming requests (development)
  if (process.env.NODE_ENV === "development") {
    app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(
        `${new Date().toISOString()} ${req.method} ${req.originalUrl}`,
      );
      next();
    });
  }
}

/**
 * Register routes for the application
 */
function registerRoutes(): void {
  // Mount task routes at /tasks
  app.use("/tasks", taskRoutes);

  // Health check endpoint
  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Server is running",
      timestamp: new Date().toISOString(),
    });
  });

  // Root endpoint
  app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Welcome to Test-Project API",
      version: "1.0.0",
    });
  });

  // 404 handler for unmatched routes
  app.use(notFoundHandler);
}

/**
 * Register error handling middleware
 * Must be placed after all routes
 */
function registerErrorHandlers(): void {
  // Global error handler
  app.use(errorHandler);
}

/**
 * Initialize the application
 * Configures middleware, registers routes, and initializes the database
 */
export async function initializeApp(): Promise<Application> {
  try {
    // Configure middleware
    configureMiddleware();

    // Register error handlers
    registerErrorHandlers();

    // Register routes
    registerRoutes();

    // Initialize database
    await initializeDatabase();

    console.log("Application initialized successfully");
    return app;
  } catch (error) {
    console.error("Failed to initialize application:", error);
    throw error;
  }
}

// Initialize the app when this module is imported
initializeApp().catch((error) => {
  console.error("Application initialization failed:", error);
  process.exit(1);
});

// Export the app for testing and server.ts
export default app;
