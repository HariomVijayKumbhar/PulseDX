import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/taskService';
import { ApiSuccessResponse } from '../models/api.model';
import { Task, TaskStatus } from '../models/task.model';

export class TaskController {
  public async createTask(
    req: Request,
    res: Response<ApiSuccessResponse<Task>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const task = await taskService.createTask(req.body);
      res.status(201).json({
        data: task,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public async getTasks(
    req: Request,
    res: Response<ApiSuccessResponse<Task[]>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = {
        status: req.query.status as TaskStatus | undefined,
        projectId: req.query.projectId as string | undefined,
      };

      const tasks = await taskService.getTasks(filters);
      res.status(200).json({
        data: tasks,
        meta: {
          total: tasks.length,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public async getTaskById(
    req: Request,
    res: Response<ApiSuccessResponse<Task>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const task = await taskService.getTaskById(req.params.id);
      res.status(200).json({
        data: task,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateTask(
    req: Request,
    res: Response<ApiSuccessResponse<Task>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const updated = await taskService.updateTask(req.params.id, req.body);
      res.status(200).json({
        data: updated,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public async deleteTask(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await taskService.deleteTask(req.params.id);
      // 204 No Content for successful deletion
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
