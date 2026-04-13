import * as taskRepository from "../../src/repositories/taskRepository";
import {
  findAll,
  findById,
  create,
  update,
  deleteTask,
  ValidationError,
  BusinessRuleError,
} from "../../src/services/taskService";
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskStatus,
} from "../../src/types";

// Mock the repository functions
jest.mock("../../src/repositories/taskRepository", () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  insertTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
}));

describe("Task Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return all tasks from repository", async () => {
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

      (taskRepository.findAll as jest.Mock).mockResolvedValue(mockTasks);

      const result = await findAll();

      expect(taskRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockTasks);
    });

    it("should throw an error when repository fails", async () => {
      const repoError = new Error("Database connection failed");
      (taskRepository.findAll as jest.Mock).mockRejectedValue(repoError);

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

      (taskRepository.findById as jest.Mock).mockResolvedValue(mockTask);

      const result = await findById(1);

      expect(taskRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockTask);
    });

    it("should return null when task is not found", async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await findById(999);

      expect(result).toBeNull();
    });

    it("should throw ValidationError for invalid ID (non-integer)", async () => {
      await expect(findById(1.5 as unknown as number)).rejects.toThrow(
        ValidationError,
      );
      await expect(findById(1.5 as unknown as number)).rejects.toThrow(
        "Task ID must be a positive integer",
      );
    });

    it("should throw ValidationError for invalid ID (negative)", async () => {
      await expect(findById(-1)).rejects.toThrow(ValidationError);
      await expect(findById(-1)).rejects.toThrow(
        "Task ID must be a positive integer",
      );
    });

    it("should throw ValidationError for invalid ID (zero)", async () => {
      await expect(findById(0)).rejects.toThrow(ValidationError);
      await expect(findById(0)).rejects.toThrow(
        "Task ID must be a positive integer",
      );
    });

    it("should rethrow ValidationError from repository", async () => {
      const validationError = new ValidationError(
        "Repository validation error",
      );
      (taskRepository.findById as jest.Mock).mockRejectedValue(validationError);

      await expect(findById(1)).rejects.toThrow(ValidationError);
    });
  });

  describe("create", () => {
    const mockCreatedTask: Task = {
      id: 1,
      title: "New Task",
      description: "New Description",
      dueDate: null,
      status: TaskStatus.PENDING,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    };

    it("should create a task with valid data", async () => {
      const newTask: CreateTaskDto = {
        title: "New Task",
        description: "New Description",
      };

      (taskRepository.insertTask as jest.Mock).mockResolvedValue(1);
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockCreatedTask);

      const result = await create(newTask);

      expect(taskRepository.insertTask).toHaveBeenCalledWith(newTask);
      expect(taskRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCreatedTask);
    });

    it("should create a task with default status when not provided", async () => {
      const newTask: CreateTaskDto = {
        title: "New Task",
      };

      (taskRepository.insertTask as jest.Mock).mockResolvedValue(2);
      (taskRepository.findById as jest.Mock).mockResolvedValue({
        ...mockCreatedTask,
        id: 2,
        status: TaskStatus.PENDING,
      });

      const result = await create(newTask);

      expect(taskRepository.insertTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Task",
        }),
      );
      expect(result.status).toBe(TaskStatus.PENDING);
    });

    it("should create a task with explicit status", async () => {
      const newTask: CreateTaskDto = {
        title: "New Task",
        status: TaskStatus.IN_PROGRESS,
      };

      (taskRepository.insertTask as jest.Mock).mockResolvedValue(3);
      (taskRepository.findById as jest.Mock).mockResolvedValue({
        ...mockCreatedTask,
        id: 3,
        status: TaskStatus.IN_PROGRESS,
      });

      const result = await create(newTask);

      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it("should throw ValidationError for empty title", async () => {
      const newTask: CreateTaskDto = {
        title: "",
      };

      await expect(create(newTask)).rejects.toThrow(ValidationError);
      await expect(create(newTask)).rejects.toThrow(
        "Title is required and cannot be empty",
      );
    });

    it("should throw ValidationError for whitespace-only title", async () => {
      const newTask: CreateTaskDto = {
        title: "   ",
      };

      await expect(create(newTask)).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError for title exceeding 200 characters", async () => {
      const newTask: CreateTaskDto = {
        title: "a".repeat(201),
      };

      await expect(create(newTask)).rejects.toThrow(ValidationError);
      await expect(create(newTask)).rejects.toThrow(
        "Title must not exceed 200 characters",
      );
    });

    it("should throw ValidationError for invalid status", async () => {
      const newTask: CreateTaskDto = {
        title: "New Task",
        status: "invalid-status" as unknown as TaskStatus,
      };

      await expect(create(newTask)).rejects.toThrow(ValidationError);
      await expect(create(newTask)).rejects.toThrow("Invalid status");
    });

    it("should throw ValidationError when task creation fails to retrieve", async () => {
      const newTask: CreateTaskDto = {
        title: "New Task",
      };

      (taskRepository.insertTask as jest.Mock).mockResolvedValue(999);
      (taskRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(create(newTask)).rejects.toThrow(
        "Failed to retrieve created task",
      );
    });

    it("should throw error when repository insert fails", async () => {
      const newTask: CreateTaskDto = {
        title: "New Task",
      };

      const repoError = new Error("Database error");
      (taskRepository.insertTask as jest.Mock).mockRejectedValue(repoError);

      await expect(create(newTask)).rejects.toThrow(
        "Failed to create task: Database error",
      );
    });

    it("should handle Zod validation errors properly", async () => {
      const newTask: CreateTaskDto = {
        title: "",
        description: "a".repeat(1001),
      };

      await expect(create(newTask)).rejects.toThrow(ValidationError);
      await expect(create(newTask)).rejects.toThrow("Validation failed");
    });
  });

  describe("update", () => {
    const existingTask: Task = {
      id: 1,
      title: "Existing Task",
      description: "Existing Description",
      dueDate: null,
      status: TaskStatus.PENDING,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    };

    it("should update a task with valid data", async () => {
      const updateData: UpdateTaskDto = {
        title: "Updated Title",
        description: "Updated Description",
      };

      (
        taskRepository.findById as jest.MockedFunction<
          typeof taskRepository.findById
        >
      )
        .mockResolvedValueOnce(existingTask)
        .mockResolvedValueOnce({
          ...existingTask,
          title: "Updated Title",
          description: "Updated Description",
        });
      (taskRepository.updateTask as jest.Mock).mockResolvedValue(1);

      const result = await update(1, updateData);

      expect(taskRepository.findById).toHaveBeenCalledWith(1);
      expect(taskRepository.updateTask).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual({
        ...existingTask,
        title: "Updated Title",
        description: "Updated Description",
      });
    });

    it("should return null when task does not exist", async () => {
      const updateData: UpdateTaskDto = {
        title: "Updated Title",
      };

      (taskRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await update(999, updateData);

      expect(result).toBeNull();
      expect(taskRepository.updateTask).not.toHaveBeenCalled();
    });

    it("should update only provided fields", async () => {
      (taskRepository.findById as jest.Mock)
        .mockResolvedValueOnce(existingTask)
        .mockResolvedValueOnce({
          ...existingTask,
          title: "Updated Title",
        });
      (taskRepository.updateTask as jest.Mock).mockResolvedValue(1);

      const result = await update(1, { title: "Updated Title" });

      expect(taskRepository.updateTask).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          title: "Updated Title",
        }),
      );
      expect(result?.title).toBe("Updated Title");
    });

    it("should throw ValidationError for empty title update", async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(existingTask);

      await expect(update(1, { title: "" })).rejects.toThrow(ValidationError);
      await expect(update(1, { title: "" })).rejects.toThrow(
        "Title is required and cannot be empty",
      );
    });

    it("should throw ValidationError for invalid status update", async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(existingTask);

      await expect(
        update(1, { status: "invalid" as unknown as TaskStatus }),
      ).rejects.toThrow(ValidationError);
    });

    it("should throw BusinessRuleError when trying to change status from DONE", async () => {
      const doneTask: Task = {
        ...existingTask,
        status: TaskStatus.DONE,
      };

      (taskRepository.findById as jest.Mock).mockResolvedValue(doneTask);

      await expect(update(1, { status: TaskStatus.PENDING })).rejects.toThrow(
        BusinessRuleError,
      );
      await expect(update(1, { status: TaskStatus.PENDING })).rejects.toThrow(
        "Cannot change status of a completed task",
      );
    });

    it("should allow updating status to DONE from PENDING", async () => {
      (taskRepository.findById as jest.Mock)
        .mockResolvedValueOnce(existingTask)
        .mockResolvedValueOnce({
          ...existingTask,
          status: TaskStatus.DONE,
        });
      (taskRepository.updateTask as jest.Mock).mockResolvedValue(1);

      const result = await update(1, { status: TaskStatus.DONE });

      expect(result?.status).toBe(TaskStatus.DONE);
    });

    it("should allow updating status to DONE from IN_PROGRESS", async () => {
      const inProgressTask: Task = {
        ...existingTask,
        status: TaskStatus.IN_PROGRESS,
      };

      (taskRepository.findById as jest.Mock)
        .mockResolvedValueOnce(inProgressTask)
        .mockResolvedValueOnce({
          ...inProgressTask,
          status: TaskStatus.DONE,
        });
      (taskRepository.updateTask as jest.Mock).mockResolvedValue(1);

      const result = await update(1, { status: TaskStatus.DONE });

      expect(result?.status).toBe(TaskStatus.DONE);
    });

    it("should throw ValidationError for invalid ID", async () => {
      await expect(update(-1, { title: "Updated" })).rejects.toThrow(
        ValidationError,
      );
      await expect(update(0, { title: "Updated" })).rejects.toThrow(
        ValidationError,
      );
    });

    it("should rethrow BusinessRuleError from validation", async () => {
      const doneTask: Task = {
        ...existingTask,
        status: TaskStatus.DONE,
      };

      (taskRepository.findById as jest.Mock).mockResolvedValue(doneTask);

      await expect(
        update(1, { status: TaskStatus.IN_PROGRESS }),
      ).rejects.toThrow(BusinessRuleError);
    });

    it("should handle repository update failures", async () => {
      (taskRepository.findById as jest.Mock)
        .mockResolvedValueOnce(existingTask)
        .mockResolvedValueOnce(existingTask);
      (taskRepository.updateTask as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await expect(update(1, { title: "Updated" })).rejects.toThrow(
        "Failed to update task with ID 1",
      );
    });
  });

  describe("deleteTask", () => {
    it("should delete a task and return true", async () => {
      (taskRepository.deleteTask as jest.Mock).mockResolvedValue(1);

      const result = await deleteTask(1);

      expect(taskRepository.deleteTask).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it("should return false when task does not exist", async () => {
      (taskRepository.deleteTask as jest.Mock).mockResolvedValue(0);

      const result = await deleteTask(999);

      expect(result).toBe(false);
    });

    it("should throw ValidationError for invalid ID", async () => {
      await expect(deleteTask(-1)).rejects.toThrow(ValidationError);
      await expect(deleteTask(0)).rejects.toThrow(ValidationError);
      await expect(deleteTask(1.5 as unknown as number)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error when repository delete fails", async () => {
      const repoError = new Error("Database error");
      (taskRepository.deleteTask as jest.Mock).mockRejectedValue(repoError);

      await expect(deleteTask(1)).rejects.toThrow(
        "Failed to delete task with ID 1",
      );
    });
  });
});
