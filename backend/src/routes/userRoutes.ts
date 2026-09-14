import { Router } from 'express';
import { userController } from '../controllers/userController';
import { validate, createUserSchema, updateUserSchema, idParamSchema } from '../middleware/validate';
import { writeLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth';

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

// GET /api/users/me - Get current user (must be registered BEFORE /:id)
router.get('/me', authenticate, userController.getCurrentUser);

// GET /api/users/:id - Get single user
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  userController.getUserById
);

// PATCH /api/users/:id - Update a user
router.patch(
  '/:id',
  writeLimiter,
  validate({ params: idParamSchema, body: updateUserSchema }),
  userController.updateUser
);

// DELETE /api/users/:id - Delete a user
router.delete(
  '/:id',
  writeLimiter,
  validate({ params: idParamSchema }),
  userController.deleteUser
);

export default router;
