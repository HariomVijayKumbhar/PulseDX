'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRealUserProfile, saveAvatarChoice } from '@/lib/hooks/useRealUserProfile';
import { AVATAR_3D_OPTIONS as HUMAN_AVATAR_OPTIONS } from '@/components/3d/Human3DAvatar';
import dynamic from 'next/dynamic';

const Human3DAvatar = dynamic(() => import('@/components/3d/Human3DAvatar'), {
  ssr: false,
  loading: () => <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />,
});
import { Settings, User, Shield, Bell, Key, Sparkles, Save, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuth();
  const profile = useRealUserProfile();
  const [avatarStyleId, setAvatarStyleId] = useState(profile.avatarStyle.id);
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api');
  const [saved, setSaved] = useState(false);

  const selectedStyle = HUMAN_AVATAR_OPTIONS.find((a) => a.id === avatarStyleId) || profile.avatarStyle;

  const handleAvatarPick = (id: string) => {
    setAvatarStyleId(id);
    if (user?.id) saveAvatarChoice(user.id, id);
    toast.success('3D persona updated!');
  };

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
          <Human3DAvatar style={selectedStyle} className="w-20 h-20 sm:w-24 sm:h-24" />
          <div className="min-w-0">
            <h4 className="text-base font-bold text-foreground truncate">{profile.name}</h4>
            <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
            <span className="inline-block mt-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              @{profile.username}
            </span>
          </div>
        </div>

        {/* 3D Human Persona Picker */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Your 3D Persona
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {HUMAN_AVATAR_OPTIONS.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => handleAvatarPick(style.id)}
                className={`rounded-xl overflow-hidden border-2 transition-all ${
                  avatarStyleId === style.id
                    ? 'border-indigo-500 ring-2 ring-indigo-500/40'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <Human3DAvatar style={style} className="w-full h-16" />
                <span className="block text-[10px] font-semibold pb-1 text-muted-foreground">{style.label}</span>
              </button>
            ))}
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
