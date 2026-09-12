import { Router } from 'express';
import { userController } from '../controllers/userController';
import { validate, createUserSchema, idParamSchema } from '../middleware/validate';
import { writeLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/users - Create a new user
router.post(
  '/',
  writeLimiter,
  validate({ body: createUserSchema }),
  userController.createUser
);

// GET /api/users - List all users
router.get('/', userController.getUsers);

// GET /api/users/:id - Get single user
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  userController.getUserById
);

export default router;
