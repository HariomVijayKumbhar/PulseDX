'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types/user';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Settings, Shield, User, Zap, Sparkles, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_AVATAR } from '@/lib/avatars';

interface UserProfileDropdownProps {
  user: UserProfile | null;
}

export function UserProfileDropdown({ user }: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user: authUser, signOut } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      setIsOpen(false);
      router.push('/login');
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign out');
    }
  };

  const displayName = authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || user?.name || 'Developer';
  const displayEmail = authUser?.email || user?.email || 'developer@acme.io';
  const avatarUrl =
    (authUser?.user_metadata?.avatar_url as string | undefined) ||
    user?.avatarUrl ||
    DEFAULT_AVATAR;

  if (!authUser && !user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span>Sign In</span>
      </Link>
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
            src={avatarUrl}
            alt={displayName}
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
        </div>
      </button>

      {isOpen && (
        <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto sm:right-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-72 glass-panel rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 border border-slate-200/60 dark:border-slate-800/80">
          {/* Header */}
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200/50 dark:border-slate-800/60">
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-12 h-12 rounded-xl object-cover ring-2 ring-primary/40"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-foreground truncate">{displayName}</h4>
              <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
              <div className="inline-flex items-center gap-1 mt-1 text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                <Sparkles className="w-2.5 h-2.5" />
                {authUser ? 'Supabase Auth' : user?.roleDisplay || 'Developer'}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {user?.stats && (
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
          )}

          {/* Actions */}
          <div className="space-y-1">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/70 rounded-lg transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-muted-foreground" />
              Account Settings
            </Link>
            <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/60">
              {authUser ? (
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
