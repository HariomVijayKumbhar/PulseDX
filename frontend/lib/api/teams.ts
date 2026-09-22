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
  id?: string;
  name: string;
  description: string;
  ownerId: string;
  projectIds: string[];
  members: TeamMemberDto[];
  createdAt: string;
  updatedAt: string;
}

let teamsStore: TeamDto[] = [
  {
    _id: 'team_platform',
    id: 'team_platform',
    name: 'Platform Engineering',
    description: 'Core microservices, developer tools, and API gateways',
    ownerId: '00000000-0000-0000-0000-000000000001',
    projectIds: [],
    members: [
      {
        userId: 'u1',
        name: 'Alex Rivera',
        email: 'alex@pulsedx.dev',
        role: 'owner',
        joinedAt: '2026-01-15T09:00:00.000Z',
      },
      {
        userId: 'u2',
        name: 'Sarah Chen',
        email: 'sarah@pulsedx.dev',
        role: 'admin',
        joinedAt: '2026-02-01T10:30:00.000Z',
      },
    ],
    createdAt: '2026-01-15T09:00:00.000Z',
    updatedAt: '2026-02-01T10:30:00.000Z',
  },
  {
    _id: 'team_infra',
    id: 'team_infra',
    name: 'Cloud Infrastructure',
    description: 'Kubernetes, multi-region deployments, and observability pipelines',
    ownerId: '00000000-0000-0000-0000-000000000002',
    projectIds: [],
    members: [
      {
        userId: 'u3',
        name: 'Michael Torres',
        email: 'michael@pulsedx.dev',
        role: 'admin',
        joinedAt: '2026-02-10T08:00:00.000Z',
      },
    ],
    createdAt: '2026-02-10T08:00:00.000Z',
    updatedAt: '2026-02-10T08:00:00.000Z',
  },
];

async function unwrap<T>(p: Promise<{ data: T }>): Promise<T> {
  const res = await p;
  return res.data;
}

export const teamApi = {
  list: () =>
    unwrap<TeamDto[]>(
      apiClient<TeamDto[]>('/teams', { method: 'GET' }, () => [...teamsStore])
    ),

  get: (id: string) =>
    unwrap<TeamDto>(
      apiClient<TeamDto>(`/teams/${id}`, { method: 'GET' }, () => {
        const found = teamsStore.find((t) => t._id === id || t.id === id);
        if (!found) throw new Error(`Team with ID ${id} not found`);
        return found;
      })
    ),

  create: (body: { name: string; description?: string; projectIds?: string[] }) =>
    unwrap<TeamDto>(
      apiClient<TeamDto>(
        '/teams',
        { method: 'POST', body: JSON.stringify(body) },
        () => {
          const newTeam: TeamDto = {
            _id: `team_${Date.now()}`,
            id: `team_${Date.now()}`,
            name: body.name,
            description: body.description ?? '',
            ownerId: '00000000-0000-0000-0000-000000000001',
            projectIds: body.projectIds ?? [],
            members: [
              {
                userId: '00000000-0000-0000-0000-000000000001',
                name: 'You (Owner)',
                email: 'owner@pulsedx.dev',
                role: 'owner',
                joinedAt: new Date().toISOString(),
              },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          teamsStore = [newTeam, ...teamsStore];
          return newTeam;
        }
      )
    ),

  addMember: (
    id: string,
    member: { userId: string; name: string; email: string; role?: 'admin' | 'member' }
  ) =>
    unwrap<TeamDto>(
      apiClient<TeamDto>(
        `/teams/${id}/members`,
        { method: 'POST', body: JSON.stringify(member) },
        () => {
          const idx = teamsStore.findIndex((t) => t._id === id || t.id === id);
          if (idx === -1) throw new Error(`Team ${id} not found`);
          const existing = teamsStore[idx];
          const newMember: TeamMemberDto = {
            userId: member.userId,
            name: member.name,
            email: member.email,
            role: member.role || 'member',
            joinedAt: new Date().toISOString(),
          };
          const updated: TeamDto = {
            ...existing,
            members: [...existing.members, newMember],
            updatedAt: new Date().toISOString(),
          };
          teamsStore[idx] = updated;
          return updated;
        }
      )
    ),

  removeMember: (id: string, userId: string) =>
    unwrap<TeamDto>(
      apiClient<TeamDto>(
        `/teams/${id}/members/${userId}`,
        { method: 'DELETE' },
        () => {
          const idx = teamsStore.findIndex((t) => t._id === id || t.id === id);
          if (idx === -1) throw new Error(`Team ${id} not found`);
          const existing = teamsStore[idx];
          const updated: TeamDto = {
            ...existing,
            members: existing.members.filter((m) => m.userId !== userId),
            updatedAt: new Date().toISOString(),
          };
          teamsStore[idx] = updated;
          return updated;
        }
      )
    ),

  detachProject: (id: string, projectId: string) =>
    unwrap<TeamDto>(
      apiClient<TeamDto>(
        `/teams/${id}/projects/${projectId}`,
        { method: 'DELETE' },
        () => {
          const idx = teamsStore.findIndex((t) => t._id === id || t.id === id);
          if (idx === -1) throw new Error(`Team ${id} not found`);
          const existing = teamsStore[idx];
          const updated: TeamDto = {
            ...existing,
            projectIds: existing.projectIds.filter((p) => p !== projectId),
            updatedAt: new Date().toISOString(),
          };
          teamsStore[idx] = updated;
          return updated;
        }
      )
    ),

  delete: (id: string) =>
    unwrap<{ deleted: boolean }>(
      apiClient<{ deleted: boolean }>(
        `/teams/${id}`,
        { method: 'DELETE' },
        () => {
          const idx = teamsStore.findIndex((t) => t._id === id || t.id === id);
          if (idx === -1) throw new Error(`Team ${id} not found`);
          teamsStore.splice(idx, 1);
          return { deleted: true };
        }
      )
    ),

  attachProject: (id: string, projectId: string) =>
    unwrap<TeamDto>(
      apiClient<TeamDto>(
        `/teams/${id}/projects`,
        {
          method: 'POST',
          body: JSON.stringify({ projectId }),
        },
        () => {
          const idx = teamsStore.findIndex((t) => t._id === id || t.id === id);
          if (idx === -1) throw new Error(`Team ${id} not found`);
          const existing = teamsStore[idx];
          const updated: TeamDto = {
            ...existing,
            projectIds: Array.from(new Set([...existing.projectIds, projectId])),
            updatedAt: new Date().toISOString(),
          };
          teamsStore[idx] = updated;
          return updated;
        }
      )
    ),
};
