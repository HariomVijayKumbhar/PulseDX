'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Layers, Lock, Mail, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await signIn(email, password);
      if (error) {
        toast.error(error.message || 'Failed to sign in');
      } else if (data.user) {
        toast.success(`Welcome back, ${data.user.email}!`);
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full glass-panel p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-2xl relative overflow-hidden"
      >
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome to PulseDX</h2>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your productivity workspace</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.vance@acme-labs.io"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-muted-foreground/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-muted-foreground/60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo credentials hint */}
        <div className="mt-6 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/50 text-xs text-muted-foreground flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <span>
            Connects with Supabase Auth. You can also sign up for a new account with any valid email and password.
          </span>
        </div>

        {/* Switch to Register */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Don&apos;t have an account yet?{' '}
          <Link href="/register" className="font-semibold text-indigo-500 hover:underline">
            Create account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
