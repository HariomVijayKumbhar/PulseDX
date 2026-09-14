import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import { ApiSuccessResponse } from '../models/api.model';
import { UpdateUserInput, User } from '../models/user.model';

export class UserController {
  public async createUser(
    req: Request,
    res: Response<ApiSuccessResponse<User>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json({
        data: user,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/me - Returns the authenticated user when a valid Bearer token is
   * provided; otherwise falls back to the most recently active user (development mode).
   * Must be registered before the /users/:id route.
   */
  public async getCurrentUser(
    req: Request,
    res: Response<ApiSuccessResponse<User>>,
    next: NextFunction
  ): Promise<void> {
    try {
      // 1. Authenticated via Bearer token (set by `authenticate` middleware)
      if (req.user?.id) {
        const authedUser = await userService.getUserById(req.user.id).catch(() => null);
        if (authedUser) {
          res.status(200).json({ data: authedUser, meta: { timestamp: new Date().toISOString() } });
          return;
        }
      }

      // 2. Fallback: most recently created user (single-tenant dev mode)
      const result = await userService.getUsers({ sortBy: 'created_at', order: 'desc', limit: 1, page: 1 });
      const first = result.data[0];
      if (!first) {
        res.status(404).json({
          error: { message: 'No users exist yet. Create a user first.', code: 'NOT_FOUND' },
        } as any);
        return;
      }
      res.status(200).json({
        data: first,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  }

  public async getUsers(
    req: Request,
    res: Response<ApiSuccessResponse<User[]>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = {
        search: req.query.search as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        sortBy: req.query.sortBy as string | undefined,
        order: (req.query.order as 'asc' | 'desc') || undefined,
      };

      const result = await userService.getUsers(query);
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

  public async getUserById(
    req: Request,
    res: Response<ApiSuccessResponse<User>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await userService.getUserById(req.params.id);
      res.status(200).json({
        data: user,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateUser(
    req: Request<{ id: string }, unknown, UpdateUserInput>,
    res: Response<ApiSuccessResponse<User>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      res.status(200).json({
        data: user,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public async deleteUser(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await userService.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
