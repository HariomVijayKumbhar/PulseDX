import { Request, Response, NextFunction } from 'express';
import { projectService } from '../services/projectService';
import { ApiSuccessResponse } from '../models/api.model';
import { Project } from '../models/project.model';

export class ProjectController {
  public async createProject(
    req: Request,
    res: Response<ApiSuccessResponse<Project>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const project = await projectService.createProject({ ...req.body, ownerId: req.user?.id });
      res.status(201).json({
        data: project,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public async getProjects(
    req: Request,
    res: Response<ApiSuccessResponse<Project[]>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = {
        search: req.query.search as string | undefined,
        ownerId: req.user?.id,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        sortBy: req.query.sortBy as string | undefined,
        order: (req.query.order as 'asc' | 'desc') || undefined,
      };

      const result = await projectService.getProjects(query);
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

  public async getProjectById(
    req: Request,
    res: Response<ApiSuccessResponse<Project>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const project = await projectService.getProjectById(req.params.id, req.user?.id);
      res.status(200).json({
        data: project,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateProject(
    req: Request,
    res: Response<ApiSuccessResponse<Project>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const updated = await projectService.updateProject(req.params.id, req.body, req.user?.id);
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
}

export const projectController = new ProjectController();
