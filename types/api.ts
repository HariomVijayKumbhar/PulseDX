import { Project, ProjectStatus } from './project';
import { Task, TaskPriority, TaskStatus } from './task';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface TaskFilterOptions {
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  projectId?: string;
  searchQuery?: string;
  sortBy?: 'dueDate' | 'priority' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface ProjectFilterOptions {
  status?: ProjectStatus | 'all';
  category?: string;
  searchQuery?: string;
}

export interface ProductivitySummary {
  weeklyVelocity: { day: string; hours: number; commits: number; tasks: number }[];
  projectCompletionRates: { name: string; key: string; rate: number; color: string }[];
  focusScore: number;
  streakCount: number;
  openPullRequestsCount: number;
}
