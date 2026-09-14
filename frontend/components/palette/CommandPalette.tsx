'use client';

import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  BarChart3,
  Settings,
  Moon,
  Sun,
  PlusCircle,
  CheckCircle2,
  Sparkles,
  Layers,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { updateTaskStatus } from '@/lib/api/tasks';

interface CommandPaletteProps {
  tasks?: Array<{ id: string; title: string; status: string }>;
  projects?: Array<{ id: string; title?: string; name?: string }>;
  onRefresh?: () => void;
}

export function CommandPalette({ tasks = [], projects = [], onRefresh }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleMarkTaskDone = async (taskId: string, title: string) => {
    try {
      await updateTaskStatus(taskId, 'done' as any);
      toast.success(`Completed task: "${title}"`);
      if (onRefresh) onRefresh();
      setOpen(false);
    } catch (err: any) {
      toast.error('Failed to complete task');
    }
  };

  return (
    <>
      {/* Global quick trigger helper floating pill or keyboard listener */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4 animate-in fade-in duration-150"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl glass-panel rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <Command className="w-full bg-transparent">
              <div className="flex items-center border-b border-slate-200/50 dark:border-slate-800/60 px-4 py-3">
                <Search className="w-4 h-4 text-muted-foreground mr-3 shrink-0" />
                <Command.Input
                  placeholder="Type a command or search tasks & projects... (ESC to exit)"
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              <Command.List className="max-h-80 overflow-y-auto p-2 text-sm text-foreground scrollbar-thin">
                <Command.Empty className="p-4 text-center text-xs text-muted-foreground">
                  No matching actions, tasks, or projects found.
                </Command.Empty>

                {/* Quick Navigation Group */}
                <Command.Group heading="Navigation" className="px-2 py-1.5 text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
                  <Command.Item
                    onSelect={() => {
                      router.push('/');
                      setOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                    <span>Go to Dashboard</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      router.push('/projects');
                      setOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <FolderKanban className="w-4 h-4 text-purple-500" />
                    <span>Go to Projects</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      router.push('/tasks');
                      setOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <CheckSquare className="w-4 h-4 text-emerald-500" />
                    <span>Go to Tasks</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      router.push('/analytics');
                      setOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <BarChart3 className="w-4 h-4 text-amber-500" />
                    <span>Go to Analytics</span>
                  </Command.Item>
                </Command.Group>

                {/* Quick Actions Group */}
                <Command.Group heading="Quick Actions" className="px-2 py-1.5 text-[10px] font-mono uppercase text-muted-foreground tracking-wider mt-2">
                  <Command.Item
                    onSelect={() => {
                      setTheme(theme === 'dark' ? 'light' : 'dark');
                      toast.success(`Theme switched to ${theme === 'dark' ? 'light' : 'dark'}`);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    {theme === 'dark' ? (
                      <Sun className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Moon className="w-4 h-4 text-indigo-400" />
                    )}
                    <span>Toggle Theme ({theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'})</span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() => {
                      router.push('/tasks');
                      setOpen(false);
                      toast.info('Opening tasks view to add task');
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 text-indigo-500" />
                    <span>Create New Task</span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() => {
                      router.push('/projects');
                      setOpen(false);
                      toast.info('Opening projects view to add project');
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <FolderKanban className="w-4 h-4 text-pink-500" />
                    <span>Create New Project</span>
                  </Command.Item>
                </Command.Group>

                {/* Mark Active Tasks as Done */}
                {tasks.filter((t) => t.status !== 'done').length > 0 && (
                  <Command.Group heading="Mark Task as Done" className="px-2 py-1.5 text-[10px] font-mono uppercase text-muted-foreground tracking-wider mt-2">
                    {tasks
                      .filter((t) => t.status !== 'done')
                      .slice(0, 5)
                      .map((task) => (
                        <Command.Item
                          key={task.id}
                          onSelect={() => handleMarkTaskDone(task.id, task.title)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-emerald-500/10 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground group-hover:text-emerald-500 shrink-0" />
                            <span className="truncate">{task.title}</span>
                          </div>
                          <span className="text-[10px] font-mono bg-slate-200/50 dark:bg-slate-800/60 px-1.5 py-0.5 rounded text-muted-foreground">
                            Complete
                          </span>
                        </Command.Item>
                      ))}
                  </Command.Group>
                )}
              </Command.List>

              <div className="border-t border-slate-200/50 dark:border-slate-800/60 px-4 py-2 text-[10px] text-muted-foreground flex justify-between">
                <span>Navigate with ↑ ↓ and Enter</span>
                <span>ESC to close</span>
              </div>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}
