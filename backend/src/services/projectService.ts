import { db } from '../data/store';
import { Project, CreateProjectInput, UpdateProjectInput } from '../models/project.model';
import { NotFoundError, BadRequestError } from '../middleware/errorHandler';

export class ProjectService {
  /**
   * Create a new project
   */
  public async createProject(input: CreateProjectInput): Promise<Project> {
    // Validate owner exists
    const owner = db.users.find((u) => u.id === input.ownerId);
    if (!owner) {
      throw new BadRequestError(`Owner with ID '${input.ownerId}' does not exist`);
    }

    const now = new Date().toISOString();
    const newProject: Project = {
      id: `proj_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      name: input.name,
      description: input.description,
      ownerId: input.ownerId,
      status: input.status || 'active',
      createdAt: now,
      updatedAt: now,
    };

    db.projects.push(newProject);
    return newProject;
  }

  /**
   * List all projects
   */
  public async getProjects(): Promise<Project[]> {
    return [...db.projects];
  }

  /**
   * Get single project by ID
   */
  public async getProjectById(id: string): Promise<Project> {
    const project = db.projects.find((p) => p.id === id);
    if (!project) {
      throw new NotFoundError('Project', id);
    }
    return project;
  }

  /**
   * Update an existing project
   */
  public async updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
    const projectIndex = db.projects.findIndex((p) => p.id === id);
    if (projectIndex === -1) {
      throw new NotFoundError('Project', id);
    }

    const existing = db.projects[projectIndex];
    const updated: Project = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    db.projects[projectIndex] = updated;
    return updated;
  }
}

export const projectService = new ProjectService();
