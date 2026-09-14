import { AppError, NotFoundError, BadRequestError, ConflictError } from '../middleware/errorHandler';

/**
 * Maps Supabase / PostgreSQL error codes into AppError instances
 */
export function handleSupabaseError(error: any, entityName: string = 'Resource'): never {
  if (!error) {
    throw new AppError('An unexpected error occurred', 500);
  }

  // Postgres unique violation: 23505
  if (error.code === '23505') {
    throw new ConflictError(error.message || `${entityName} with unique value already exists`);
  }

  // Postgres foreign key violation: 23503
  if (error.code === '23503') {
    throw new BadRequestError(
      error.message || `Referenced entity does not exist or has dependent records`
    );
  }

  // Postgres check violation: 23514
  if (error.code === '23514') {
    throw new BadRequestError(error.message || `Invalid value provided for ${entityName}`);
  }

  // Postgres invalid text representation (e.g. invalid UUID format): 22P02
  if (error.code === '22P02') {
    throw new BadRequestError(`Invalid identifier format provided for ${entityName}`);
  }

  // Record not found in single-row queries (PGRST116)
  if (error.code === 'PGRST116') {
    throw new NotFoundError(entityName);
  }

  throw new AppError(error.message || 'Database query error', 500, error.code, error.details);
}
