import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

/**
 * Higher-order middleware to validate body, query, and params against Zod schemas
 */
export function validate(schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}

// ---------------------------------------------------------------------------
// Common Param Schemas
// ---------------------------------------------------------------------------
export const idParamSchema = z.object({
  id: z.string().min(1, 'ID parameter is required').trim(),
});

// ---------------------------------------------------------------------------
// User Validation Schemas
// ---------------------------------------------------------------------------
export const createUserSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address format')
    .toLowerCase()
    .trim(),
  avatarUrl: z.string().url('Avatar URL must be a valid URL').optional().or(z.literal('')),
  role: z.string().min(2, 'Role must be at least 2 characters').optional(),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim().optional(),
    email: z.string().email('Invalid email address format').toLowerCase().trim().optional(),
    avatarUrl: z.string().url('Avatar URL must be a valid URL').optional().or(z.literal('')),
    role: z.string().min(2, 'Role must be at least 2 characters').optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided to update the user' }
  );

// ---------------------------------------------------------------------------
// Project Validation Schemas
// ---------------------------------------------------------------------------
export const createProjectSchema = z.object({
  name: z
    .string({ required_error: 'Project name is required' })
    .min(2, 'Project name must be at least 2 characters')
    .max(100, 'Project name must not exceed 100 characters')
    .trim(),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
  // ownerId is injected server-side from the authenticated user (projectController) — optional in body
  ownerId: z.string().min(1).trim().optional(),
  status: z
    .enum(['planning', 'active', 'in_progress', 'on_hold', 'completed'])
    .optional()
    .default('active'),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(100).trim().optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['planning', 'active', 'in_progress', 'on_hold', 'completed']).optional(),
});

// ---------------------------------------------------------------------------
// Task Validation Schemas
// ---------------------------------------------------------------------------
export const taskStatusEnum = z.enum(['todo', 'in-progress', 'done'], {
  errorMap: () => ({ message: 'Status must be one of: "todo" | "in-progress" | "done"' }),
});

export const taskPriorityEnum = z.enum(['low', 'medium', 'high', 'urgent'], {
  errorMap: () => ({ message: 'Priority must be one of: "low" | "medium" | "high" | "urgent"' }),
});

export const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(2, 'Title must be at least 2 characters')
    .max(150, 'Title must not exceed 150 characters')
    .trim(),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional(),
  projectId: z.string({ required_error: 'projectId is required' }).min(1, 'projectId cannot be empty').trim(),
  assigneeId: z.string().optional(),
  status: taskStatusEnum.optional().default('todo'),
  priority: taskPriorityEnum.optional().default('medium'),
  dueDate: z.string().datetime({ message: 'dueDate must be a valid ISO 8601 date string' }).optional(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().min(2, 'Title must be at least 2 characters').max(150).trim().optional(),
    description: z.string().max(1000).optional(),
    projectId: z.string().min(1).trim().optional(),
    assigneeId: z.string().optional(),
    status: taskStatusEnum.optional(),
    priority: taskPriorityEnum.optional(),
    dueDate: z.string().datetime({ message: 'dueDate must be a valid ISO 8601 date string' }).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided to update the task' }
  );

export const taskFilterQuerySchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  projectId: z.string().optional(),
  assigneeId: z.string().optional(),
  search: z.string().optional(),
  includeJoined: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
});
