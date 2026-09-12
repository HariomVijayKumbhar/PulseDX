import React from 'react';
import { TaskPriority, TaskStatus } from '@/types/task';
import { ProjectHealth, ProjectStatus } from '@/types/project';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Clock, Flame, PlayCircle, ShieldAlert, Sparkles } from 'lucide-react';

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const configs: Record<TaskPriority, { label: string; bg: string; text: string; icon: any }> = {
    low: {
      label: 'Low',
      bg: 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700',
      text: 'text-slate-600 dark:text-slate-400',
      icon: Clock,
    },
    medium: {
      label: 'Medium',
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60',
      text: 'text-blue-700 dark:text-blue-300',
      icon: Sparkles,
    },
    high: {
      label: 'High',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
      text: 'text-amber-700 dark:text-amber-300',
      icon: AlertCircle,
    },
    urgent: {
      label: 'Urgent',
      bg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/60',
      text: 'text-rose-700 dark:text-rose-300',
      icon: Flame,
    },
  };

  const config = configs[priority];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm',
        config.bg,
        config.text,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

interface StatusBadgeProps {
  status: TaskStatus | ProjectStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const configs: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    todo: {
      label: 'To Do',
      bg: 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700',
      text: 'text-slate-700 dark:text-slate-300',
      dot: 'bg-slate-400',
    },
    in_progress: {
      label: 'In Progress',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60',
      text: 'text-indigo-700 dark:text-indigo-300',
      dot: 'bg-indigo-500 animate-pulse',
    },
    in_review: {
      label: 'In Review',
      bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60',
      text: 'text-purple-700 dark:text-purple-300',
      dot: 'bg-purple-500',
    },
    done: {
      label: 'Completed',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    },
    completed: {
      label: 'Completed',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    },
    active: {
      label: 'Active',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500 animate-pulse',
    },
    planning: {
      label: 'Planning',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
      text: 'text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500',
    },
    on_hold: {
      label: 'On Hold',
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60',
      text: 'text-rose-700 dark:text-rose-300',
      dot: 'bg-rose-500',
    },
  };

  const config = configs[status] || configs.todo;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm',
        config.bg,
        config.text,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}

export function HealthBadge({ health }: { health: ProjectHealth }) {
  const configs: Record<ProjectHealth, { label: string; text: string; bg: string }> = {
    on_track: {
      label: 'On Track',
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    at_risk: {
      label: 'At Risk',
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    delayed: {
      label: 'Delayed',
      text: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
    },
  };
  const config = configs[health];

  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-md border', config.bg, config.text)}>
      {config.label}
    </span>
  );
}
