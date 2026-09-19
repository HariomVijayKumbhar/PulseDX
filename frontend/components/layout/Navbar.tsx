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
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import { NotificationDropdown } from '@/components/ui/NotificationDropdown';
import { GlobalSearchModal } from '@/components/ui/GlobalSearchModal';

interface NavbarProps {
  user?: UserProfile | null;
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Teams', href: '/teams', icon: Users },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  return (
    <>
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
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive
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
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Mobile Quick Search Button */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="sm:hidden p-2 rounded-xl glass-pill text-muted-foreground hover:text-foreground focus:outline-none"
                aria-label="Search dashboard"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Desktop Quick Search Trigger */}
              <button
                id="global-search-trigger"
                onClick={() => setSearchModalOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl glass-pill text-xs text-muted-foreground hover:text-foreground hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Search dashboard...</span>
                <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-200/60 dark:bg-slate-800/80 rounded border border-slate-300 dark:border-slate-700 text-muted-foreground">
                  ⌘K
                </kbd>
              </button>

              {/* Notification Dropdown */}
              <NotificationDropdown />

              {/* Dark / Light Theme Toggle */}
              <ThemeToggle />

              {/* User Profile — real Supabase session data */}
              <UserProfileDropdown />

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
              className="md:hidden border-t border-slate-200/60 dark:border-slate-800/80 bg-background/95 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-2 shadow-xl"
            >
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium bg-slate-100/80 dark:bg-slate-900/60 text-muted-foreground border border-slate-200 dark:border-slate-800 text-left"
              >
                <Search className="w-4 h-4 text-indigo-500" />
                <span>Search dashboard (tasks, projects)...</span>
              </button>

              <div className="pt-1 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                          ? 'text-primary bg-indigo-50 dark:bg-indigo-950/60 font-semibold shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/50'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <GlobalSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </>
  );
}
