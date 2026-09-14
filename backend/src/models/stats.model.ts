export interface TaskFilterQuery {
  status?: string;
  priority?: string;
  projectId?: string;
  assigneeId?: string;
  search?: string;
  includeJoined?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface StatsOverview {
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  tasksByStatus: {
    todo: number;
    inProgress: number;
    done: number;
  };
  tasksByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  totalProjects: number;
  totalUsers: number;
}
