'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/types/project';
import { HealthBadge, StatusBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CheckCircle2, GitBranch, AlertCircle, Calendar, ExternalLink } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/projects/${project.id}`)}
      className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between h-full relative overflow-hidden group cursor-pointer"
    >
      {/* Top Accent Gradient Line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${project.colorAccent}`}
      />

      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-foreground border border-slate-200 dark:border-slate-700">
              {project.key}
            </span>
            <StatusBadge status={project.status} />
          </div>
          <HealthBadge health={project.health} />
        </div>

        {/* Title and Description */}
        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
          <span>{project.title}</span>
          {project.repositoryUrl && (
            <button
              onClick={() =>
                toast.info(`Navigating to repository for ${project.title}`)
              }
              aria-label="Repository link"
              className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
        </h3>
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md glass-pill text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md glass-pill text-muted-foreground">
              +{project.tags.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Progress & Team Footer */}
      <div className="pt-5 mt-4 border-t border-slate-200/50 dark:border-slate-800/60 space-y-3">
        {/* Progress Bar & percentage */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {project.completedTasks} / {project.totalTasks} Tasks
            </span>
            <span className="font-bold text-foreground">{project.progress}%</span>
          </div>
          <ProgressBar progress={project.progress} />
        </div>

        {/* Member Avatars & Due Date */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center -space-x-2">
            {project.members.map((member) => (
              <img
                key={member.id}
                src={member.avatarUrl}
                alt={member.name}
                title={`${member.name} (${member.role})`}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-card"
              />
            ))}
          </div>

          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>Due {formatDate(project.dueDate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
