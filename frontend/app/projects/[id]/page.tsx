'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Project } from '@/types/project';
import { Task, TaskStatus } from '@/types/task';
import { getProjectById } from '@/lib/api/projects';
import { getTasks, updateTaskStatus, createTask } from '@/lib/api/tasks';
import ProjectAnalytics3D, { ProjectProgressDatum } from '@/components/3d/ProjectAnalytics3D';
import { CreateTaskModal } from '@/components/ui/CreateTaskModal';
import { AiSuggestedTask, suggestTasks } from '@/lib/api/ai';
import { PriorityBadge } from '@/components/ui/Badge';
import {
  ArrowLeft,
  Plus,
  ListChecks,
  Clock,
  CircleCheck,
  Loader2,
  Target,
  Sparkles,
  Wand2,
  Bot,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLUMNS: { key: TaskStatus; label: string; accent: string }[] = [
  { key: 'todo', label: 'Backlog', accent: 'from-slate-400 to-slate-500' },
  { key: 'in_progress', label: 'In Progress', accent: 'from-amber-400 to-orange-500' },
  { key: 'done', label: 'Completed', accent: 'from-emerald-400 to-teal-500' },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [aiGoal, setAiGoal] = useState('');
  const [aiModel, setAiModel] = useState('');
  const [aiKey, setAiKey] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestedTask[]>([]);
  const [aiProvider, setAiProvider] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);

  const load = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [projectRes, tasksRes] = await Promise.all([
        getProjectById(projectId),
        getTasks({ projectId }),
      ]);
      setProject(projectRes.data ?? null);
      setTasks(tasksRes.data ?? []);
    } catch {
      toast.error('Failed to load project details');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleTaskStatus = async (task: Task, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)));
    try {
      await updateTaskStatus(task.id, status);
      toast.success(`"${task.title}" → ${status.replace('_', ' ')}`);
      load(); // refresh analytics
    } catch {
      toast.error('Could not update task');
      load();
    }
  };

  // ── AI Sprint Planner
  const handlePlanSprint = async () => {
    if (aiGoal.trim().length < 3) {
      toast.error('Describe your sprint goal first');
      return;
    }
    setIsPlanning(true);
    setAiSuggestions([]);
    try {
      const res = await suggestTasks({
        goal: aiGoal.trim(),
        projectId,
        model: aiModel.trim() || undefined,
        apiKey: aiKey.trim() || undefined,
      });
      setAiSuggestions(res.suggestedTasks ?? []);
      setAiProvider(res.provider ?? '');
      toast.success(`${res.suggestedTasks?.length ?? 0} tasks suggested`);
    } catch {
      toast.error('AI planner failed — try again or check your key');
    } finally {
      setIsPlanning(false);
    }
  };

  const handleAcceptSuggestion = async (s: AiSuggestedTask) => {
    try {
      await createTask({
        key: `TASK-${Math.floor(100 + Math.random() * 900)}`,
        title: s.title,
        description: s.description,
        projectId,
        status: 'todo',
        priority: s.priority,
        tags: ['AI Planned'],
        estimatedHours: 4,
        dueDate: new Date().toISOString(),
      });
      setAiSuggestions((prev) => prev.filter((x) => x.title !== s.title));
      toast.success(`"${s.title}" added to backlog`);
      load();
    } catch {
      toast.error('Could not add suggested task');
    }
  };

  // ── Analytics derived from tasks
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const todo = total - done - inProgress;
  const completion = total > 0 ? Math.round((done / total) * 100) : 0;

  const analytics: ProjectProgressDatum[] = [
    { label: 'Done', value: total ? (done / total) * 100 : 0, color: '#34d399' },
    { label: 'Active', value: total ? (inProgress / total) * 100 : 0, color: '#fbbf24' },
    { label: 'Backlog', value: total ? (todo / total) * 100 : 0, color: '#818cf8' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
        <Target className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground">Project not found</h2>
        <Link href="/projects" className="text-primary hover:underline flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <Link
            href="/projects"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Initiatives
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            {project.title}
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md glass-pill text-muted-foreground">
              {project.key}
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{project.description}</p>
        </div>

        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:opacity-90 active:scale-95 transition-all self-start"
        >
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      {/* Progress summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: ListChecks, label: 'Total Tasks', value: total, color: 'text-indigo-500' },
          { icon: CircleCheck, label: 'Completed', value: done, color: 'text-emerald-500' },
          { icon: Clock, label: 'In Progress', value: inProgress, color: 'text-amber-500' },
          { icon: Sparkles, label: 'Completion', value: `${completion}%`, color: 'text-purple-500' },
        ].map((s) => (
          <div key={s.label} className="glass-panel p-4 rounded-2xl">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* AI Sprint Planner */}
      <div className="glass-panel p-5 rounded-2xl">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Bot className="w-4 h-4 text-purple-500" /> AI Sprint Planner
        </h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={aiGoal}
            onChange={(e) => setAiGoal(e.target.value)}
            placeholder="Describe the sprint goal — e.g. 'Ship the billing module'"
            className="flex-1 px-3 py-2 rounded-xl text-sm bg-slate-100/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={handlePlanSprint}
            disabled={isPlanning}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {isPlanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {isPlanning ? 'Planning…' : 'Plan Sprint'}
          </button>
        </div>
        {/* Optional: use any model provider */}
        <details className="mt-2">
          <summary className="text-[11px] text-muted-foreground cursor-pointer hover:text-foreground">
            Use a custom model / API key (OpenAI, Groq, Ollama, OpenRouter…)
          </summary>
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <input
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              placeholder="Model (e.g. gpt-4o, llama3, mistral)"
              className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-100/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              value={aiKey}
              onChange={(e) => setAiKey(e.target.value)}
              type="password"
              placeholder="API key (optional — uses server key if empty)"
              className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-100/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </details>

        {aiSuggestions.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-[11px] text-muted-foreground">
              Suggested by <span className="font-semibold">{aiProvider}</span> — click to add to backlog:
            </p>
            {aiSuggestions.map((s) => (
              <button
                key={s.title}
                onClick={() => handleAcceptSuggestion(s)}
                className="w-full text-left p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-primary transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{s.title}</p>
                  <PriorityBadge priority={s.priority} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
                <span className="text-[10px] mt-1.5 inline-block text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  + Add to backlog
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3D Analytics */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
          Project Analytics — 3D
        </h2>
        <ProjectAnalytics3D stats={analytics} />
      </div>

      {/* Task board */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Sprint Board
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATUS_COLUMNS.map((col) => {
            const colTasks = tasks.filter(
              (t) => t.status === col.key || (col.key === 'todo' && t.status === 'in_review')
            );
            return (
              <div key={col.key} className="glass-panel rounded-2xl p-4 min-h-[180px]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${col.accent}`} />
                    {col.label}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-muted-foreground">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {colTasks.length === 0 && (
                    <p className="text-xs text-muted-foreground italic py-4 text-center">
                      Nothing here yet
                    </p>
                  )}
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-foreground leading-snug">
                          {task.title}
                        </p>
                        <PriorityBadge priority={task.priority} />
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      {/* Quick status advance */}
                      <div className="flex gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {STATUS_COLUMNS.filter((c) => c.key !== task.status).map((c) => (
                          <button
                            key={c.key}
                            onClick={() => handleTaskStatus(task, c.key)}
                            className="text-[10px] px-2 py-0.5 rounded-md border-slate-300 dark:border-slate-700 text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                          >
                            → {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        projects={[project]}
        onTaskCreated={() => {
          setIsTaskModalOpen(false);
          load();
        }}
      />
    </div>
  );
}
