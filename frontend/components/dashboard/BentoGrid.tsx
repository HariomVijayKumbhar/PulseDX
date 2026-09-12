'use client';

import React, { useState } from 'react';
import { useDashboardData } from '@/lib/hooks/useDashboardData';
import { HeroBanner } from './HeroBanner';
import { QuickMetrics } from './QuickMetrics';
import { ProjectCard } from './ProjectCard';
import { ProjectCardSkeleton } from '@/components/ui/SkeletonLoaders';
import { TaskListSection } from './TaskListSection';
import { StatsCardSection } from './StatsCardSection';
import { ActivityFeed } from './ActivityFeed';
import { FolderKanban, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function BentoGrid() {
  const {
    user,
    projects,
    tasks,
    activities,
    summary,
    isLoading,
    isTasksLoading,
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
      {/* Hero Welcome Banner with 3D Abstract Geometry */}
      <HeroBanner
        user={user}
        onNewTaskClick={() =>
          toast.info('New Task modal ready for Task 2-4 API connection')
        }
      />

      {/* Quick Productivity Metrics Row */}
      <QuickMetrics user={user} isLoading={isLoading} />

      {/* Main Bento Section: Task Backlog (Left) + 3D Stats & Activity (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filterable Task Stream */}
        <div className="lg:col-span-7 xl:col-span-8">
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
          />
        </div>

        {/* Right Column: 3D Visualizer & Telemetry Feed */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <StatsCardSection summary={summary} isLoading={isLoading} />
          <ActivityFeed activities={activities} isLoading={isLoading} />
        </div>
      </div>

      {/* Bottom Section: Active Projects Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-indigo-500" />
              <span>Active Engineering Initiatives</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              High-priority roadmap projects across frontend, cloud infra, and ML systems
            </p>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {projects.length} Initiatives In Flight
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {isLoading ? (
            <>
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </>
          ) : (
            projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
