import { apiClient } from './client';

export interface AiSuggestedTask {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface SuggestTasksOptions {
  goal: string;
  projectId?: string;
  /** Any OpenAI-compatible model, e.g. gpt-4o, llama3, mistral */
  model?: string;
  /** Bring your own key — overrides the server's key */
  apiKey?: string;
  /** Base URL of an OpenAI-compatible endpoint (defaults to OpenAI) */
  baseUrl?: string;
}

export interface SuggestTasksResult {
  goal: string;
  projectId?: string;
  suggestedTasks: AiSuggestedTask[];
  provider: string;
}

export async function suggestTasks(opts: SuggestTasksOptions): Promise<SuggestTasksResult> {
  const res = await apiClient<SuggestTasksResult>('/ai/suggest-tasks', {
    method: 'POST',
    body: JSON.stringify(opts),
  });
  return res.data;
}
