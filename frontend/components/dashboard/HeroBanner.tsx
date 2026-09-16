'use client';

import React from 'react';
import { UserProfile } from '@/types/user';
import { DynamicHero3D } from '@/components/3d/DynamicScenes';
import { Sparkles, ArrowUpRight, Flame, Code2, GitPullRequest } from 'lucide-react';
import { toast } from 'sonner';

interface HeroBannerProps {
  user: UserProfile | null;
  onNewTaskClick?: () => void;
}

export function HeroBanner({ user, onNewTaskClick }: HeroBannerProps) {
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
            <span>Sprint 42 &middot; 4 Days Remaining</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {user ? user.name.split(' ')[0] : 'Developer'}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
            You have completed <strong className="text-foreground font-semibold">88%</strong> of your committed sprint goals.
            System telemetry reports all services healthy with sub-40ms latency.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                if (onNewTaskClick) onNewTaskClick();
                else toast.info('New Task modal preview');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-purple-500 active:scale-95 transition-all"
            >
              <span>+ Create Task</span>
            </button>

            <button
              onClick={() =>
                toast.info('Sprint Velocity Digest', {
                  description: '14 consecutive streak days. 34.5 deep focus hours recorded.',
                })
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium glass-pill hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all text-foreground"
            >
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Streak: {user?.stats?.streakDays || 14} Days</span>
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
            Interactive R3F Mesh &bull; Mouse Parallax
          </div>
        </div>
      </div>
    </div>
  );
}
