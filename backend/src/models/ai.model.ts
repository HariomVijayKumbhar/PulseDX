export type AiTaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface AiSuggestedTask {
  title: string;
  description: string;
  priority: AiTaskPriority;
  estimatedHours?: number;
  category?: string;
}

export interface SuggestTasksInput {
  goal: string;
  projectId?: string;
}

export interface SuggestTasksResult {
  goal: string;
  projectId?: string;
  suggestedTasks: AiSuggestedTask[];
  provider: string;
}

export interface SummarizeProjectInput {
  projectId: string;
}

export interface SummarizeProjectResult {
  projectId: string;
  projectName: string;
  completionPercentage: number;
  summary: string;
  statusBreakdown: {
    todo: number;
    inProgress: number;
    done: number;
    total: number;
  };
}
