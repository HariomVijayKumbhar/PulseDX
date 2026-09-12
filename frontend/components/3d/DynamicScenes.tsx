'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamic import of Hero 3D scene with SSR disabled and smooth skeleton fallback
export const DynamicHero3D = dynamic(() => import('./Hero3DCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[220px] flex items-center justify-center">
      <div className="w-32 h-32 rounded-full border-2 border-dashed border-indigo-500/30 animate-spin" />
    </div>
  ),
});

// Dynamic import of Stats 3D chart with SSR disabled
export const DynamicStats3D = dynamic(() => import('./Stats3DCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-56 flex items-center justify-center">
      <div className="h-40 w-full rounded-xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
    </div>
  ),
});

// Dynamic import of Empty State 3D element with SSR disabled
export const DynamicEmptyState3D = dynamic(() => import('./EmptyState3D'), {
  ssr: false,
  loading: () => (
    <div className="w-24 h-24 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
  ),
});

// Dynamic import of background particle canvas
export const DynamicParticleBackground = dynamic(() => import('./ParticleBackground'), {
  ssr: false,
});
