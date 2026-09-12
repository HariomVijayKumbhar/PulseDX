import { ProjectMember } from './project';

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  key: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  projectName: string;
  assignee: ProjectMember;
  reporter?: ProjectMember;
  dueDate: string;
  estimatedHours: number;
  loggedHours: number;
  tags: string[];
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}
