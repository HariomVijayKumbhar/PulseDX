'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Layers, Lock, Mail, User, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await signUp(email, password, fullName);
      if (error) {
        toast.error(error.message || 'Failed to create account');
      } else {
        toast.success('Account created successfully! Check your inbox or proceed to sign in.');
        router.push('/login');
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
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Create PulseDX Account</h2>
          <p className="text-sm text-muted-foreground mt-1">Start collaborating with 3D telemetry & AI sprint insights</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Vance"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-muted-foreground/60"
              />
            </div>
          </div>

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
                placeholder="•••••••• (min 6 chars)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-muted-foreground/60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Register Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-indigo-500 hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
