import { apiClient } from './client';
import { AiSuggestedTask } from './ai';

export interface PlanProjectOptions {
  brief: string;
  taskCount?: number;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
  provider?: 'openai' | 'gemini' | 'groq' | 'openrouter' | 'openai-compatible';
}

export interface ProjectPlan {
  projectName: string;
  description: string;
  tasks: AiSuggestedTask[];
  provider: string;
}

export interface ApplyPlanResult {
  projectId: string;
  projectName: string;
  tasksCreated: number;
  tasks: unknown[];
  provider: string;
}

/** Dry-run: get a plan from the AI agent without saving anything */
export async function planProject(opts: PlanProjectOptions): Promise<ProjectPlan> {
  const res = await apiClient<ProjectPlan>('/ai/plan-project', {
    method: 'POST',
    body: JSON.stringify(opts),
  });
  return res.data;
}

/** One-shot: AI plans the project AND creates it (project + tasks) in the database */
export async function applyAiPlan(opts: PlanProjectOptions & { projectId?: string }): Promise<ApplyPlanResult> {
  const res = await apiClient<ApplyPlanResult>('/ai/apply-plan', {
    method: 'POST',
    body: JSON.stringify(opts),
  });
  return res.data;
}
