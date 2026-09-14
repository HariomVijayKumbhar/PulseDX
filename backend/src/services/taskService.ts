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
      ? '*, projects(id, name, status), users(id, name, email, avatar_url)'
      : '*';

    let queryBuilder = supabase.from('tasks').select(selectFields, { count: 'exact' });

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
  public async getTaskById(id: string, includeJoined: boolean = true): Promise<Task> {
    const selectFields = includeJoined
      ? '*, projects(id, name, status), users(id, name, email, avatar_url)'
      : '*';

    const { data, error } = await supabase
      .from('tasks')
      .select(selectFields)
      .eq('id', id)
      .single();

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
  public async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    await this.getTaskById(id, false);

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
  public async deleteTask(id: string): Promise<void> {
    await this.getTaskById(id, false);

    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (error) {
      handleSupabaseError(error, 'Task');
    }
  }

  /**
   * Aggregate stats query computed at the database level for the Task 1 dashboard
   */
  public async getStatsOverview(): Promise<StatsOverview> {
    const [
      totalTasksRes,
      todoTasksRes,
      inProgressTasksRes,
      doneTasksRes,
      lowPriorityRes,
      medPriorityRes,
      highPriorityRes,
      urgentPriorityRes,
      projectsRes,
      usersRes,
    ] = await Promise.all([
      supabase.from('tasks').select('*', { count: 'exact', head: true }),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'todo'),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'in-progress'),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'done'),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('priority', 'low'),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('priority', 'medium'),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('priority', 'high'),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('priority', 'urgent'),
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }),
    ]);

    const totalTasks = totalTasksRes.count || 0;
    const doneTasks = doneTasksRes.count || 0;
    const completionPercentage = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks: doneTasks,
      completionPercentage,
      tasksByStatus: {
        todo: todoTasksRes.count || 0,
        inProgress: inProgressTasksRes.count || 0,
        done: doneTasks,
      },
      tasksByPriority: {
        low: lowPriorityRes.count || 0,
        medium: medPriorityRes.count || 0,
        high: highPriorityRes.count || 0,
        urgent: urgentPriorityRes.count || 0,
      },
      totalProjects: projectsRes.count || 0,
      totalUsers: usersRes.count || 0,
    };
  }
}

export const taskService = new TaskService();
