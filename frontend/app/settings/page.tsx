'use client';

import React, { useState } from 'react';
import { MOCK_USER } from '@/lib/mock-data';
import { Settings, User, Shield, Bell, Key, Sparkles, Save, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('pk_live_51M0d98acme982348a');
  const [apiUrl, setApiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    toast.success('Configuration saved (mock state for Task 4)');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-indigo-500" />
          <span>Developer Preferences & API Configuration</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure profile settings, telemetry flags, and future Task 2-4 API connection endpoints
        </p>
      </div>

      {/* User Profile Card */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-5 sm:space-y-6">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-500" />
          <span>Profile Details</span>
        </h3>

        <div className="flex items-center gap-4">
          <img
            src={MOCK_USER.avatarUrl}
            alt={MOCK_USER.name}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-primary/40 shrink-0"
          />
          <div className="min-w-0">
            <h4 className="text-base font-bold text-foreground truncate">{MOCK_USER.name}</h4>
            <p className="text-xs text-muted-foreground truncate">{MOCK_USER.email}</p>
            <span className="inline-block mt-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              {MOCK_USER.roleDisplay} &bull; {MOCK_USER.team}
            </span>
          </div>
        </div>
      </div>

      {/* API Gateway Configuration */}
      <form onSubmit={handleSave} className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-5 sm:space-y-6">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Key className="w-4 h-4 text-purple-500" />
          <span>Backend Integration Settings (Task 2-4 Forward Compatibility)</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              API Base URL (NEXT_PUBLIC_API_URL)
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Currently routed through <code>/lib/api/client.ts</code> mock layer with simulated latency.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Developer Service Token / API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Saved!' : 'Save Preferences'}</span>
        </button>
      </form>
    </div>
  );
}
