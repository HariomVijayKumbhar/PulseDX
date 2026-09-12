'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserProfile } from '@/types/user';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { UserProfileDropdown } from './UserProfileDropdown';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  user: UserProfile | null;
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/60 dark:border-slate-800/80 bg-background/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  PulseDX
                </span>
                <span className="text-[10px] text-muted-foreground font-mono -mt-1 tracking-wider uppercase">
                  3D Engine v1.0
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'text-primary bg-indigo-50 dark:bg-indigo-950/40 font-semibold shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            {/* Quick Search Trigger */}
            <button
              onClick={() => toast.info('Quick search shortcut: use search bar below to filter tasks in real-time')}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl glass-pill text-xs text-muted-foreground hover:text-foreground hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Search dashboard...</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-200/60 dark:bg-slate-800/80 rounded border border-slate-300 dark:border-slate-700 text-muted-foreground">
                ⌘K
              </kbd>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() =>
                toast.info('Notifications Feed', {
                  description: 'PR #342 passed all CI checks. Ready for production deploy.',
                })
              }
              aria-label="View notifications"
              className="relative w-9 h-9 rounded-xl glass-pill hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors focus:outline-none"
            >
              <Bell className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            </button>

            {/* Dark / Light Theme Toggle */}
            <ThemeToggle />

            {/* User Profile */}
            <UserProfileDropdown user={user} />

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl glass-pill text-muted-foreground hover:text-foreground focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-slate-200/60 dark:border-slate-800/80 bg-background/95 backdrop-blur-2xl px-4 pt-2 pb-4 space-y-1 shadow-xl"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'text-primary bg-indigo-50 dark:bg-indigo-950/50 font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
