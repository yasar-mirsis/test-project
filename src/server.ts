import { app } from "./app";
import { close as closeDatabase } from "./database/connection";
import { Server } from "http";

/**
 * Server entry point for the Test-Project API
 *
 * This module imports the Express application, starts the HTTP server
 * on a configurable port, and handles graceful shutdown.
 *
 * @module server
 */

/**
 * Default server port
 */
const DEFAULT_PORT = 3000;

/**
 * HTTP server instance
 */
let server: Server | null = null;

/**
 * Get the server port from environment variables or use default
 */
function getPort(): number {
  const port = parseInt(process.env.PORT || "", 10);
  return Number.isInteger(port) && port > 0 ? port : DEFAULT_PORT;
}

/**
 * Start the HTTP server
 */
function startServer(): void {
  const port = getPort();

  server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`API endpoints available at http://localhost:${port}`);
  });
}

/**
 * Handle graceful shutdown
 * Closes the server and database connections cleanly
 */
function handleShutdown(signal: string): void {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  if (server) {
    server.close(() => {
      console.log("HTTP server closed");

      // Close database connection
      closeDatabase();
      console.log("Database connection closed");

      console.log("Graceful shutdown completed");
      process.exit(0);
    });
  } else {
    // Server wasn't running, just close database and exit
    closeDatabase();
    console.log("Database connection closed");
    process.exit(0);
  }

  // Force shutdown after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
}

// Start the server
startServer();

// Register graceful shutdown handlers
process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  if (server) {
    server.close(() => {
      closeDatabase();
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  if (server) {
    server.close(() => {
      closeDatabase();
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

export default app;
