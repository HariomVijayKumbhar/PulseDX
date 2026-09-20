'use client';

import React from 'react';
import { UserProfile } from '@/types/user';
import { Task } from '@/types/task';
import { Project } from '@/types/project';
import { DynamicHero3D } from '@/components/3d/DynamicScenes';
import { Sparkles, ArrowUpRight, Flame, Database, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface HeroBannerProps {
  user: UserProfile | null;
  tasks?: Task[];
  projects?: Project[];
  onNewTaskClick?: () => void;
}

export function HeroBanner({ user, tasks = [], projects = [], onNewTaskClick }: HeroBannerProps) {
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const projectCount = projects.length;

  return (
    <div className="relative overflow-hidden rounded-3xl glass-panel border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 transition-all">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
        {/* Left Column: Greeting & Summary */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold glass-pill text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {totalTasks > 0
                ? `${doneTasks}/${totalTasks} Tasks Delivered (${completionRate}%)`
                : 'Live Workspace &bull; Ready for Sprints'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {user ? user.name.split(' ')[0] : 'Developer'}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
            {totalTasks > 0 ? (
              <>
                You have completed <strong className="text-foreground font-semibold">{completionRate}%</strong> of your sprint tasks ({doneTasks} closed, {inProgressTasks} in flight) across{' '}
                <strong className="text-foreground font-semibold">{projectCount}</strong> active {projectCount === 1 ? 'initiative' : 'initiatives'}.
              </>
            ) : (
              <>
                Welcome to your engineering command center. Start by creating your first initiative and decomposing milestones into prioritized sprint tasks.
              </>
            )}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                if (onNewTaskClick) onNewTaskClick();
                else toast.info('New Task modal');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-purple-500 active:scale-95 transition-all"
            >
              <span>+ Create Task</span>
            </button>

            <button
              onClick={() =>
                toast.info('Workspace Telemetry', {
                  description: `${totalTasks} total tasks logged across ${projectCount} active projects. All databases connected.`,
                })
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium glass-pill hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all text-foreground"
            >
              <Database className="w-4 h-4 text-emerald-500" />
              <span>{totalTasks} Tasks &bull; {projectCount} Projects</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Right Column: 3D Interactive Hero Canvas */}
        <div className="lg:col-span-5 h-56 sm:h-64 flex items-center justify-center relative">
          <div className="w-full h-full">
            <DynamicHero3D />
          </div>
          <div className="absolute bottom-1 right-2 text-[10px] font-mono text-muted-foreground/60 select-none">
            Interactive R3F &bull; Motion &amp; Touch
          </div>
        </div>
      </div>
    </div>
  );
}
