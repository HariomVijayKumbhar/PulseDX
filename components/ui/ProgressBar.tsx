'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  height?: string;
  gradientClass?: string;
  className?: string;
}

export function ProgressBar({
  progress,
  height = 'h-2',
  gradientClass = 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
  className = '',
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full bg-slate-200/80 dark:bg-slate-800/80 rounded-full overflow-hidden ${height} ${className}`}>
      <motion.div
        className={`h-full rounded-full ${gradientClass}`}
        initial={{ width: 0 }}
        animate={{ width: `${clampedProgress}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
}
