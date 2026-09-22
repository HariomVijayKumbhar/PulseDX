'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, Trash2, FolderKanban, ListTodo, AlertTriangle, Loader2, CheckCircle2, Clock, CalendarClock } from 'lucide-react';
import { toast } from 'sonner';
import { getProjects } from '@/lib/api/projects';
import { getTasks } from '@/lib/api/tasks';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: 'task' | 'project' | 'alert';
  href: string;
}

function timeAgo(dateStr?: string | null): string {
  if (!dateStr) return '';
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

/**
 * Builds real notifications from the user's projects and tasks.
 * - Overdue tasks → alert
 * - Tasks due soon (≤2 days) or recently assigned/created → task
 * - Recently created/updated projects → project
 */
function buildNotifications(projects: any[], tasks: any[]): NotificationItem[] {
  const items: NotificationItem[] = [];
  const now = Date.now();
  const twoDays = 2 * 24 * 60 * 60 * 1000;

  for (const t of tasks) {
    const due = t.dueDate ? new Date(t.dueDate).getTime() : null;
    const isOverdue = due !== null && due < now && t.status !== 'done';
    const dueSoon = due !== null && due >= now && due - now <= twoDays && t.status !== 'done';
    if (isOverdue || dueSoon) {
      items.push({
        id: `task-${t.id}`,
        title: isOverdue ? `Task overdue: ${t.title}` : `Task due soon: ${t.title}`,
        description: isOverdue
          ? `This ${t.priority ?? 'medium'} priority task passed its due date.`
          : `Due ${timeAgo(t.dueDate).replace(' ago', ' from now')} · ${t.priority ?? 'medium'} priority.`,
        time: t.dueDate ? timeAgo(t.dueDate) : '',
        unread: isOverdue,
        type: isOverdue ? 'alert' : 'task',
        href: `/tasks?search=${encodeURIComponent(t.title)}`,
      });
    }
  }

  for (const p of projects) {
    const updated = p.updatedAt ?? p.createdAt;
    const recent = updated ? Date.now() - new Date(updated).getTime() < 7 * 24 * 60 * 60 * 1000 : false;
    if (recent) {
      items.push({
        id: `project-${p.id}`,
        title: `Project updated: ${p.name}`,
        description: p.description || 'Project activity in the last 7 days.',
        time: timeAgo(updated),
        unread: false,
        type: 'project',
        href: `/projects/${p.id}`,
      });
    }
  }

  return items.slice(0, 15);
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch real data from the user's projects & tasks when opened
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const [projectRes, taskRes] = await Promise.all([getProjects(), getTasks()]);
      setNotifications(buildNotifications(projectRes?.data ?? [], taskRes?.data ?? []));
      setLoaded(true);
    } catch {
      if (!loaded) toast.error('Could not load notifications');
    } finally {
      setLoading(false);
    }
  };

  const toggleOpen = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) fetchNotifications();
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const openNotification = (item: NotificationItem) => {
    setIsOpen(false);
    setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n)));
    router.push(item.href);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast.success('All notifications marked as read');
  };

  const clearAll = () => {
    setNotifications([]);
    toast.info('Notifications cleared for this session');
  };

  const toggleUnread = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'project':
        return <FolderKanban className="w-4 h-4 text-emerald-500" />;
      case 'task':
        return <ListTodo className="w-4 h-4 text-indigo-500" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={toggleOpen}
        aria-label="View notifications"
        className="relative w-9 h-9 rounded-xl glass-pill hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors focus:outline-none"
      >
        <Bell className="w-4 h-4 text-muted-foreground hover:text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto sm:right-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-96 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Notifications Feed
              </h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  className="text-xs text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Read all
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  title="Clear all"
                  className="text-xs text-muted-foreground hover:text-rose-500 transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
            {loading ? (
              <div className="py-8 text-center flex flex-col items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading notifications…
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((item) => (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openNotification(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openNotification(item);
                    }
                  }}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    item.unread
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40'
                      : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-xs font-semibold truncate ${
                          item.unread ? 'text-foreground font-bold' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.title}
                      </p>
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  {item.unread && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 self-center" />
                  )}
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground">
                {loaded
                  ? 'All caught up — no overdue tasks or recent project activity.'
                  : 'Open to load notifications from your projects and tasks.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
