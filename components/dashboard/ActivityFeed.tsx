'use client';

import React from 'react';
import { ActivityItem } from '@/types/user';
import { ActivityItemSkeleton } from '@/components/ui/SkeletonLoaders';
import { GitCommit, GitPullRequest, CheckCircle2, Rocket, MessageSquare, Sparkles } from 'lucide-react';

interface ActivityFeedProps {
  activities: ActivityItem[];
  isLoading: boolean;
}

export function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'commit':
        return <GitCommit className="w-3.5 h-3.5 text-indigo-500" />;
      case 'pull_request':
        return <GitPullRequest className="w-3.5 h-3.5 text-purple-500" />;
      case 'deployment':
        return <Rocket className="w-3.5 h-3.5 text-emerald-500" />;
      case 'review':
        return <MessageSquare className="w-3.5 h-3.5 text-blue-500" />;
      case 'task_completed':
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />;
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground">Recent Activity</h3>
          <p className="text-xs text-muted-foreground">Live telemetry stream across repositories</p>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <>
            <ActivityItemSkeleton />
            <ActivityItemSkeleton />
            <ActivityItemSkeleton />
          </>
        ) : (
          activities.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 py-2.5 border-b border-slate-200/50 dark:border-slate-800/50 last:border-0 group"
            >
              <div className="p-1.5 rounded-lg glass-pill shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground line-clamp-1 leading-snug">
                  {item.title}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                  {item.description}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground font-mono">
                  <span>{item.repoName}</span>
                  <span>&bull;</span>
                  <span>{item.timestamp}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
