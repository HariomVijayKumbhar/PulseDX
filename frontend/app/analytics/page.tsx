'use client';

import React, { useState, useEffect } from 'react';
import { ProductivitySummary } from '@/types/api';
import { getProductivitySummary } from '@/lib/api/user';
import { StatsCardSection } from '@/components/dashboard/StatsCardSection';
import { BarChart3, TrendingUp, Calendar, Zap, Activity, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<ProductivitySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getProductivitySummary();
        setSummary(res.data);
      } catch (err) {
        toast.error('Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <BarChart3 className="w-7 h-7 text-indigo-500" />
          <span>Productivity & Velocity Telemetry</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Deep-dive telemetry into sprint velocity, commit cadence, and 3D initiative completion
        </p>
      </div>

      {/* 3D Visualizer Pillar Section */}
      <StatsCardSection summary={summary} isLoading={isLoading} />

      {/* Weekly Velocity Breakdown Table/Chart */}
      {summary && (
        <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Weekly Velocity Trend</h3>
              <p className="text-xs text-muted-foreground">Focus hours and commits logged by day</p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 self-start sm:self-auto">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18% vs Last Sprint</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3 pt-2">
            {summary.weeklyVelocity.map((day) => (
              <div
                key={day.day}
                className="p-2.5 sm:p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/60 text-center space-y-1.5 sm:space-y-2 hover:border-primary/40 transition-colors"
              >
                <div className="text-xs font-bold text-muted-foreground">{day.day}</div>
                <div className="text-xl font-extrabold text-foreground">{day.hours}h</div>
                <div className="flex justify-center items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{day.commits} commits</span>
                  <span>&bull;</span>
                  <span>{day.tasks} tasks</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
