'use client';

import React, { useState, useEffect } from 'react';
import { TeamDto, teamApi } from '@/lib/api/teams';
import { Users, Plus, Loader2, Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      setTeams(await teamApi.list());
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load teams — verify backend connection');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Team name is required');
      return;
    }
    setIsSubmitting(true);
    try {
      await teamApi.create({ name: name.trim(), description: description.trim() || undefined });
      toast.success('Team squad created 🎉');
      setName('');
      setDescription('');
      setIsCreating(false);
      await load();
    } catch (err: any) {
      toast.error(err?.message || 'Could not create team. Make sure you are signed in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="w-7 h-7 text-indigo-500" /> Teams
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Group people and projects together for collaborative sprints
          </p>
        </div>
        <button
          onClick={() => setIsCreating((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:opacity-90 active:scale-95 transition-all self-start"
        >
          <Plus className="w-4 h-4" /> New Team
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="glass-panel p-4 rounded-2xl space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Team name (e.g. Platform Squad)"
            className="w-full px-3 py-2 rounded-xl text-sm bg-slate-100/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this team work on?"
            className="w-full px-3 py-2 rounded-xl text-sm bg-slate-100/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{isSubmitting ? 'Creating Team...' : 'Create Team'}</span>
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <Users className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">No teams yet — create your first squad above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div key={team._id} className="glass-panel glass-panel-hover p-5 rounded-2xl">
              <h3 className="font-bold text-foreground">{team.name}</h3>
              {team.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{team.description}</p>
              )}
              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                <span className="mx-1">·</span>
                {team.projectIds.length} project{team.projectIds.length !== 1 ? 's' : ''}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {team.members.slice(0, 4).map((m) => (
                  <span
                    key={m.userId}
                    title={`${m.name} (${m.role})`}
                    className="text-[10px] px-2 py-0.5 rounded-md glass-pill text-muted-foreground flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3" /> {m.name}
                  </span>
                ))}
                {team.members.length > 4 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md glass-pill text-muted-foreground">
                    +{team.members.length - 4}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
