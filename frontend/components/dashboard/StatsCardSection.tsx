'use client';

import React, { useState } from 'react';
import { Project } from '@/types/project';
import { Task } from '@/types/task';
import { ProductivitySummary } from '@/types/api';
import { DynamicStats3D } from '@/components/3d/DynamicScenes';
import { Box, BarChart2, Sparkles, Layers, Info } from 'lucide-react';

interface StatsCardSectionProps {
  summary?: ProductivitySummary | null;
  projects?: Project[];
  tasks?: Task[];
  isLoading: boolean;
}

export function StatsCardSection({ summary, projects = [], tasks = [], isLoading }: StatsCardSectionProps) {
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  if (isLoading) {
    return (
      <div className="glass-panel p-6 rounded-3xl h-80 flex flex-col justify-between">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-48 w-full bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const colors = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
  const projectCompletionRates = summary?.projectCompletionRates?.length
    ? summary.projectCompletionRates
    : projects.map((proj, idx) => {
        const projTasks = tasks.filter((t) => t.projectId === proj.id);
        const done = projTasks.filter((t) => t.status === 'done').length;
        const rate = projTasks.length > 0 ? Math.round((done / projTasks.length) * 100) : (proj.progress || 0);
        return {
          name: proj.title,
          key: proj.key || proj.title.slice(0, 4).toUpperCase(),
          rate,
          color: colors[idx % colors.length],
        };
      });

  if (projectCompletionRates.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-3xl min-h-[300px] flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
          <Box className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">Project Completion Velocity</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            No active engineering initiatives yet. Create an initiative in the Projects tab or use the AI generator to start tracking delivery.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden group">
      {/* Header with 3D/2D toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-foreground">Project Completion Velocity</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 font-semibold flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              R3F 3D Engine
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time delivery progress across active engineering initiatives
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center p-1 rounded-xl glass-pill self-start sm:self-auto shrink-0">
          <button
            onClick={() => setViewMode('3d')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === '3d'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D<span className="hidden sm:inline"> Spatial</span></span>
          </button>
          <button
            onClick={() => setViewMode('2d')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === '2d'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>2D<span className="hidden sm:inline"> Flat</span></span>
          </button>
        </div>
      </div>

      {/* Main Visual Content */}
      <div className="my-3 min-h-[220px] flex items-center justify-center">
        {viewMode === '3d' ? (
          <div className="w-full">
            <DynamicStats3D stats={projectCompletionRates} />
          </div>
        ) : (
          /* 2D Flat Chart View */
          <div className="w-full h-56 flex items-end justify-between gap-3 px-4 pt-4 pb-2">
            {projectCompletionRates.map((proj) => (
              <div key={proj.key} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-foreground">{proj.rate}%</span>
                <div className="w-full max-w-[48px] bg-slate-200 dark:bg-slate-800 rounded-t-xl relative h-36 overflow-hidden">
                  <div
                    className="w-full absolute bottom-0 rounded-t-xl transition-all duration-700 ease-out"
                    style={{
                      height: `${proj.rate}%`,
                      backgroundColor: proj.color,
                    }}
                  />
                </div>
                <div className="text-center">
                  <div className="font-mono text-xs font-bold text-foreground">{proj.key}</div>
                  <div className="text-[10px] text-muted-foreground truncate max-w-[64px]">
                    {proj.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-200/50 dark:border-slate-800/60">
        {projectCompletionRates.map((proj) => (
          <div key={proj.key} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: proj.color }}
            />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-foreground truncate">{proj.name}</p>
              <p className="text-[10px] text-muted-foreground">{proj.rate}% completed</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
