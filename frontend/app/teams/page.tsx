'use client';

import React, { useState, useEffect } from 'react';
import { TeamDto, teamApi, TeamMemberDto } from '@/lib/api/teams';
import { getProjects } from '@/lib/api/projects';
import { Project } from '@/types/project';
import { Users, Plus, Loader2, Mail, ShieldCheck, X, UserPlus, FolderSymlink, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamDto[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [addBusy, setAddBusy] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const [teamsData, projectsRes] = await Promise.all([teamApi.list(), getProjects()]);
      setTeams(teamsData);
      setProjects(projectsRes.data ?? []);
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

  const handleAddMember = async (team: TeamDto) => {
    const email = memberEmail.trim().toLowerCase();
    if (!memberName.trim() || !email) {
      toast.error('Member name and email are both required');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (team.members.some((m) => m.email.toLowerCase() === email)) {
      toast.error(`${memberName.trim()} is already a member of ${team.name}`);
      return;
    }
    setAddBusy(true);
    try {
      await teamApi.addMember(team._id, {
        userId: `usr_${email.split('@')[0]}_${Date.now().toString(36)}`,
        name: memberName.trim(),
        email,
      });
      toast.success(`${memberName.trim()} added to ${team.name}`);
      setMemberName('');
      setMemberEmail('');
      await load();
    } catch (err: any) {
      toast.error(err?.message || 'Could not add member');
    } finally {
      setAddBusy(false);
    }
  };

  const handleRemoveMember = async (team: TeamDto, member: TeamMemberDto) => {
    if (member.role === 'owner') {
      toast.error('The team owner cannot be removed');
      return;
    }
    try {
      await teamApi.removeMember(team._id, member.userId);
      toast.success(`${member.name} removed from ${team.name}`);
      await load();
    } catch (err: any) {
      toast.error(err?.message || 'Could not remove member');
    }
  };

  const handleAttachProject = async (team: TeamDto, projectId: string) => {
    if (!projectId) return;
    try {
      await teamApi.attachProject(team._id, projectId);
      toast.success('Project attached to team');
      await load();
    } catch (err: any) {
      toast.error(err?.message || 'Could not attach project');
    }
  };

  const handleDetachProject = async (team: TeamDto, projectId: string) => {
    try {
      await teamApi.detachProject(team._id, projectId);
      toast.success('Project detached');
      await load();
    } catch (err: any) {
      toast.error(err?.message || 'Could not detach project');
    }
  };

  const handleDeleteTeam = async (team: TeamDto) => {
    if (!confirm(`Delete team "${team.name}"? This cannot be undone.`)) return;
    try {
      await teamApi.delete(team._id);
      toast.success(`Team "${team.name}" deleted`);
      setExpandedId(null);
      await load();
    } catch (err: any) {
      toast.error(err?.message || 'Could not delete team');
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
          {teams.map((team) => {
            const isOpen = expandedId === team._id;
            return (
            <div key={team._id} className="glass-panel glass-panel-hover p-5 rounded-2xl">
              <button
                onClick={() => { setExpandedId(isOpen ? null : team._id); setMemberName(''); setMemberEmail(''); }}
                className="w-full text-left"
              >
                <h3 className="font-bold text-foreground flex items-center justify-between">
                  {team.name}
                  <span className="text-[10px] text-muted-foreground">{isOpen ? 'Hide ▲' : 'Manage ▼'}</span>
                </h3>
              </button>
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

                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/70 space-y-4">
                    {/* Members management */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Members
                      </p>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {team.members.map((m) => (
                          <div key={m.userId} className="flex items-center justify-between gap-2 text-xs bg-slate-100/70 dark:bg-slate-900/60 rounded-lg px-2.5 py-1.5">
                            <span className="truncate flex items-center gap-1.5 min-w-0">
                              <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                              <span className="font-medium text-foreground truncate">{m.name}</span>
                              <span className="text-muted-foreground truncate">{m.email}</span>
                              <span className="text-[9px] uppercase font-bold px-1 rounded bg-slate-200 dark:bg-slate-800 text-muted-foreground shrink-0">
                                {m.role}
                              </span>
                            </span>
                            {m.role !== 'owner' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRemoveMember(team, m); }}
                                title="Remove member"
                                className="text-muted-foreground hover:text-rose-500 transition-colors shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {/* Add member form */}
                      <div className="mt-2 flex gap-1.5">
                        <input
                          value={memberName}
                          onChange={(e) => setMemberName(e.target.value)}
                          placeholder="Name"
                          className="w-24 px-2 py-1.5 rounded-lg text-xs bg-slate-100/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <input
                          value={memberEmail}
                          onChange={(e) => setMemberEmail(e.target.value)}
                          placeholder="email@company.com"
                          type="email"
                          className="flex-1 min-w-0 px-2 py-1.5 rounded-lg text-xs bg-slate-100/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <button
                          onClick={() => handleAddMember(team)}
                          disabled={addBusy}
                          title="Add member"
                          className="px-2.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center shrink-0"
                        >
                          {addBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Projects management */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Attached Projects
                      </p>
                      {team.projectIds.length === 0 && (
                        <p className="text-xs text-muted-foreground italic mb-1.5">No projects attached yet</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {team.projectIds.map((pid) => {
                          const proj = projects.find((p) => p.id === pid);
                          return (
                            <span key={pid} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-foreground flex items-center gap-1">
                              <FolderSymlink className="w-3 h-3" /> {proj?.title || pid.slice(0, 8)}
                              <button onClick={() => handleDetachProject(team, pid)} className="hover:text-rose-500">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                      <select
                        onChange={(e) => { handleAttachProject(team, e.target.value); e.target.value = ''; }}
                        defaultValue=""
                        className="w-full px-2 py-1.5 rounded-lg text-xs bg-slate-100/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                      >
                        <option value="" disabled>Attach a project…</option>
                        {projects.filter((p) => !team.projectIds.includes(p.id)).map((p) => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                    </div>

                    {/* Delete team */}
                    <button
                      onClick={() => handleDeleteTeam(team)}
                      className="text-[11px] text-rose-500 hover:text-rose-600 flex items-center gap-1.5 font-semibold transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete team
                    </button>
                  </div>
                )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
