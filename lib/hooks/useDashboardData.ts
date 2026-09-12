'use client';

import { useState, useEffect, useCallback } from 'react';
import { Project } from '@/types/project';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { UserProfile, ActivityItem } from '@/types/user';
import { ProductivitySummary, TaskFilterOptions } from '@/types/api';
import { getProjects } from '@/lib/api/projects';
import { getTasks, updateTaskStatus as apiUpdateTaskStatus } from '@/lib/api/tasks';
import { getCurrentUser, getUserActivities, getProductivitySummary } from '@/lib/api/user';
import { toast } from 'sonner';

export function useDashboardData() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [summary, setSummary] = useState<ProductivitySummary | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTasksLoading, setIsTasksLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [userRes, projectsRes, tasksRes, activitiesRes, summaryRes] = await Promise.all([
        getCurrentUser(),
        getProjects(),
        getTasks(),
        getUserActivities(),
        getProductivitySummary(),
      ]);

      setUser(userRes.data);
      setProjects(projectsRes.data);
      setTasks(tasksRes.data);
      setActivities(activitiesRes.data);
      setSummary(summaryRes.data);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err?.message || 'Failed to fetch dashboard metrics');
      toast.error('Could not load dashboard data. Retrying...');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshTasks = useCallback(async (filters: TaskFilterOptions) => {
    setIsTasksLoading(true);
    try {
      const res = await getTasks(filters);
      setTasks(res.data);
    } catch (err: any) {
      toast.error('Failed to filter tasks');
    } finally {
      setIsTasksLoading(false);
    }
  }, []);

  // Trigger task reload when filters change
  useEffect(() => {
    if (!isLoading) {
      refreshTasks({
        status: statusFilter,
        priority: priorityFilter,
        searchQuery: searchQuery.trim(),
      });
    }
  }, [statusFilter, priorityFilter, searchQuery, refreshTasks, isLoading]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleToggleTaskStatus = async (taskId: string, currentStatus: TaskStatus) => {
    const nextStatus: TaskStatus = currentStatus === 'done' ? 'in_progress' : 'done';
    
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    );

    try {
      await apiUpdateTaskStatus(taskId, nextStatus);
      if (nextStatus === 'done') {
        toast.success('Task marked as completed! 🎉', {
          description: 'Productivity velocity updated.',
        });
      } else {
        toast.info('Task marked as in progress.');
      }
    } catch (err) {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: currentStatus } : t))
      );
      toast.error('Failed to update task status');
    }
  };

  return {
    user,
    projects,
    tasks,
    activities,
    summary,
    isLoading,
    isTasksLoading,
    error,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    searchQuery,
    setSearchQuery,
    refreshTasks,
    loadAllData,
    handleToggleTaskStatus,
  };
}
