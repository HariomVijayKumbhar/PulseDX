export type ProjectStatus = 'active' | 'in_progress' | 'planning' | 'on_hold' | 'completed';

export type ProjectHealth = 'on_track' | 'at_risk' | 'delayed';

export type ProjectCategory = 'frontend' | 'backend' | 'infra' | 'mobile' | 'ai';

export interface ProjectMember {
  id: string;
  name: string;
  avatarUrl: string;
  role: string;
}

export interface Project {
  id: string;
  key: string;
  title: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  health: ProjectHealth;
  progress: number; // 0 to 100
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  totalTasks: number;
  completedTasks: number;
  openIssues: number;
  members: ProjectMember[];
  tags: string[];
  colorAccent: string; // Tailwind gradient/hex identifier
  repositoryUrl?: string;
  stats?: {
    commitsCount: number;
    pullRequestsCount: number;
    deploymentStatus: 'healthy' | 'warning' | 'failing';
  };
}
