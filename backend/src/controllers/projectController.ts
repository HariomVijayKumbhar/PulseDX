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
      const project = await projectService.createProject(req.body);
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
      const projects = await projectService.getProjects();
      res.status(200).json({
        data: projects,
        meta: {
          total: projects.length,
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
      const project = await projectService.getProjectById(req.params.id);
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
}

export const projectController = new ProjectController();
