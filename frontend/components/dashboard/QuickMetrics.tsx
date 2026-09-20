'use client';

import React from 'react';
import { UserProfile } from '@/types/user';
import { Task } from '@/types/task';
import { Project } from '@/types/project';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { MetricCardSkeleton } from '@/components/ui/SkeletonLoaders';
import { CheckCircle2, FolderKanban, Layers, AlertCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuickMetricsProps {
  user: UserProfile | null;
  tasks?: Task[];
  projects?: Project[];
  isLoading: boolean;
}

export function QuickMetrics({ user, tasks = [], projects = [], isLoading }: QuickMetricsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'active' || p.status === 'in_progress').length;
  const urgentTasks = tasks.filter((t) => t.priority === 'urgent' || t.priority === 'high').length;

  const metrics = [
    {
      label: 'Task Completion',
      value: `${completionRate}%`,
      subtitle: `${doneTasks} of ${totalTasks} tasks finished`,
      icon: CheckCircle2,
      accent: 'text-emerald-500',
      badge: totalTasks > 0 ? `${doneTasks}/${totalTasks} delivered` : 'No tasks yet',
      ringProgress: completionRate,
      ringColors: ['#10b981', '#059669'],
    },
    {
      label: 'Initiatives',
      value: `${totalProjects}`,
      subtitle: `${activeProjects} active project${activeProjects === 1 ? '' : 's'}`,
      icon: FolderKanban,
      accent: 'text-indigo-500',
      badge: totalProjects > 0 ? 'Live in DB' : 'Create first project',
      ringProgress: totalProjects > 0 ? Math.min(100, Math.round((activeProjects / totalProjects) * 100)) : 0,
      ringColors: ['#6366f1', '#8b5cf6'],
    },
    {
      label: 'In-Flight Work',
      value: `${inProgressTasks}`,
      subtitle: `${todoTasks} queued in backlog`,
      icon: Layers,
      accent: 'text-purple-500',
      badge: inProgressTasks > 0 ? 'Active in sprint' : 'Backlog ready',
      ringProgress: totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0,
      ringColors: ['#a855f7', '#ec4899'],
    },
    {
      label: 'Priority Focus',
      value: `${urgentTasks}`,
      subtitle: `${urgentTasks} urgent / high tasks`,
      icon: AlertCircle,
      accent: urgentTasks > 0 ? 'text-amber-500' : 'text-emerald-500',
      badge: urgentTasks > 0 ? 'Needs attention' : 'All on track',
      ringProgress: totalTasks > 0 ? Math.round((urgentTasks / totalTasks) * 100) : 100,
      ringColors: urgentTasks > 0 ? ['#ef4444', '#f59e0b'] : ['#10b981', '#059669'],
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((item, idx) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
            className="glass-panel glass-panel-hover p-5 rounded-2xl flex items-center justify-between group relative overflow-hidden"
          >
            <div className="space-y-1 z-10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {item.value}
              </div>
              <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              <div className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>{item.badge}</span>
              </div>
            </div>

            <div className="z-10 shrink-0">
              <ProgressRing
                progress={item.ringProgress}
                size={58}
                strokeWidth={5}
                gradientId={`metric-ring-${idx}`}
                startColor={item.ringColors[0]}
                endColor={item.ringColors[1]}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
