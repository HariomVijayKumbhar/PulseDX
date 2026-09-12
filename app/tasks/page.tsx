'use client';

import React from 'react';
import { useDashboardData } from '@/lib/hooks/useDashboardData';
import { TaskListSection } from '@/components/dashboard/TaskListSection';
import { CheckSquare, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function TasksPage() {
  const {
    tasks,
    isTasksLoading,
    isLoading,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    searchQuery,
    setSearchQuery,
    handleToggleTaskStatus,
  } = useDashboardData();

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <CheckSquare className="w-7 h-7 text-indigo-500" />
          <span>Task Stream & Sprint Backlog</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage, search, and toggle sprint execution items with real-time optimistic state
        </p>
      </div>

      <TaskListSection
        tasks={tasks}
        isLoading={isTasksLoading || isLoading}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onToggleStatus={handleToggleTaskStatus}
        onNewTaskClick={() => toast.info('New Task Drawer (Placeholder for Task 2)')}
      />
    </div>
  );
}
