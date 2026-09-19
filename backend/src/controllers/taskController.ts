import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/taskService';
import { ApiSuccessResponse } from '../models/api.model';
import { Task } from '../models/task.model';
import { StatsOverview } from '../models/stats.model';

export class TaskController {
  public async createTask(
    req: Request,
    res: Response<ApiSuccessResponse<Task>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const task = await taskService.createTask({ ...req.body, ownerId: req.user?.id });
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
        status: req.query.status as string | undefined,
        priority: req.query.priority as string | undefined,
        projectId: req.query.projectId as string | undefined,
        assigneeId: req.query.assigneeId as string | undefined,
        search: req.query.search as string | undefined,
        ownerId: req.user?.id,
        includeJoined: req.query.includeJoined === 'true',
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        sortBy: req.query.sortBy as string | undefined,
        order: (req.query.order as 'asc' | 'desc') || undefined,
      };

      const result = await taskService.getTasks(filters);
      res.status(200).json({
        data: result.data,
        meta: {
          total: result.total,
          ...(result.page ? { page: result.page, limit: result.limit } : {}),
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
      const includeJoined = req.query.includeJoined !== 'false';
      const task = await taskService.getTaskById(req.params.id, includeJoined, req.user?.id);
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
      const updated = await taskService.updateTask(req.params.id, req.body, req.user?.id);
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
      await taskService.deleteTask(req.params.id, req.user?.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  public async getStatsOverview(
    req: Request,
    res: Response<ApiSuccessResponse<StatsOverview>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await taskService.getStatsOverview(req.user?.id);
      res.status(200).json({
        data: stats,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
