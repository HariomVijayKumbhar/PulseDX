import { Router } from 'express';
import { projectController } from '../controllers/projectController';
import { validate, createProjectSchema, updateProjectSchema, idParamSchema } from '../middleware/validate';
import { writeLimiter } from '../middleware/rateLimiter';
import { authenticate, requireAuth } from '../middleware/auth';

const router = Router();

// All project routes are account-scoped — authentication is required
router.use(authenticate, requireAuth);

// POST /api/projects - Create a new project
router.post(
  '/',
  writeLimiter,
  validate({ body: createProjectSchema }),
  projectController.createProject
);

// GET /api/projects - List all projects (supports ?search=, ?page=, ?limit=, ?sortBy=, ?order=)
router.get('/', projectController.getProjects);

// GET /api/projects/:id - Get single project
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  projectController.getProjectById
);

// PATCH /api/projects/:id - Update an existing project
router.patch(
  '/:id',
  writeLimiter,
  validate({ params: idParamSchema, body: updateProjectSchema }),
  projectController.updateProject
);

// DELETE /api/projects/:id - Delete a project (cascades to its tasks)
router.delete(
  '/:id',
  writeLimiter,
  validate({ params: idParamSchema }),
  projectController.deleteProject
);

export default router;
