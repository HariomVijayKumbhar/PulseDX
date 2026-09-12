import { Project, ProjectStatus } from '@/types/project';
import { ApiResponse, ProjectFilterOptions } from '@/types/api';
import { apiClient } from './client';
import { MOCK_PROJECTS } from '../mock-data';

// Local memory store during session for mutations
let projectsStore: Project[] = [...MOCK_PROJECTS];

/**
 * Fetch all projects matching filter parameters
 */
export async function getProjects(filters?: ProjectFilterOptions): Promise<ApiResponse<Project[]>> {
  return apiClient<Project[]>(
    '/projects',
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
}

/**
 * Fetch a single project by ID
 */
export async function getProjectById(id: string): Promise<ApiResponse<Project>> {
  return apiClient<Project>(
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
}

/**
 * Update project progress or status (mock mutation)
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
