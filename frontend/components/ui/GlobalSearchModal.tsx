'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, CheckSquare, FolderKanban, ArrowRight, CornerDownLeft } from 'lucide-react';
import { Task } from '@/types/task';
import { Project } from '@/types/project';
import { getTasks } from '@/lib/api/tasks';
import { getProjects } from '@/lib/api/projects';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({
  isOpen,
  onClose,
}: GlobalSearchModalProps) {
  // Live data from the backend — no mock seed
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load real data whenever the modal opens
  useEffect(() => {
    if (!isOpen) return;
    let alive = true;
    Promise.all([getTasks(), getProjects()])
      .then(([t, p]) => {
        if (!alive) return;
        setTasks(Array.isArray(t.data) ? t.data : []);
        setProjects(Array.isArray(p.data) ? p.data : []);
      })
      .catch(() => {
        // backend unreachable — leave lists empty, search simply shows no results
      });
    return () => {
      alive = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open search modal
          const searchBtn = document.getElementById('global-search-trigger');
          if (searchBtn) searchBtn.click();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const filteredTasks = trimmed
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(trimmed) ||
          t.description?.toLowerCase().includes(trimmed) ||
          t.key.toLowerCase().includes(trimmed)
      )
    : tasks.slice(0, 3);

  const filteredProjects = trimmed
    ? projects.filter(
        (p) =>
          p.title.toLowerCase().includes(trimmed) ||
          p.description?.toLowerCase().includes(trimmed) ||
          p.key.toLowerCase().includes(trimmed)
      )
    : projects.slice(0, 3);

  const handleSelectTask = (taskId: string) => {
    router.push('/tasks');
    onClose();
  };

  const handleSelectProject = (projectId: string) => {
    router.push('/projects');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-start justify-center pt-4 sm:pt-20 p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl glass-panel rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200/60 dark:border-slate-800/80 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search tasks, projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-slate-200/60 dark:bg-slate-800/80 rounded border border-slate-300 dark:border-slate-700 text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Search Results */}
        <div className="max-h-[65vh] sm:max-h-96 overflow-y-auto p-3 sm:p-4 space-y-4">
          {/* Sprint Tasks Section */}
          {filteredTasks.length > 0 && (
            <div>
              <h4 className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                <span>Sprint Tasks ({filteredTasks.length})</span>
              </h4>
              <div className="space-y-1">
                {filteredTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTask(t.id)}
                    className="p-2.5 rounded-xl hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 cursor-pointer flex items-center justify-between gap-3 group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800/80 text-muted-foreground font-semibold">
                        {t.key}
                      </span>
                      <span className="text-xs font-semibold text-foreground truncate group-hover:text-indigo-500 transition-colors">
                        {t.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                        {t.priority}
                      </span>
                      <CornerDownLeft className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Engineering Initiatives Section */}
          {filteredProjects.length > 0 && (
            <div>
              <h4 className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5 text-purple-500" />
                <span>Engineering Initiatives ({filteredProjects.length})</span>
              </h4>
              <div className="space-y-1">
                {filteredProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProject(p.id)}
                    className="p-2.5 rounded-xl hover:bg-purple-50/50 dark:hover:bg-purple-950/30 cursor-pointer flex items-center justify-between gap-3 group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500 font-semibold">
                        {p.key}
                      </span>
                      <span className="text-xs font-semibold text-foreground truncate group-hover:text-purple-500 transition-colors">
                        {p.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-muted-foreground">
                        {p.progress}% done
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredTasks.length === 0 && filteredProjects.length === 0 && (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No matching tasks or initiatives found for &quot;{query}&quot;.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-200/60 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/40 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <span>PulseDX Search Engine</span>
          <div className="flex items-center gap-2">
            <span>Press</span>
            <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">↵</kbd>
            <span>to select</span>
          </div>
        </div>
      </div>
    </div>
  );
}
