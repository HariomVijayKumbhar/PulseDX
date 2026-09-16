'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, GitPullRequest, ShieldAlert, Zap, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: 'ci' | 'task' | 'alert' | 'system';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'PR #342 Passed CI Checks',
    description: 'OAuth2 biometric fallback module ready for production deploy.',
    time: '5m ago',
    unread: true,
    type: 'ci',
  },
  {
    id: '2',
    title: 'New Sprint Task Assigned',
    description: 'Alex assigned you to "Implement rate limiting middleware".',
    time: '25m ago',
    unread: true,
    type: 'task',
  },
  {
    id: '3',
    title: 'Telemetry Alert Resolved',
    description: 'Sub-40ms latency verified across all REST endpoints.',
    time: '1h ago',
    unread: false,
    type: 'alert',
  },
  {
    id: '4',
    title: 'PulseDX 3D Engine Updated',
    description: 'Three.js mesh shaders optimized for mobile GPU rendering.',
    time: '3h ago',
    unread: false,
    type: 'system',
  },
];

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

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
    toast.info('Notification feed cleared');
  };

  const toggleUnread = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'ci':
        return <GitPullRequest className="w-4 h-4 text-emerald-500" />;
      case 'task':
        return <Zap className="w-4 h-4 text-indigo-500" />;
      case 'alert':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
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
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
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
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleUnread(item.id)}
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
                No notifications right now.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
