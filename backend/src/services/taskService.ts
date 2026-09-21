import { supabase } from '../lib/supabaseClient';
import { Task, CreateTaskInput, UpdateTaskInput } from '../models/task.model';
import { TaskFilterQuery, StatsOverview } from '../models/stats.model';
import { PaginatedResult } from '../models/query.model';
import { NotFoundError } from '../middleware/errorHandler';
import { handleSupabaseError } from '../utils/dbError';

const ALLOWED_SORT_COLUMNS = ['created_at', 'updated_at', 'due_date', 'priority', 'status', 'title'];

export class TaskService {
  private toModel(row: any): Task & { project?: any; assignee?: any } {
    const task: Task & { project?: any; assignee?: any } = {
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      projectId: row.project_id,
      assigneeId: row.assignee_id || undefined,
      status: row.status,
      priority: row.priority,
      dueDate: row.due_date || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    if (row.projects) {
      task.project = {
        id: row.projects.id,
        name: row.projects.name,
        status: row.projects.status,
      };
    }

    if (row.users) {
      task.assignee = {
        id: row.users.id,
        name: row.users.name,
        email: row.users.email,
        avatarUrl: row.users.avatar_url || undefined,
      };
    }

    return task;
  }

  /**
   * Create a new task
   */
  public async createTask(input: CreateTaskInput): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: input.title,
        description: input.description || null,
        project_id: input.projectId,
        assignee_id: input.assigneeId || null,
        status: input.status || 'todo',
        priority: input.priority || 'medium',
        due_date: input.dueDate || null,
      })
      .select('*')
      .single();

    if (error) {
      handleSupabaseError(error, 'Task');
    }

    return this.toModel(data);
  }

  /**
   * List tasks with combinable filters, joined reads, search, pagination, and sorting
   */
  public async getTasks(filters?: TaskFilterQuery): Promise<PaginatedResult<Task>> {
    // Select with joined relations if requested
    const selectFields = filters?.includeJoined
      ? '*, projects!inner(id, name, status, owner_id), users(id, name, email, avatar_url)'
      : '*, projects!inner(id, name, status, owner_id)';

    let queryBuilder = supabase.from('tasks').select(selectFields, { count: 'exact' });

    // Multi-tenant: only return tasks belonging to projects owned by this account
    if (filters?.ownerId) {
      queryBuilder = queryBuilder.eq('projects.owner_id', filters.ownerId);
    }

    // Combinable filters via chained .eq() calls
    if (filters?.status) {
      queryBuilder = queryBuilder.eq('status', filters.status);
    }
    if (filters?.priority) {
      queryBuilder = queryBuilder.eq('priority', filters.priority);
    }
    if (filters?.projectId) {
      queryBuilder = queryBuilder.eq('project_id', filters.projectId);
    }
    if (filters?.assigneeId) {
      queryBuilder = queryBuilder.eq('assignee_id', filters.assigneeId);
    }

    // Search by title or description
    if (filters?.search) {
      queryBuilder = queryBuilder.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Sorting
    const sortBy = filters?.sortBy && ALLOWED_SORT_COLUMNS.includes(filters.sortBy) ? filters.sortBy : 'created_at';
    const ascending = filters?.order === 'asc';
    queryBuilder = queryBuilder.order(sortBy, { ascending });

    // Pagination
    if (filters?.page || filters?.limit) {
      const page = Math.max(1, filters?.page || 1);
      const limit = Math.max(1, Math.min(100, filters?.limit || 20));
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      queryBuilder = queryBuilder.range(from, to);

      const { data, error, count } = await queryBuilder;
      if (error) {
        handleSupabaseError(error, 'Task');
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
      handleSupabaseError(error, 'Task');
    }

    const taskList = (data || []).map((row) => this.toModel(row));
    return {
      data: taskList,
      total: count !== null && count !== undefined ? count : taskList.length,
    };
  }

  /**
   * Get single task by ID (with optional joined relation)
   */
  public async getTaskById(id: string, includeJoined: boolean = true, ownerId?: string): Promise<Task> {
    // Always embed projects!inner so the multi-tenant owner filter below is valid.
    // (Filtering on projects.owner_id without the embed raises PostgREST error PGRST108.)
    const selectFields = includeJoined
      ? '*, projects!inner(id, name, status, owner_id), users(id, name, email, avatar_url)'
      : '*, projects!inner(id, name, status, owner_id)';

    let queryBuilder = supabase.from('tasks').select(selectFields).eq('id', id);
    if (ownerId) {
      queryBuilder = queryBuilder.eq('projects.owner_id', ownerId);
    }

    const { data, error } = await queryBuilder.single();

    if (error) {
      handleSupabaseError(error, 'Task');
    }

    if (!data) {
      throw new NotFoundError('Task', id);
    }

    return this.toModel(data);
  }

  /**
   * Update an existing task
   */
  public async updateTask(id: string, input: UpdateTaskInput, ownerId?: string): Promise<Task> {
    await this.getTaskById(id, false, ownerId);

    const updatePayload: Record<string, any> = {};
    if (input.title !== undefined) updatePayload.title = input.title;
    if (input.description !== undefined) updatePayload.description = input.description || null;
    if (input.projectId !== undefined) updatePayload.project_id = input.projectId;
    if (input.assigneeId !== undefined) updatePayload.assignee_id = input.assigneeId || null;
    if (input.status !== undefined) updatePayload.status = input.status;
    if (input.priority !== undefined) updatePayload.priority = input.priority;
    if (input.dueDate !== undefined) updatePayload.due_date = input.dueDate || null;

    const { data, error } = await supabase
      .from('tasks')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      handleSupabaseError(error, 'Task');
    }

    return this.toModel(data);
  }

  /**
   * Delete task by ID
   */
  public async deleteTask(id: string, ownerId?: string): Promise<void> {
    await this.getTaskById(id, false, ownerId);

    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (error) {
      handleSupabaseError(error, 'Task');
    }
  }

  /**
   * Aggregate stats query computed at the database level for the Task 1 dashboard
   */
  public async getStatsOverview(ownerId?: string): Promise<StatsOverview> {
    // 3 lightweight queries instead of 10 separate count queries:
    // grouped counts by status, grouped counts by priority, and project/user counts.
    const scoped = () => {
      let q = supabase.from('tasks').select('status, priority, projects!inner(owner_id)');
      if (ownerId) {
        q = q.eq('projects.owner_id', ownerId);
      }
      return q;
    };

    const [tasksRes, projectsRes, usersRes] = await Promise.all([
      scoped(),
      ownerId
        ? supabase.from('projects').select('id', { count: 'exact', head: true }).eq('owner_id', ownerId)
        : supabase.from('projects').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }),
    ]);

    if (tasksRes.error) {
      handleSupabaseError(tasksRes.error, 'Task');
    }

    // Group counts in memory (single round-trip instead of one query per bucket)
    let totalTasks = 0;
    let doneTasks = 0;
    const byStatus: Record<string, number> = { todo: 0, 'in-progress': 0, done: 0 };
    const byPriority: Record<string, number> = { low: 0, medium: 0, high: 0, urgent: 0 };

    for (const row of tasksRes.data || []) {
      totalTasks += 1;
      if (row.status in byStatus) byStatus[row.status] += 1;
      if (row.priority in byPriority) byPriority[row.priority] += 1;
    }
    doneTasks = byStatus['done'];
    const completionPercentage = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks: doneTasks,
      completionPercentage,
      tasksByStatus: {
        todo: byStatus['todo'],
        inProgress: byStatus['in-progress'],
        done: doneTasks,
      },
      tasksByPriority: {
        low: byPriority['low'],
        medium: byPriority['medium'],
        high: byPriority['high'],
        urgent: byPriority['urgent'],
      },
      totalProjects: projectsRes.count || 0,
      totalUsers: usersRes.count || 0,
    };
  }
}

export const taskService = new TaskService();
