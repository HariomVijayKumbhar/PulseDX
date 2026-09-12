'use client';

import React from 'react';
import { Task, TaskStatus } from '@/types/task';
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge';
import { Check, Clock, Calendar, MessageSquare, Tag } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (taskId: string, currentStatus: TaskStatus) => void;
}

export function TaskCard({ task, onToggleStatus }: TaskCardProps) {
  const isDone = task.status === 'done';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`glass-panel glass-panel-hover p-4 sm:p-5 rounded-2xl border transition-all ${
        isDone
          ? 'opacity-70 bg-slate-50/50 dark:bg-slate-900/40 border-emerald-500/20'
          : 'border-slate-200/80 dark:border-white/10'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Checkbox Button */}
        <button
          onClick={() => onToggleStatus(task.id, task.status)}
          aria-label={isDone ? 'Mark as incomplete' : 'Mark as complete'}
          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
            isDone
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
              : 'border-2 border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-primary/10'
          }`}
        >
          {isDone && <Check className="w-4 h-4 stroke-[3]" />}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-foreground border border-slate-200 dark:border-slate-700">
              {task.key}
            </span>
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>

          <h4
            className={`text-sm sm:text-base font-semibold text-foreground transition-all ${
              isDone ? 'line-through text-muted-foreground' : ''
            }`}
          >
            {task.title}
          </h4>

          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {task.description}
          </p>

          {/* Tags & Metadata Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full glass-pill text-muted-foreground"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {/* Logged / Estimated Hours */}
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {task.loggedHours}/{task.estimatedHours}h
                </span>
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(task.dueDate)}</span>
              </div>

              {/* Assignee Avatar */}
              <img
                src={task.assignee.avatarUrl}
                alt={task.assignee.name}
                title={`Assigned to ${task.assignee.name}`}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-primary/40"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
