import { Task, TaskStatus } from '@/types/task';
import { ApiResponse, TaskFilterOptions } from '@/types/api';
import { apiClient } from './client';
import { MOCK_TASKS } from '../mock-data';

// Session state to allow interactive toggling and modifications in UI
let tasksStore: Task[] = [...MOCK_TASKS];

/**
 * Fetch tasks with optional filtering, search, and sorting
 */
export async function getTasks(filters?: TaskFilterOptions): Promise<ApiResponse<Task[]>> {
  return apiClient<Task[]>(
    '/tasks',
    { method: 'GET' },
    () => {
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

      // Sorting
      if (filters?.sortBy) {
        filtered.sort((a, b) => {
          let aVal: any = a[filters.sortBy!];
          let bVal: any = b[filters.sortBy!];
          if (typeof aVal === 'string') {
            return filters.sortOrder === 'desc'
              ? bVal.localeCompare(aVal)
              : aVal.localeCompare(bVal);
          }
          return filters.sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
        });
      }

      return filtered;
    }
  );
}

/**
 * Update task status (e.g. todo -> in_progress -> done)
 */
export async function updateTaskStatus(
  taskId: string,
  newStatus: TaskStatus
): Promise<ApiResponse<Task>> {
  return apiClient<Task>(
    `/tasks/${taskId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
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
  );
}

/**
 * Create a new task (mock endpoint)
 */
export async function createTask(
  taskInput: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ApiResponse<Task>> {
  return apiClient<Task>(
    '/tasks',
    {
      method: 'POST',
      body: JSON.stringify(taskInput),
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
  );
}
