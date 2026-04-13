import {
  findAll,
  findById,
  insertTask,
  updateTask,
  deleteTask,
} from "../../src/repositories/taskRepository";
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskStatus,
} from "../../src/types";
import {
  query,
  queryOne,
  insert,
  execute,
} from "../../src/database/connection";

// Mock the database functions
jest.mock("../../src/database/connection", () => ({
  query: jest.fn(),
  queryOne: jest.fn(),
  insert: jest.fn(),
  execute: jest.fn(),
}));

describe("Task Repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return all tasks ordered by createdAt DESC", async () => {
      const mockTasks: Task[] = [
        {
          id: 1,
          title: "Task 1",
          description: "Description 1",
          dueDate: null,
          status: TaskStatus.PENDING,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
        {
          id: 2,
          title: "Task 2",
          description: null,
          dueDate: new Date("2024-12-31"),
          status: TaskStatus.IN_PROGRESS,
          createdAt: new Date("2024-01-02"),
          updatedAt: new Date("2024-01-02"),
        },
      ];

      (query as jest.Mock).mockReturnValue(mockTasks);

      const result = await findAll();

      expect(query).toHaveBeenCalledWith(
        "SELECT * FROM tasks ORDER BY createdAt DESC",
      );
      expect(result).toEqual(mockTasks);
    });

    it("should return an empty array when no tasks exist", async () => {
      (query as jest.Mock).mockReturnValue([]);

      const result = await findAll();

      expect(result).toEqual([]);
    });

    it("should reject with an error when database query fails", async () => {
      const dbError = new Error("Database connection failed");
      (query as jest.Mock).mockImplementation(() => {
        throw dbError;
      });

      await expect(findAll()).rejects.toThrow(
        "Failed to fetch all tasks: Database connection failed",
      );
    });
  });

  describe("findById", () => {
    it("should return a task when found", async () => {
      const mockTask: Task = {
        id: 1,
        title: "Test Task",
        description: "Test Description",
        dueDate: null,
        status: TaskStatus.PENDING,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      };

      (queryOne as jest.Mock).mockReturnValue(mockTask);

      const result = await findById(1);

      expect(queryOne).toHaveBeenCalledWith(
        "SELECT * FROM tasks WHERE id = ?",
        [1],
      );
      expect(result).toEqual(mockTask);
    });

    it("should return null when task is not found", async () => {
      (queryOne as jest.Mock).mockReturnValue(undefined);

      const result = await findById(999);

      expect(result).toBeNull();
    });

    it("should reject with an error when database query fails", async () => {
      const dbError = new Error("Database query failed");
      (queryOne as jest.Mock).mockImplementation(() => {
        throw dbError;
      });

      await expect(findById(1)).rejects.toThrow(
        "Failed to fetch task with ID 1: Database query failed",
      );
    });
  });

  describe("insertTask", () => {
    it("should insert a new task and return the ID", async () => {
      const newTask: CreateTaskDto = {
        title: "New Task",
        description: "New Description",
        dueDate: null,
        status: TaskStatus.PENDING,
      };

      (insert as jest.Mock).mockReturnValue(42);

      const result = await insertTask(newTask);

      expect(insert).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO tasks"),
        ["New Task", "New Description", null, "pending"],
      );
      expect(result).toBe(42);
    });

    it("should use default status 'pending' when not provided", async () => {
      const newTask: CreateTaskDto = {
        title: "New Task",
        description: "New Description",
      };

      (insert as jest.Mock).mockReturnValue(43);

      const result = await insertTask(newTask);

      expect(insert).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO tasks"),
        ["New Task", "New Description", null, "pending"],
      );
      expect(result).toBe(43);
    });

    it("should insert task with description as null when not provided", async () => {
      const newTask: CreateTaskDto = {
        title: "New Task",
      };

      (insert as jest.Mock).mockReturnValue(44);

      const result = await insertTask(newTask);

      expect(insert).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO tasks"),
        ["New Task", null, null, "pending"],
      );
      expect(result).toBe(44);
    });

    it("should reject with an error when database insert fails", async () => {
      const dbError = new Error("Constraint violation");
      (insert as jest.Mock).mockImplementation(() => {
        throw dbError;
      });

      const newTask: CreateTaskDto = {
        title: "New Task",
      };

      await expect(insertTask(newTask)).rejects.toThrow(
        "Failed to insert task: Constraint violation",
      );
    });
  });

  describe("updateTask", () => {
    it("should update all provided fields and return affected rows", async () => {
      const updateData: UpdateTaskDto = {
        title: "Updated Title",
        description: "Updated Description",
        dueDate: null,
        status: TaskStatus.IN_PROGRESS,
      };

      (execute as jest.Mock).mockReturnValue(1);

      const result = await updateTask(1, updateData);

      expect(execute).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE tasks SET"),
        expect.arrayContaining([
          "Updated Title",
          "Updated Description",
          null,
          "in-progress",
          1,
        ]),
      );
      expect(result).toBe(1);
    });

    it("should only update provided fields", async () => {
      const updateData: UpdateTaskDto = {
        title: "Updated Title",
      };

      (execute as jest.Mock).mockReturnValue(1);

      const result = await updateTask(1, updateData);

      expect(execute).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE tasks SET title = ?"),
        expect.arrayContaining(["Updated Title", 1]),
      );
      expect(result).toBe(1);
    });

    it("should include updatedAt timestamp in the update", async () => {
      const updateData: UpdateTaskDto = {
        status: TaskStatus.DONE,
      };

      (execute as jest.Mock).mockReturnValue(1);

      await updateTask(1, updateData);

      expect(execute).toHaveBeenCalledWith(
        expect.stringContaining("updatedAt = datetime"),
        expect.any(Array),
      );
    });

    it("should return 0 when no fields to update", async () => {
      const updateData: UpdateTaskDto = {};

      const result = await updateTask(1, updateData);

      expect(execute).not.toHaveBeenCalled();
      expect(result).toBe(0);
    });

    it("should return 0 when task does not exist (no affected rows)", async () => {
      const updateData: UpdateTaskDto = {
        title: "Updated Title",
      };

      (execute as jest.Mock).mockReturnValue(0);

      const result = await updateTask(999, updateData);

      expect(result).toBe(0);
    });

    it("should reject with an error when database update fails", async () => {
      const dbError = new Error("Foreign key constraint failed");
      (execute as jest.Mock).mockImplementation(() => {
        throw dbError;
      });

      const updateData: UpdateTaskDto = {
        title: "Updated Title",
      };

      await expect(updateTask(1, updateData)).rejects.toThrow(
        "Failed to update task with ID 1: Foreign key constraint failed",
      );
    });
  });

  describe("deleteTask", () => {
    it("should delete a task and return 1 when successful", async () => {
      (execute as jest.Mock).mockReturnValue(1);

      const result = await deleteTask(1);

      expect(execute).toHaveBeenCalledWith(
        "DELETE FROM tasks WHERE id = ?",
        [1],
      );
      expect(result).toBe(1);
    });

    it("should return 0 when task does not exist", async () => {
      (execute as jest.Mock).mockReturnValue(0);

      const result = await deleteTask(999);

      expect(result).toBe(0);
    });

    it("should reject with an error when database delete fails", async () => {
      const dbError = new Error("Database error");
      (execute as jest.Mock).mockImplementation(() => {
        throw dbError;
      });

      await expect(deleteTask(1)).rejects.toThrow(
        "Failed to delete task with ID 1: Database error",
      );
    });
  });
});
