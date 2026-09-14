import { Task, TaskStatus } from '@/types/task';
import { ApiResponse, TaskFilterOptions } from '@/types/api';
import { apiClient } from './client';
import { mapBackendTask, frontendStatusToBackend, BackendTask } from './mappers';
import { MOCK_TASKS } from '../mock-data';

// Session state for mock fallback (offline / backend down)
let tasksStore: Task[] = [...MOCK_TASKS];

function mockFilter(filters?: TaskFilterOptions): Task[] {
  let filtered = [...tasksStore];
  if (filters?.status && filters.status !== 'all') {
    filtered = filtered.filter((t) => t.status === filters.status);
  }
  if (filters?.priority && filters.priority !== 'all') {
    filtered = filtered.filter((t) => t.priority === filters.priority);
  }
  if (filters?.projectId) {
    filtered = filtered.filter((t) => t.projectId === filters.projectId);
  }
  if (filters?.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.key.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }
  return filtered;
}

/** Detect whether rows are raw backend rows (need mapping) or already frontend-shaped mocks */
function isBackendRow(row: any): boolean {
  return row && typeof row === 'object' && 'projectId' in row && !('tags' in row);
}

/**
 * Fetch tasks with optional filtering.
 * Live backend supports combinable filters; response is mapped to frontend Task shape.
 */
export async function getTasks(filters?: TaskFilterOptions): Promise<ApiResponse<Task[]>> {
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== 'all') {
    params.set('status', frontendStatusToBackend(filters.status as TaskStatus));
  }
  if (filters?.priority && filters.priority !== 'all') {
    params.set('priority', filters.priority);
  }
  if (filters?.projectId) params.set('projectId', filters.projectId);
  if (filters?.searchQuery) params.set('search', filters.searchQuery);
  if (filters?.sortBy) {
    const sortMap: Record<string, string> = {
      dueDate: 'due_date',
      priority: 'priority',
      updatedAt: 'updated_at',
      title: 'title',
    };
    params.set('sortBy', sortMap[filters.sortBy] || 'created_at');
  }
  if (filters?.sortOrder) params.set('order', filters.sortOrder);
  params.set('includeJoined', 'true');

  const qs = params.toString();
  const res = await apiClient<Task[]>(
    `/tasks${qs ? `?${qs}` : ''}`,
    { method: 'GET' },
    () => mockFilter(filters)
  );

  if (!res.success) return res;
  const rows = res.data as unknown as any[];
  if (Array.isArray(rows) && rows.length > 0 && isBackendRow(rows[0])) {
    return { ...res, data: rows.map((r) => mapBackendTask(r as BackendTask)) };
  }
  return res;
}

/**
 * Update task status — live backend: PATCH /tasks/:id with { status }
 */
export async function updateTaskStatus(
  taskId: string,
  newStatus: TaskStatus
): Promise<ApiResponse<Task>> {
  const backendStatus = frontendStatusToBackend(newStatus);
  return apiClient<Task>(
    `/tasks/${taskId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status: backendStatus }),
    },
    () => {
      const idx = tasksStore.findIndex((t) => t.id === taskId);
      if (idx === -1) {
        throw new Error(`Task with ID ${taskId} not found`);
      }
      const updated: Task = {
        ...tasksStore[idx],
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
      tasksStore[idx] = updated;
      return updated;
    }
  ).then((res) => {
    if (res.success && res.data && isBackendRow(res.data as any)) {
      return { ...res, data: mapBackendTask(res.data as unknown as BackendTask) };
    }
    return res;
  });
}

/**
 * Create a new task — live backend: POST /tasks
 */
export async function createTask(
  taskInput: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ApiResponse<Task>> {
  const body = {
    title: taskInput.title,
    description: taskInput.description || undefined,
    projectId: taskInput.projectId,
    assigneeId: taskInput.assignee?.id || undefined,
    status: frontendStatusToBackend(taskInput.status),
    priority: taskInput.priority,
    dueDate: taskInput.dueDate || undefined,
  };
  return apiClient<Task>(
    '/tasks',
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    () => {
      const newTask: Task = {
        ...taskInput,
        id: `task_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      tasksStore = [newTask, ...tasksStore];
      return newTask;
    }
  ).then((res) => {
    if (res.success && res.data && isBackendRow(res.data as any)) {
      return { ...res, data: mapBackendTask(res.data as unknown as BackendTask) };
    }
    return res;
  });
}
