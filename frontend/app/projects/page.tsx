'use client';

import React, { useState, useEffect } from 'react';
import { Project, ProjectCategory } from '@/types/project';
import { getProjects } from '@/lib/api/projects';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { ProjectCardSkeleton } from '@/components/ui/SkeletonLoaders';
import { FolderKanban, Plus, Search, Layers, Filter } from 'lucide-react';
import { toast } from 'sonner';

import { CreateProjectModal } from '@/components/ui/CreateProjectModal';

const CATEGORIES: { id: ProjectCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Categories' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend' },
  { id: 'infra', label: 'Cloud Infra' },
  { id: 'ai', label: 'AI & Data' },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const isInitialLoad = React.useRef(true);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (isInitialLoad.current) {
        setIsLoading(true);
      }
      try {
        const res = await getProjects({
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          searchQuery: searchQuery.trim(),
        });
        setProjects(res.data ?? []);
      } catch (err) {
        toast.error('Failed to load projects');
      } finally {
        setIsLoading(false);
        isInitialLoad.current = false;
      }
    }, searchQuery ? 250 : 0);

    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FolderKanban className="w-7 h-7 text-indigo-500" />
            <span>Engineering Initiatives</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse and monitor delivery health across all architecture workstreams
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:opacity-90 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Initiative</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
          </>
        ) : projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No projects found matching the filter criteria.
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onProjectCreated={(newProj) => setProjects((prev) => [newProj, ...prev])}
      />
    </div>
  );
}
