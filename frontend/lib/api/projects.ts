import { Project, ProjectStatus } from '@/types/project';
import { ApiResponse, ProjectFilterOptions } from '@/types/api';
import { apiClient } from './client';
import { mapBackendProject, BackendProject } from './mappers';
import { MOCK_PROJECTS } from '../mock-data';

// Local memory store during session for mock fallback
let projectsStore: Project[] = [...MOCK_PROJECTS];

/** Detect whether a row is a raw backend project (has name/owner_id, no title) */
function isBackendRow(row: any): boolean {
  return row && typeof row === 'object' && 'name' in row && !('title' in row);
}

/**
 * Fetch all projects — live backend: GET /projects (supports search, pagination, sorting)
 */
export async function getProjects(filters?: ProjectFilterOptions): Promise<ApiResponse<Project[]>> {
  const params = new URLSearchParams();
  if (filters?.searchQuery) params.set('search', filters.searchQuery);
  if (filters?.status && filters.status !== 'all') params.set('status', filters.status);

  const qs = params.toString();
  const res = await apiClient<Project[]>(
    `/projects${qs ? `?${qs}` : ''}`,
    { method: 'GET' },
    () => {
      let filtered = [...projectsStore];

      if (filters?.status && filters.status !== 'all') {
        filtered = filtered.filter((p) => p.status === filters.status);
      }

      if (filters?.category) {
        filtered = filtered.filter((p) => p.category === filters.category);
      }

      if (filters?.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.key.toLowerCase().includes(q) ||
            p.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      }

      return filtered;
    }
  );

  if (!res.success) return res;
  const rows = res.data as unknown as any[];
  if (Array.isArray(rows) && rows.length > 0 && isBackendRow(rows[0])) {
    return { ...res, data: rows.map((r) => mapBackendProject(r as BackendProject)) };
  }
  return res;
}

/**
 * Fetch a single project by ID — live backend: GET /projects/:id
 */
export async function getProjectById(id: string): Promise<ApiResponse<Project>> {
  const res = await apiClient<Project>(
    `/projects/${id}`,
    { method: 'GET' },
    () => {
      const found = projectsStore.find((p) => p.id === id || p.key === id);
      if (!found) {
        throw new Error(`Project with ID ${id} not found`);
      }
      return found;
    }
  );
  if (res.success && res.data && isBackendRow(res.data as any)) {
    return { ...res, data: mapBackendProject(res.data as unknown as BackendProject) };
  }
  return res;
}

/**
 * Update project progress (mock-only mutation; live backend has no progress field)
 */
export async function updateProjectProgress(
  id: string,
  progress: number
): Promise<ApiResponse<Project>> {
  return apiClient<Project>(
    `/projects/${id}/progress`,
    {
      method: 'PATCH',
      body: JSON.stringify({ progress }),
    },
    () => {
      const idx = projectsStore.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error(`Project ${id} not found`);
      const updated = {
        ...projectsStore[idx],
        progress: Math.min(100, Math.max(0, progress)),
        updatedAt: new Date().toISOString(),
      };
      projectsStore[idx] = updated;
      return updated;
    }
  );
}

/**
 * Create a new engineering initiative / project — live backend: POST /projects
 */
export async function createProject(input: {
  title: string;
  description?: string;
  category?: any;
  status?: any;
  ownerId?: string;
}): Promise<ApiResponse<Project>> {
  const body = {
    name: input.title,
    description: input.description || undefined,
    ownerId: input.ownerId || '00000000-0000-0000-0000-000000000001',
    status: input.status && input.status !== 'active' ? input.status : 'active',
  };

  return apiClient<Project>(
    '/projects',
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    () => {
      const newProj: Project = {
        id: `proj_${Date.now()}`,
        key: input.title.slice(0, 4).toUpperCase(),
        title: input.title,
        description: input.description || '',
        category: input.category || 'frontend',
        status: input.status || 'in_progress',
        health: 'on_track',
        progress: 0,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        totalTasks: 0,
        completedTasks: 0,
        openIssues: 0,
        members: [],
        tags: [input.category || 'Engineering'],
        colorAccent: 'from-indigo-500 to-purple-500',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      projectsStore = [newProj, ...projectsStore];
      return newProj;
    }
  ).then((res) => {
    if (res.success && res.data && isBackendRow(res.data as any)) {
      return { ...res, data: mapBackendProject(res.data as unknown as BackendProject) };
    }
    return res;
  });
}

