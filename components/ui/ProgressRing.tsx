'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
  className?: string;
  gradientId?: string;
  startColor?: string;
  endColor?: string;
}

export function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 6,
  showText = true,
  className = '',
  gradientId = 'progressGradient',
  startColor = '#6366f1',
  endColor = '#a855f7',
}: ProgressRingProps) {
  const normalizedRadius = (size - strokeWidth) / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg height={size} width={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={startColor} />
            <stop offset="100%" stopColor={endColor} />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
          className="text-slate-200 dark:text-slate-800"
        />
        {/* Animated Progress Fill */}
        <motion.circle
          stroke={`url(#${gradientId})`}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {showText && (
        <span className="absolute text-xs font-semibold text-foreground tracking-tight">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
}
