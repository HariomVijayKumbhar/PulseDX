'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Bot, Loader2, Wand2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { planProject, applyAiPlan, ProjectPlan } from '@/lib/api/planner';

interface AiPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** If set, generated tasks are added to this existing project instead of a new one */
  projectId?: string;
  onApplied?: (result: { projectId: string; projectName: string }) => void;
}

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'groq', label: 'Groq' },
  { value: 'openrouter', label: 'OpenRouter' },
  { value: 'gemini', label: 'Gemini' },
];

export function AiPlannerModal({ isOpen, onClose, projectId, onApplied }: AiPlannerModalProps) {
  const router = useRouter();
  const [brief, setBrief] = useState('');
  const [taskCount, setTaskCount] = useState(6);
  const [provider, setProvider] = useState<'openai' | 'groq' | 'openrouter' | 'gemini'>('openai');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [phase, setPhase] = useState<'input' | 'review' | 'done'>('input');
  const [plan, setPlan] = useState<ProjectPlan | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const handlePlan = async () => {
    if (brief.trim().length < 5) {
      toast.error('Describe your project idea in at least a few words');
      return;
    }
    setBusy(true);
    try {
      const result = await planProject({
        brief: brief.trim(),
        taskCount,
        provider,
        ...(apiKey ? { apiKey } : {}),
        ...(model ? { model } : {}),
      });
      setPlan(result);
      setPhase('review');
    } catch (err: any) {
      toast.error(err?.message || 'AI planner failed');
    } finally {
      setBusy(false);
    }
  };

  const handleApply = async () => {
    if (!plan) return;
    setBusy(true);
    try {
      const result = await applyAiPlan({
        brief: brief.trim(),
        taskCount,
        provider,
        ...(projectId ? { projectId } : {}),
        ...(apiKey ? { apiKey } : {}),
        ...(model ? { model } : {}),
      });
      toast.success(`Created "${result.projectName}" with ${result.tasksCreated} tasks! 🎉`);
      setPhase('done');
      onApplied?.({ projectId: result.projectId, projectName: result.projectName });
      setTimeout(() => {
        onClose();
        router.push('/projects');
        router.refresh();
      }, 1200);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create project from plan');
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setPhase('input');
    setPlan(null);
    setBrief('');
  };

  const PRIORITY_COLOR: Record<string, string> = {
    urgent: 'text-rose-500 border-rose-500/30 bg-rose-500/10',
    high: 'text-amber-500 border-amber-500/30 bg-amber-500/10',
    medium: 'text-indigo-500 border-indigo-500/30 bg-indigo-500/10',
    low: 'text-slate-500 border-slate-500/30 bg-slate-500/10',
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl glass-panel p-5 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/80 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">AI Project Planner</h2>
              <p className="text-xs text-muted-foreground">
                {phase === 'input' && 'Describe any project — the agent builds the full sprint plan'}
                {phase === 'review' && 'Review the plan, then apply it to your workspace'}
                {phase === 'done' && 'Project created successfully'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Phase 1: Input */}
        {phase === 'input' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Project Brief <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                autoFocus
                placeholder="e.g. Build a fitness tracking mobile app with workout plans, progress charts and social challenges…"
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as 'openai' | 'groq' | 'openrouter' | 'gemini')}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-foreground cursor-pointer"
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Model (optional)</label>
                <input
                  type="text"
                  placeholder="provider default"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Tasks: {taskCount}</label>
                <input
                  type="range"
                  min={3}
                  max={12}
                  value={taskCount}
                  onChange={(e) => setTaskCount(Number(e.target.value))}
                  className="w-full accent-purple-500 mt-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                API Key <span className="text-[10px] normal-case font-normal opacity-70">(optional — server key is used if empty)</span>
              </label>
              <input
                type="password"
                placeholder="sk-…"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-foreground"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
              <button
                onClick={handlePlan}
                disabled={busy}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/25 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                <span>{busy ? 'Planning…' : 'Generate Plan'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: Review */}
        {phase === 'review' && plan && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-foreground">{plan.projectName}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-full border border-slate-500/20 text-muted-foreground whitespace-nowrap shrink-0">
                  {plan.provider}
                </span>
              </div>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {plan.tasks.map((t, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-200/70 dark:border-slate-800/80 p-3">
                  <span className="w-6 h-6 shrink-0 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{t.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${PRIORITY_COLOR[t.priority]}`}>
                        {t.priority}
                      </span>
                      {t.estimatedHours ? (
                        <span className="text-[10px] text-muted-foreground">~{t.estimatedHours}h</span>
                      ) : null}
                    </div>
                    {t.description && <p className="text-xs text-muted-foreground mt-1">{t.description}</p>}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button type="button" onClick={reset} className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                ← Edit brief
              </button>
              <button
                onClick={handleApply}
                disabled={busy}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>{busy ? 'Creating project…' : `Apply — Create project + ${plan.tasks.length} tasks`}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Phase 3: Done */}
        {phase === 'done' && (
          <div className="py-10 flex flex-col items-center text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
            <h3 className="font-bold text-foreground">Plan applied!</h3>
            <p className="text-xs text-muted-foreground mt-1">Redirecting you to your projects…</p>
          </div>
        )}
      </div>
    </div>
  );
}
