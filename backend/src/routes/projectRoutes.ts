import { Router } from 'express';
import { projectController } from '../controllers/projectController';
import { validate, createProjectSchema, idParamSchema } from '../middleware/validate';
import { writeLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/projects - Create a new project
router.post(
  '/',
  writeLimiter,
  validate({ body: createProjectSchema }),
  projectController.createProject
);

// GET /api/projects - List all projects
router.get('/', projectController.getProjects);

// GET /api/projects/:id - Get single project
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  projectController.getProjectById
);

export default router;
