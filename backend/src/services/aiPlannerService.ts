// AI Project-Planning Agent for PulseDX
import { AiSuggestedTask } from '../models/ai.model';

export interface PlanProjectResult {
  projectName: string;
  description: string;
  tasks: AiSuggestedTask[];
  provider: string;
}

export interface PlanRequest {
  brief: string;
  taskCount?: number;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
  provider?: string;
}

const SYSTEM_PROMPT = `You are PulseDX AI Project Planner, an expert senior engineering project manager.
Given a project brief or goal, you produce an actionable sprint plan.

Respond ONLY with a valid JSON object in exactly this shape:
{
  "projectName": "short punchy project name (max 60 chars)",
  "description": "1-2 sentence project description",
  "tasks": [
    { "title": "action-oriented task title (max 80 chars)",
      "description": "1-2 sentence description with concrete acceptance criteria",
      "priority": "low" | "medium" | "high" | "urgent",
      "estimatedHours": <number between 1 and 40>,
      "category": "short category e.g. backend, frontend, devops, testing, design" }
  ]
}

Rules:
- Tasks must be in dependency order (setup/foundations first, polish/deploy last).
- Every task title must be a concrete deliverable, never vague filler.
- No markdown, no code fences, ONLY the JSON object.`;

/** Default models per provider */
const PROVIDER_DEFAULTS: Record<string, { baseUrl: string; model: string }> = {
  openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  gemini: { baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-2.0-flash' },
  groq: { baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile' },
  openrouter: { baseUrl: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4o-mini' },
};

export class AiPlannerService {
  /**
   * Plan an entire project: name, description and an ordered task breakdown.
   * Uses the LLM when a key is available; deterministic heuristic fallback otherwise.
   */
  public async planProject(req: PlanRequest): Promise<PlanProjectResult> {
    const provider = req.provider || 'openai';
    const preset = PROVIDER_DEFAULTS[provider] || PROVIDER_DEFAULTS.openai;
    const baseUrl = req.baseUrl || preset.baseUrl;
    const model = req.model || preset.model;
    const apiKey = req.apiKey || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
    const taskCount = Math.max(3, Math.min(15, req.taskCount || 6));

    if (apiKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30_000);
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            ...(provider === 'openrouter' ? { 'HTTP-Referer': 'https://pulsedx.app', 'X-Title': 'PulseDX' } : {}),
          },
          signal: controller.signal,
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              {
                role: 'user',
                content: `Create a sprint plan with exactly ${taskCount} tasks for this project brief:\n\n${req.brief}`,
              },
            ],
            temperature: 0.4,
            response_format: { type: 'json_object' },
          }),
        }).finally(() => clearTimeout(timeout));

        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          throw new Error(`LLM HTTP ${response.status}: ${errText.slice(0, 200)}`);
        }

        const json: any = await response.json();
        const parsed = JSON.parse(json.choices[0].message.content);

        const tasks: AiSuggestedTask[] = (parsed.tasks || [])
          .filter((t: any) => t && typeof t.title === 'string')
          .map((t: any) => ({
            title: String(t.title).slice(0, 120),
            description: String(t.description || '').slice(0, 500),
            priority: this.normalizePriority(t.priority),
            estimatedHours: Number(t.estimatedHours) || 4,
            category: t.category ? String(t.category).slice(0, 40) : undefined,
          }));

        if (tasks.length >= 2) {
          return {
            projectName: String(parsed.projectName || req.brief.slice(0, 60)).slice(0, 80),
            description: String(parsed.description || '').slice(0, 500),
            tasks,
            provider: `${model} @ ${baseUrl}`,
          };
        }
      } catch (llmErr: any) {
        console.warn('[AI Planner] LLM call failed, using heuristic fallback:', llmErr?.message);
      }
    }

    return this.heuristicPlan(req.brief, taskCount, apiKey ? `${model} (fallback)` : 'PulseDX Neural Heuristics Engine');
  }

  private normalizePriority(p: any): AiSuggestedTask['priority'] {
    const val = String(p || 'medium').toLowerCase();
    if (['low', 'medium', 'high', 'urgent'].includes(val)) return val as AiSuggestedTask['priority'];
    return 'medium';
  }

  /** Deterministic offline plan generator — no API key required */
  private heuristicPlan(brief: string, taskCount: number, provider: string): PlanProjectResult {
    const nameGuess = brief.split(/[.!\n]/)[0].slice(0, 60) || 'New Project';
    const base: AiSuggestedTask[] = [
      { title: `Define architecture & data model for ${nameGuess}`, description: 'Choose tech stack, sketch API contracts and database schema, and document key decisions.', priority: 'high', estimatedHours: 6, category: 'planning' },
      { title: 'Scaffold project structure & tooling', description: 'Initialize repositories, CI pipeline, linting, and environment configuration.', priority: 'urgent', estimatedHours: 4, category: 'devops' },
      { title: 'Implement core backend services', description: 'Build the primary business logic, data access layer, and input validation.', priority: 'urgent', estimatedHours: 12, category: 'backend' },
      { title: 'Build main user-facing screens', description: 'Implement the primary UI flows with responsive layout and loading/empty/error states.', priority: 'high', estimatedHours: 10, category: 'frontend' },
      { title: 'Integrate authentication & authorization', description: 'Wire up auth flows, session handling, and route-level access control.', priority: 'high', estimatedHours: 6, category: 'backend' },
      { title: 'Write automated tests', description: 'Cover critical paths with unit and integration tests, including failure modes.', priority: 'medium', estimatedHours: 6, category: 'testing' },
      { title: 'Polish UX, accessibility & performance', description: 'Audit contrast, keyboard navigation, bundle size, and perceived latency.', priority: 'medium', estimatedHours: 5, category: 'design' },
      { title: 'Deploy to production & add monitoring', description: 'Configure hosting, environment secrets, health checks, and error tracking.', priority: 'low', estimatedHours: 4, category: 'devops' },
    ];
    return {
      projectName: nameGuess,
      description: `Sprint plan generated from brief: ${brief.slice(0, 200)}`,
      tasks: base.slice(0, Math.max(3, Math.min(taskCount, base.length))),
      provider,
    };
  }
}

export const aiPlannerService = new AiPlannerService();
