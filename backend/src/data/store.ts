/**
 * ============================================================================
 * TEMPORARY IN-MEMORY DATA STORE (TASK 2)
 * ============================================================================
 * WARNING: This in-memory store is temporary for Task 2.
 * In Task 3, this entire data layer will be replaced with a real database
 * (e.g. PostgreSQL with Prisma/TypeORM or MongoDB).
 *
 * The service layer (/src/services) is the ONLY layer accessing this store,
 * ensuring zero controller or route refactoring when Task 3 DB is integrated.
 * ============================================================================
 */

import { User } from '../models/user.model';
import { Project } from '../models/project.model';
import { Task } from '../models/task.model';

export const initialUsers: User[] = [
  {
    id: 'usr_98a72f01',
    name: 'Alex Vance',
    email: 'alex.vance@acme-labs.io',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    role: 'lead_developer',
    createdAt: '2023-01-15T08:00:00.000Z',
  },
  {
    id: 'usr_54b11c02',
    name: 'Marcus Chen',
    email: 'marcus.chen@acme-labs.io',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    role: 'senior_engineer',
    createdAt: '2023-03-10T09:30:00.000Z',
  },
  {
    id: 'usr_23c44d03',
    name: 'Elena Rostova',
    email: 'elena.rostova@acme-labs.io',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    role: 'devops_engineer',
    createdAt: '2023-06-20T11:15:00.000Z',
  },
];

export const initialProjects: Project[] = [
  {
    id: 'proj_cloud_nexus',
    name: 'Nexus Cloud Control Plane',
    description: 'Next-generation distributed cloud orchestrator and multi-region Kubernetes gateway UI.',
    ownerId: 'usr_98a72f01',
    status: 'in_progress',
    createdAt: '2026-07-01T10:00:00.000Z',
    updatedAt: '2026-09-10T14:32:00.000Z',
  },
  {
    id: 'proj_synth_ai',
    name: 'Synthetic Data & ML Pipeline',
    description: 'Automated privacy-preserving synthetic data generation engine with differential privacy.',
    ownerId: 'usr_98a72f01',
    status: 'in_progress',
    createdAt: '2026-06-15T09:00:00.000Z',
    updatedAt: '2026-09-11T11:20:00.000Z',
  },
  {
    id: 'proj_pulse_design',
    name: 'Pulse Design System v3',
    description: 'Component library overhaul with tokenized micro-interactions and dark mode.',
    ownerId: 'usr_98a72f01',
    status: 'active',
    createdAt: '2026-05-10T11:00:00.000Z',
    updatedAt: '2026-09-11T16:45:00.000Z',
  },
  {
    id: 'proj_apex_edge',
    name: 'Apex Edge Cache API Gateway',
    description: 'Ultra-low latency global caching worker layer with Cloudflare Workers and WebAssembly.',
    ownerId: 'usr_54b11c02',
    status: 'planning',
    createdAt: '2026-08-01T14:00:00.000Z',
    updatedAt: '2026-09-08T09:15:00.000Z',
  },
];

export const initialTasks: Task[] = [
  {
    id: 'task_001',
    title: 'Implement dynamic 3D topology telemetry visualization',
    description: 'Use React Three Fiber to display cluster nodes with live throughput pulses.',
    projectId: 'proj_cloud_nexus',
    assigneeId: 'usr_98a72f01',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2026-09-18T18:00:00.000Z',
    createdAt: '2026-09-05T10:00:00.000Z',
    updatedAt: '2026-09-11T14:20:00.000Z',
  },
  {
    id: 'task_002',
    title: 'Optimize gRPC streaming channel heartbeat timeout',
    description: 'Reduce connection drop rate across multi-cloud regions by tuning Envoy parameters.',
    projectId: 'proj_cloud_nexus',
    assigneeId: 'usr_54b11c02',
    status: 'todo',
    priority: 'urgent',
    dueDate: '2026-09-14T12:00:00.000Z',
    createdAt: '2026-09-08T11:30:00.000Z',
    updatedAt: '2026-09-09T09:00:00.000Z',
  },
  {
    id: 'task_003',
    title: 'Benchmark diffusion noise scheduling in synthetic data sampler',
    description: 'Evaluate inference speedup when quantizing unet weights to FP8.',
    projectId: 'proj_synth_ai',
    assigneeId: 'usr_98a72f01',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2026-09-15T17:00:00.000Z',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-11T12:00:00.000Z',
  },
  {
    id: 'task_004',
    title: 'Publish accessible dark mode color scales to npm registry',
    description: 'Ensure all contrast ratios satisfy APCA bronze level and WCAG 2.2 AAA standards.',
    projectId: 'proj_pulse_design',
    assigneeId: 'usr_98a72f01',
    status: 'done',
    priority: 'medium',
    dueDate: '2026-09-10T18:00:00.000Z',
    createdAt: '2026-09-02T13:10:00.000Z',
    updatedAt: '2026-09-10T17:50:00.000Z',
  },
  {
    id: 'task_005',
    title: 'Compile Rust SHA-256 token verification routine to WebAssembly',
    description: 'Ensure memory footprint is under 64KB for edge deployment on Cloudflare Workers.',
    projectId: 'proj_apex_edge',
    assigneeId: 'usr_54b11c02',
    status: 'in-progress',
    priority: 'urgent',
    dueDate: '2026-09-16T18:00:00.000Z',
    createdAt: '2026-09-04T10:00:00.000Z',
    updatedAt: '2026-09-11T15:10:00.000Z',
  },
];

class InMemoryDataStore {
  public users: User[] = [...initialUsers];
  public projects: Project[] = [...initialProjects];
  public tasks: Task[] = [...initialTasks];

  public reset(): void {
    this.users = [...initialUsers];
    this.projects = [...initialProjects];
    this.tasks = [...initialTasks];
  }
}

export const db = new InMemoryDataStore();
