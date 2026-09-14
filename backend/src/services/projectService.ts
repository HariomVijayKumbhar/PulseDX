import { supabase } from '../lib/supabaseClient';
import { Project, CreateProjectInput, UpdateProjectInput } from '../models/project.model';
import { NotFoundError, BadRequestError } from '../middleware/errorHandler';
import { handleSupabaseError } from '../utils/dbError';
import { PaginationQuery, PaginatedResult } from '../models/query.model';

const ALLOWED_SORT_COLUMNS = ['created_at', 'updated_at', 'name', 'status'];

export class ProjectService {
  private toModel(row: any): Project {
    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      ownerId: row.owner_id,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Create a new project in Supabase
   */
  public async createProject(input: CreateProjectInput): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: input.name,
        description: input.description || null,
        owner_id: input.ownerId,
        status: input.status || 'active',
      })
      .select('*')
      .single();

    if (error) {
      handleSupabaseError(error, 'Project');
    }

    return this.toModel(data);
  }

  /**
   * List all projects with optional search, sorting, and pagination
   */
  public async getProjects(query?: PaginationQuery): Promise<PaginatedResult<Project>> {
    let queryBuilder = supabase.from('projects').select('*', { count: 'exact' });

    // Search by project name or description
    if (query?.search) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query.search}%,description.ilike.%${query.search}%`);
    }

    // Sorting
    const sortBy = query?.sortBy && ALLOWED_SORT_COLUMNS.includes(query.sortBy) ? query.sortBy : 'created_at';
    const ascending = query?.order === 'asc';
    queryBuilder = queryBuilder.order(sortBy, { ascending });

    // Pagination
    if (query?.page || query?.limit) {
      const page = Math.max(1, query?.page || 1);
      const limit = Math.max(1, Math.min(100, query?.limit || 20));
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      queryBuilder = queryBuilder.range(from, to);

      const { data, error, count } = await queryBuilder;
      if (error) {
        handleSupabaseError(error, 'Project');
      }

      return {
        data: (data || []).map((row) => this.toModel(row)),
        total: count || 0,
        page,
        limit,
      };
    }

    const { data, error, count } = await queryBuilder;
    if (error) {
      handleSupabaseError(error, 'Project');
    }

    const projectList = (data || []).map((row) => this.toModel(row));
    return {
      data: projectList,
      total: count !== null && count !== undefined ? count : projectList.length,
    };
  }

  /**
   * Get single project by ID
   */
  public async getProjectById(id: string): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      handleSupabaseError(error, 'Project');
    }

    if (!data) {
      throw new NotFoundError('Project', id);
    }

    return this.toModel(data);
  }

  /**
   * Update an existing project
   */
  public async updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
    await this.getProjectById(id);

    const updatePayload: Record<string, any> = {};
    if (input.name !== undefined) updatePayload.name = input.name;
    if (input.description !== undefined) updatePayload.description = input.description || null;
    if (input.status !== undefined) updatePayload.status = input.status;

    const { data, error } = await supabase
      .from('projects')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      handleSupabaseError(error, 'Project');
    }

    return this.toModel(data);
  }
}

export const projectService = new ProjectService();
