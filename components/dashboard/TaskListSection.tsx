'use client';

import React from 'react';
import { Task, TaskPriority, TaskStatus } from '@/types/task';
import { TaskCard } from './TaskCard';
import { TaskCardSkeleton } from '@/components/ui/SkeletonLoaders';
import { DynamicEmptyState3D } from '@/components/3d/DynamicScenes';
import { Search, Filter, X, SlidersHorizontal, Plus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

interface TaskListSectionProps {
  tasks: Task[];
  isLoading: boolean;
  statusFilter: TaskStatus | 'all';
  setStatusFilter: (status: TaskStatus | 'all') => void;
  priorityFilter: TaskPriority | 'all';
  setPriorityFilter: (priority: TaskPriority | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onToggleStatus: (taskId: string, currentStatus: TaskStatus) => void;
  onNewTaskClick?: () => void;
}

const STATUS_TABS: { id: TaskStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All Tasks' },
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'in_review', label: 'In Review' },
  { id: 'done', label: 'Completed' },
];

const PRIORITY_OPTIONS: { id: TaskPriority | 'all'; label: string }[] = [
  { id: 'all', label: 'All Priorities' },
  { id: 'urgent', label: 'Urgent' },
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
];

export function TaskListSection({
  tasks,
  isLoading,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  searchQuery,
  setSearchQuery,
  onToggleStatus,
  onNewTaskClick,
}: TaskListSectionProps) {
  const hasActiveFilters =
    statusFilter !== 'all' || priorityFilter !== 'all' || searchQuery.trim().length > 0;

  const handleClearFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="glass-panel p-6 rounded-3xl space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span>Sprint Tasks</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
              {tasks.length}
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time developer task backlog and active sprint items
          </p>
        </div>

        {/* Search Bar & Priority Select */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, tag, key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')}
              className="px-3 py-2 rounded-xl text-xs bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer transition-all"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200/50 dark:border-slate-800/60">
        {STATUS_TABS.map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          );
        })}

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-xs font-medium text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 px-2 py-1 ml-auto flex items-center gap-1 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            Clear filters
          </button>
        )}
      </div>

      {/* Task List / Skeleton / Empty State */}
      <div className="space-y-3 min-h-[300px]">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <TaskCardSkeleton key={i} />
            ))}
          </div>
        ) : tasks.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </AnimatePresence>
        ) : (
          /* 3D Empty State */
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <DynamicEmptyState3D />
            <h3 className="text-base font-bold text-foreground">No tasks found</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              We couldn&apos;t find any tasks matching your selected filters or search query.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-foreground hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Reset all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
