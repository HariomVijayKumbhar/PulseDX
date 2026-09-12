'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '@/types/user';
import { LogOut, Settings, Shield, User, Zap, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfileDropdownProps {
  user: UserProfile | null;
}

export function UserProfileDropdown({ user }: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-xl glass-pill hover:ring-2 hover:ring-primary/50 transition-all focus:outline-none"
        aria-label="User profile menu"
      >
        <div className="relative w-8 h-8 rounded-lg overflow-hidden">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 glass-panel rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200/50 dark:border-slate-800/60">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-12 h-12 rounded-xl object-cover ring-2 ring-primary/40"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-foreground truncate">{user.name}</h4>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <div className="inline-flex items-center gap-1 mt-1 text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                <Sparkles className="w-2.5 h-2.5" />
                {user.roleDisplay}
              </div>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="grid grid-cols-2 gap-2 my-3 p-2 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 text-center">
            <div>
              <div className="text-xs text-muted-foreground">Velocity Score</div>
              <div className="text-sm font-bold text-foreground">{user.stats.velocityScore}%</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
              <div className="text-sm font-bold text-emerald-500">{user.stats.streakDays} days 🔥</div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-1">
            <button
              onClick={() => {
                toast.info('Profile management preview (Task 4 Auth placeholder)');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/70 rounded-lg transition-colors"
            >
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              Account Settings
            </button>
            <button
              onClick={() => {
                toast.info('Security policies placeholder');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/70 rounded-lg transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-muted-foreground" />
              API Keys & Security
            </button>
            <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/60">
              <button
                onClick={() => {
                  toast.success('Mock session signed out');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out (Placeholder)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
