import { apiClient } from './client';

export interface TeamMemberDto {
  userId: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface TeamDto {
  _id: string;
  name: string;
  description: string;
  ownerId: string;
  projectIds: string[];
  members: TeamMemberDto[];
  createdAt: string;
  updatedAt: string;
}

async function unwrap<T>(p: Promise<{ data: T }>): Promise<T> {
  const res = await p;
  return res.data;
}

export const teamApi = {
  list: () => unwrap<TeamDto[]>(apiClient<TeamDto[]>('/teams', { method: 'GET' })),

  get: (id: string) => unwrap<TeamDto>(apiClient<TeamDto>(`/teams/${id}`, { method: 'GET' })),

  create: (body: { name: string; description?: string; projectIds?: string[] }) =>
    unwrap<TeamDto>(apiClient<TeamDto>('/teams', { method: 'POST', body: JSON.stringify(body) })),

  addMember: (
    id: string,
    member: { userId: string; name: string; email: string; role?: 'admin' | 'member' }
  ) =>
    unwrap<TeamDto>(
      apiClient<TeamDto>(`/teams/${id}/members`, { method: 'POST', body: JSON.stringify(member) })
    ),

  attachProject: (id: string, projectId: string) =>
    unwrap<TeamDto>(
      apiClient<TeamDto>(`/teams/${id}/projects`, {
        method: 'POST',
        body: JSON.stringify({ projectId }),
      })
    ),
};
