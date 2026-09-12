import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import { ApiSuccessResponse } from '../models/api.model';
import { User } from '../models/user.model';

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

  public async getUsers(
    req: Request,
    res: Response<ApiSuccessResponse<User[]>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const users = await userService.getUsers();
      res.status(200).json({
        data: users,
        meta: {
          total: users.length,
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
}

export const userController = new UserController();
