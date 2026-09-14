import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { Project, ProjectMember, ProjectStatus } from '@/types/project';
import { UserProfile } from '@/types/user';

// ── Backend raw shapes (snake_case / hyphenated, as returned by the Express API)
export interface BackendTask {
  id: string;
  title: string;
  description?: string | null;
  projectId: string;
  assigneeId?: string | null;
  status: string; // 'todo' | 'in-progress' | 'done'
  priority: string;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  project?: { id: string; name: string; status: string } | null;
  assignee?: { id: string; name: string; email: string; avatarUrl?: string | null } | null;
}

export interface BackendProject {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role?: string | null;
  createdAt: string;
}

// ── Status conversions (backend uses 'in-progress', frontend uses 'in_progress')
export function backendStatusToFrontend(s: string): TaskStatus {
  if (s === 'in-progress') return 'in_progress';
  if (s === 'in_review') return s as TaskStatus;
  return (['todo', 'done'].includes(s) ? s : 'todo') as TaskStatus;
}

export function frontendStatusToBackend(s: TaskStatus): string {
  if (s === 'in_progress') return 'in-progress';
  return s; // 'todo' | 'done' pass through; 'in_review' is not supported by backend
}

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf757b76?w=120&auto=format&fit=crop&q=80';

export function mapBackendTask(row: BackendTask): Task {
  const assigneeMember: ProjectMember = {
    id: row.assignee?.id || row.assigneeId || 'unassigned',
    name: row.assignee?.name || 'Unassigned',
    avatarUrl: row.assignee?.avatarUrl || FALLBACK_AVATAR,
    role: '',
  };

  return {
    id: row.id,
    key: row.id.slice(0, 8).toUpperCase(),
    title: row.title,
    description: row.description || '',
    status: backendStatusToFrontend(row.status),
    priority: (['low', 'medium', 'high', 'urgent'].includes(row.priority)
      ? row.priority
      : 'medium') as TaskPriority,
    projectId: row.projectId,
    projectName: row.project?.name || 'Unknown Project',
    assignee: assigneeMember,
    dueDate: row.dueDate || '',
    estimatedHours: 0,
    loggedHours: 0,
    tags: [],
    commentsCount: 0,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function mapBackendProject(row: BackendProject): Project {
  return {
    id: row.id,
    key: row.id.slice(0, 3).toUpperCase(),
    title: row.name,
    description: row.description || '',
    category: 'backend',
    status: (['active', 'in_progress', 'planning', 'on_hold', 'completed'].includes(row.status)
      ? row.status
      : 'planning') as ProjectStatus,
    health: 'on_track',
    progress: 0,
    dueDate: '',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    totalTasks: 0,
    completedTasks: 0,
    openIssues: 0,
    members: [],
    tags: [],
    colorAccent: 'from-blue-500 to-indigo-600',
  };
}

export function mapBackendUser(row: BackendUser): UserProfile {
  return {
    id: row.id,
    name: row.name,
    username: row.email.split('@')[0],
    email: row.email,
    role: (row.role || 'fullstack_engineer') as UserProfile['role'],
    roleDisplay: (row.role || 'fullstack_engineer')
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
    avatarUrl: row.avatarUrl || FALLBACK_AVATAR,
    team: '',
    department: '',
    status: 'active',
    bio: '',
    joinedAt: row.createdAt,
    stats: {
      tasksCompleted: 0,
      openPRs: 0,
      streakDays: 0,
      focusHoursWeekly: 0,
      codeReviewsGiven: 0,
      velocityScore: 0,
      completionRate: 0,
    },
  };
}
