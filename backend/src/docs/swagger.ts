const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Developer Productivity Platform API',
    version: '1.0.0',
    description: `
**Task 2 REST API** for the Developer Productivity Platform.

Manages Users, Projects, and Tasks with layered architecture ready for Task 3 database integration.

### Response Envelope
- **Success**: \`{ "data": ..., "meta": { "timestamp": "...", "total"?: N } }\`
- **Error**: \`{ "error": { "message": "...", "code": "...", "details"?: [...] } }\`

### Authentication (Task 4 Placeholder)
JWT Bearer token auth will be wired in Task 4. Placeholder middleware exists at \`/src/middleware/auth.ts\`.
    `,
    contact: { name: 'PulseDX Team' },
  },
  servers: [
    { url: 'http://localhost:5050', description: 'Local Development Server' },
  ],
  tags: [
    { name: 'Users', description: 'User account management' },
    { name: 'Projects', description: 'Engineering project initiatives' },
    { name: 'Tasks', description: 'Sprint tasks and backlog items' },
    { name: 'Health', description: 'API health monitoring' },
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Returns API health status and server time',
        responses: {
          '200': {
            description: 'API is healthy',
            content: {
              'application/json': {
                example: { data: { status: 'ok', uptime: 120.5, timestamp: '2026-09-12T14:00:00.000Z' } },
              },
            },
          },
        },
      },
    },
    '/api/users': {
      post: {
        tags: ['Users'],
        summary: 'Create a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateUserInput' },
              example: { name: 'Jane Smith', email: 'jane.smith@acme.io', role: 'frontend_specialist' },
            },
          },
        },
        responses: {
          '201': { description: 'User created', content: { 'application/json': { schema: { $ref: '#/components/schemas/UserResponse' } } } },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '409': { description: 'Email already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
      get: {
        tags: ['Users'],
        summary: 'List all users',
        responses: {
          '200': { description: 'Array of users', content: { 'application/json': { schema: { $ref: '#/components/schemas/UsersListResponse' } } } },
        },
      },
    },
    '/api/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'usr_98a72f01' }],
        responses: {
          '200': { description: 'User found', content: { 'application/json': { schema: { $ref: '#/components/schemas/UserResponse' } } } },
          '404': { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/projects': {
      post: {
        tags: ['Projects'],
        summary: 'Create a new project',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateProjectInput' },
              example: { name: 'New Cloud Initiative', ownerId: 'usr_98a72f01', status: 'active' },
            },
          },
        },
        responses: {
          '201': { description: 'Project created', content: { 'application/json': { schema: { $ref: '#/components/schemas/ProjectResponse' } } } },
          '400': { description: 'Validation error or invalid ownerId', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
      get: {
        tags: ['Projects'],
        summary: 'List all projects',
        responses: {
          '200': { description: 'Array of projects', content: { 'application/json': { schema: { $ref: '#/components/schemas/ProjectsListResponse' } } } },
        },
      },
    },
    '/api/projects/{id}': {
      get: {
        tags: ['Projects'],
        summary: 'Get project by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'proj_cloud_nexus' }],
        responses: {
          '200': { description: 'Project found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ProjectResponse' } } } },
          '404': { description: 'Project not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/tasks': {
      post: {
        tags: ['Tasks'],
        summary: 'Create a new task',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateTaskInput' },
              example: { title: 'Implement OAuth2 login flow', projectId: 'proj_cloud_nexus', priority: 'high', status: 'todo' },
            },
          },
        },
        responses: {
          '201': { description: 'Task created', content: { 'application/json': { schema: { $ref: '#/components/schemas/TaskResponse' } } } },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
      get: {
        tags: ['Tasks'],
        summary: 'List tasks with optional filters',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['todo', 'in-progress', 'done'] }, description: 'Filter by task status' },
          { name: 'projectId', in: 'query', schema: { type: 'string' }, description: 'Filter by project ID', example: 'proj_cloud_nexus' },
        ],
        responses: {
          '200': { description: 'Filtered list of tasks', content: { 'application/json': { schema: { $ref: '#/components/schemas/TasksListResponse' } } } },
          '400': { description: 'Invalid filter query values', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/tasks/{id}': {
      get: {
        tags: ['Tasks'],
        summary: 'Get task by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'task_001' }],
        responses: {
          '200': { description: 'Task found', content: { 'application/json': { schema: { $ref: '#/components/schemas/TaskResponse' } } } },
          '404': { description: 'Task not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
      patch: {
        tags: ['Tasks'],
        summary: 'Update a task',
        description: 'Partially update any task fields including status. Status must be one of: "todo" | "in-progress" | "done"',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'task_001' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateTaskInput' },
              example: { status: 'done' },
            },
          },
        },
        responses: {
          '200': { description: 'Task updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/TaskResponse' } } } },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '404': { description: 'Task not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Delete a task',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'task_001' }],
        responses: {
          '204': { description: 'Task deleted successfully (no content)' },
          '404': { description: 'Task not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
  },
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr_98a72f01' },
          name: { type: 'string', example: 'Alex Vance' },
          email: { type: 'string', format: 'email', example: 'alex.vance@acme-labs.io' },
          avatarUrl: { type: 'string', format: 'uri', nullable: true },
          role: { type: 'string', example: 'lead_developer', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Project: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'proj_cloud_nexus' },
          name: { type: 'string', example: 'Nexus Cloud Control Plane' },
          description: { type: 'string', nullable: true },
          ownerId: { type: 'string', example: 'usr_98a72f01' },
          status: { type: 'string', enum: ['planning', 'active', 'in_progress', 'on_hold', 'completed'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'task_001' },
          title: { type: 'string', example: 'Implement dynamic topology visualization' },
          description: { type: 'string', nullable: true },
          projectId: { type: 'string', example: 'proj_cloud_nexus' },
          assigneeId: { type: 'string', nullable: true, example: 'usr_98a72f01' },
          status: { type: 'string', enum: ['todo', 'in-progress', 'done'] },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
          dueDate: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateUserInput: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100 },
          email: { type: 'string', format: 'email' },
          avatarUrl: { type: 'string', format: 'uri' },
          role: { type: 'string' },
        },
      },
      CreateProjectInput: {
        type: 'object',
        required: ['name', 'ownerId'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          ownerId: { type: 'string' },
          status: { type: 'string', enum: ['planning', 'active', 'in_progress', 'on_hold', 'completed'], default: 'active' },
        },
      },
      CreateTaskInput: {
        type: 'object',
        required: ['title', 'projectId'],
        properties: {
          title: { type: 'string', minLength: 2, maxLength: 150 },
          description: { type: 'string', maxLength: 1000 },
          projectId: { type: 'string' },
          assigneeId: { type: 'string' },
          status: { type: 'string', enum: ['todo', 'in-progress', 'done'], default: 'todo' },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
          dueDate: { type: 'string', format: 'date-time' },
        },
      },
      UpdateTaskInput: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 2, maxLength: 150 },
          description: { type: 'string', maxLength: 1000 },
          projectId: { type: 'string' },
          assigneeId: { type: 'string' },
          status: { type: 'string', enum: ['todo', 'in-progress', 'done'] },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
          dueDate: { type: 'string', format: 'date-time' },
        },
      },
      UserResponse: {
        type: 'object',
        properties: {
          data: { $ref: '#/components/schemas/User' },
          meta: { type: 'object', properties: { timestamp: { type: 'string' } } },
        },
      },
      UsersListResponse: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/User' } },
          meta: { type: 'object', properties: { total: { type: 'number' }, timestamp: { type: 'string' } } },
        },
      },
      ProjectResponse: {
        type: 'object',
        properties: {
          data: { $ref: '#/components/schemas/Project' },
          meta: { type: 'object', properties: { timestamp: { type: 'string' } } },
        },
      },
      ProjectsListResponse: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/Project' } },
          meta: { type: 'object', properties: { total: { type: 'number' }, timestamp: { type: 'string' } } },
        },
      },
      TaskResponse: {
        type: 'object',
        properties: {
          data: { $ref: '#/components/schemas/Task' },
          meta: { type: 'object', properties: { timestamp: { type: 'string' } } },
        },
      },
      TasksListResponse: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
          meta: { type: 'object', properties: { total: { type: 'number' }, timestamp: { type: 'string' } } },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              code: { type: 'string' },
              details: { type: 'array', items: { type: 'object' }, nullable: true },
            },
          },
        },
      },
    },
  },
};

export default swaggerDocument;
