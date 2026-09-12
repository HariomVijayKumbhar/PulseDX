import React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-200/70 dark:bg-slate-800/70',
        className
      )}
    />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-32">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <div>
        <Skeleton className="h-7 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between h-64">
      <div>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-10" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="flex justify-between items-center pt-2">
          <div className="flex -space-x-2">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-7 w-7 rounded-full" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="glass-panel p-4 rounded-xl flex items-center justify-between space-x-4">
      <div className="flex items-center space-x-3 w-full">
        <Skeleton className="h-5 w-5 rounded-md shrink-0" />
        <div className="space-y-2 w-full">
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-14" />
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3 shrink-0">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-7 w-7 rounded-full" />
      </div>
    </div>
  );
}

export function ActivityItemSkeleton() {
  return (
    <div className="flex items-start space-x-3 py-3 border-b border-slate-200/50 dark:border-slate-800/50 last:border-0">
      <Skeleton className="h-8 w-8 rounded-full shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}
