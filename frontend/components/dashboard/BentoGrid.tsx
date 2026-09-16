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
import { CommandPalette } from '@/components/palette/CommandPalette';
import { CreateTaskModal } from '@/components/ui/CreateTaskModal';
import { FolderKanban, Sparkles, Bot, PlusCircle, CheckCircle2 } from 'lucide-react';
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
    loadAllData,
    refreshTasks,
  } = useDashboardData();

  // Create Task Modal State
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);

  // AI Assistant Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiGoal, setAiGoal] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  const handleAiSuggest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiGoal) return;
    setIsAiLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';
      const res = await fetch(`${apiUrl}/ai/suggest-tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: aiGoal }),
      });
      const data = await res.json();
      if (data?.data?.suggestedTasks) {
        setAiSuggestions(data.data.suggestedTasks);
        toast.success(`Generated ${data.data.suggestedTasks.length} tasks with ${data.data.provider}`);
      } else {
        throw new Error('No suggestions returned');
      }
    } catch (err: any) {
      toast.error('AI generation fallback error: ' + (err.message || 'Check backend'));
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Keyboard Command Palette (Cmd/Ctrl+K) */}
      <CommandPalette tasks={tasks} projects={projects} onRefresh={loadAllData} />

      {/* Hero Welcome Banner with 3D Abstract Geometry */}
      <HeroBanner
        user={user}
        onNewTaskClick={() => setCreateTaskModalOpen(true)}
      />

      {/* AI Sprint Assistant Quick Banner */}
      <div className="glass-panel p-4 rounded-2xl border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-500 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <span>PulseDX AI Task & Sprint Generator</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-500 px-1.5 py-0.5 rounded-full font-mono">
                Phase 4 AI Feature
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Describe any high-level objective and let AI decompose it into prioritized sprint tasks.
            </p>
          </div>
        </div>
        <button
          onClick={() => setAiModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 shrink-0 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch AI Assistant</span>
        </button>
      </div>

      {/* AI Assistant Modal */}
      {aiModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setAiModalOpen(false)}
        >
          <div
            className="w-full max-w-lg glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-slate-800/60 mb-4">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-foreground">AI Sprint Task Planner</h3>
              </div>
              <button
                onClick={() => setAiModalOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAiSuggest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Describe what you want to achieve
                </label>
                <input
                  type="text"
                  required
                  value={aiGoal}
                  onChange={(e) => setAiGoal(e.target.value)}
                  placeholder="e.g. Build end-to-end OAuth2 login with biometric fallback"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-muted-foreground/60"
                />
              </div>

              <button
                type="submit"
                disabled={isAiLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAiLoading ? 'Decomposing with AI...' : 'Generate Sprint Tasks'}</span>
              </button>
            </form>

            {aiSuggestions.length > 0 && (
              <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-1">
                <h4 className="text-xs font-mono uppercase text-muted-foreground">Proposed Tasks</h4>
                {aiSuggestions.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-foreground truncate">{item.title}</span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Productivity Metrics Row */}
      <QuickMetrics user={user} isLoading={isLoading} />

      {/* Main Bento Section: Task Backlog (Left) + 3D Stats & Activity (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
            onNewTaskClick={() => setCreateTaskModalOpen(true)}
          />
        </div>

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

      <CreateTaskModal
        isOpen={createTaskModalOpen}
        onClose={() => setCreateTaskModalOpen(false)}
        projects={projects}
        onTaskCreated={() =>
          refreshTasks({
            status: statusFilter,
            priority: priorityFilter,
            searchQuery: searchQuery.trim(),
          })
        }
      />
    </div>
  );
}
