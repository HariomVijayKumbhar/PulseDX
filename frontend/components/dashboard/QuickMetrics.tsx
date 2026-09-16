'use client';

import React from 'react';
import { UserProfile } from '@/types/user';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { MetricCardSkeleton } from '@/components/ui/SkeletonLoaders';
import { CheckCircle2, GitPullRequest, Clock, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuickMetricsProps {
  user: UserProfile | null;
  isLoading: boolean;
}

export function QuickMetrics({ user, isLoading }: QuickMetricsProps) {
  if (isLoading || !user) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const stats = user.stats || {
    completionRate: 88,
    tasksCompleted: 14,
    openPRs: 3,
    codeReviewsGiven: 12,
    focusHoursWeekly: 34.5,
    velocityScore: 94,
    streakDays: 14,
  };

  const metrics = [
    {
      label: 'Task Completion',
      value: `${stats.completionRate || 88}%`,
      subtitle: `${stats.tasksCompleted || 14} tasks finished`,
      icon: CheckCircle2,
      accent: 'text-emerald-500',
      badge: '+12% this week',
      ringProgress: stats.completionRate || 88,
      ringColors: ['#10b981', '#059669'],
    },
    {
      label: 'Open PRs & Reviews',
      value: `${stats.openPRs || 3}`,
      subtitle: `${stats.codeReviewsGiven || 12} reviews approved`,
      icon: GitPullRequest,
      accent: 'text-indigo-500',
      badge: '3 awaiting merge',
      ringProgress: 75,
      ringColors: ['#6366f1', '#8b5cf6'],
    },
    {
      label: 'Focus Hours',
      value: `${stats.focusHoursWeekly || 34.5}h`,
      subtitle: 'Target: 35.0h / week',
      icon: Clock,
      accent: 'text-purple-500',
      badge: '98% of goal',
      ringProgress: 98,
      ringColors: ['#a855f7', '#ec4899'],
    },
    {
      label: 'Engineering Velocity',
      value: `${stats.velocityScore || 94}`,
      subtitle: `${stats.streakDays || 14} day commit streak 🔥`,
      icon: Zap,
      accent: 'text-amber-500',
      badge: 'Top 5% team',
      ringProgress: stats.velocityScore || 94,
      ringColors: ['#f59e0b', '#ef4444'],
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
