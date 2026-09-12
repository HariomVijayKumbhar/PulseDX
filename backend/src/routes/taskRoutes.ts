import { Router } from 'express';
import { taskController } from '../controllers/taskController';
import { validate, createTaskSchema, updateTaskSchema, idParamSchema, taskFilterQuerySchema } from '../middleware/validate';
import { writeLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/tasks - Create a new task
router.post(
  '/',
  writeLimiter,
  validate({ body: createTaskSchema }),
  taskController.createTask
);

// GET /api/tasks - List tasks (supports ?status= and ?projectId= filters)
router.get(
  '/',
  validate({ query: taskFilterQuerySchema }),
  taskController.getTasks
);

// GET /api/tasks/:id - Get single task
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  taskController.getTaskById
);

// PATCH /api/tasks/:id - Update a task (status, fields)
router.patch(
  '/:id',
  writeLimiter,
  validate({ params: idParamSchema, body: updateTaskSchema }),
  taskController.updateTask
);

// DELETE /api/tasks/:id - Delete a task
router.delete(
  '/:id',
  writeLimiter,
  validate({ params: idParamSchema }),
  taskController.deleteTask
);

export default router;
