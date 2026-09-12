import { db } from '../data/store';
import { Task, CreateTaskInput, UpdateTaskInput, TaskFilterQuery } from '../models/task.model';
import { NotFoundError, BadRequestError } from '../middleware/errorHandler';

export class TaskService {
  /**
   * Create a new task
   */
  public async createTask(input: CreateTaskInput): Promise<Task> {
    // Validate project exists
    const project = db.projects.find((p) => p.id === input.projectId);
    if (!project) {
      throw new BadRequestError(`Project with ID '${input.projectId}' does not exist`);
    }

    // Validate assignee if provided
    if (input.assigneeId) {
      const assignee = db.users.find((u) => u.id === input.assigneeId);
      if (!assignee) {
        throw new BadRequestError(`Assignee with ID '${input.assigneeId}' does not exist`);
      }
    }

    const now = new Date().toISOString();
    const newTask: Task = {
      id: `task_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      title: input.title,
      description: input.description,
      projectId: input.projectId,
      assigneeId: input.assigneeId,
      status: input.status || 'todo',
      priority: input.priority || 'medium',
      dueDate: input.dueDate,
      createdAt: now,
      updatedAt: now,
    };

    db.tasks.push(newTask);
    return newTask;
  }

  /**
   * List tasks with query filter support (?status= and ?projectId=)
   */
  public async getTasks(filters?: TaskFilterQuery): Promise<Task[]> {
    let result = [...db.tasks];

    if (filters?.status) {
      result = result.filter((t) => t.status === filters.status);
    }

    if (filters?.projectId) {
      result = result.filter((t) => t.projectId === filters.projectId);
    }

    return result;
  }

  /**
   * Get single task by ID
   */
  public async getTaskById(id: string): Promise<Task> {
    const task = db.tasks.find((t) => t.id === id);
    if (!task) {
      throw new NotFoundError('Task', id);
    }
    return task;
  }

  /**
   * Update task fields (including status)
   */
  public async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    const taskIndex = db.tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) {
      throw new NotFoundError('Task', id);
    }

    // If projectId is being changed, validate new project exists
    if (input.projectId) {
      const projectExists = db.projects.some((p) => p.id === input.projectId);
      if (!projectExists) {
        throw new BadRequestError(`Project with ID '${input.projectId}' does not exist`);
      }
    }

    // If assigneeId is being changed, validate assignee exists
    if (input.assigneeId) {
      const userExists = db.users.some((u) => u.id === input.assigneeId);
      if (!userExists) {
        throw new BadRequestError(`Assignee with ID '${input.assigneeId}' does not exist`);
      }
    }

    const existing = db.tasks[taskIndex];
    const updated: Task = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    db.tasks[taskIndex] = updated;
    return updated;
  }

  /**
   * Delete task by ID
   */
  public async deleteTask(id: string): Promise<void> {
    const taskIndex = db.tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) {
      throw new NotFoundError('Task', id);
    }

    db.tasks.splice(taskIndex, 1);
  }
}

export const taskService = new TaskService();
