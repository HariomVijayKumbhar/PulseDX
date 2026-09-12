# PulseDX — Backend API

REST API for the Developer Productivity Platform. Built with **Express + TypeScript**, in-memory data store (Task 3 will swap in PostgreSQL/Prisma).

## Quick Start

```bash
cp .env.example .env
npm install
npm run dev          # tsx watch — hot reload
npm run build        # compile to dist/
npm start            # run compiled output
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | HTTP port |
| `NODE_ENV` | `development` | Runtime environment |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated CORS origins |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |

---

## API Reference

Base URL: `http://localhost:5000/api`  
Interactive docs: `http://localhost:5000/api/docs`

### Response Envelope

**Success**
```json
{ "data": { ... }, "meta": { "timestamp": "2026-09-12T14:00:00.000Z", "total": 5 } }
```

**Error**
```json
{ "error": { "message": "Not found", "code": "NOT_FOUND" } }
```

---

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Server health + uptime |

**Response 200**
```json
{ "data": { "status": "ok", "uptime": 120.5, "timestamp": "2026-09-12T14:00:00.000Z" } }
```

---

### Users

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/users` | Create a user |
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user by ID |

**POST /api/users** — Body
```json
{
  "name": "Jane Smith",
  "email": "jane@acme.io",
  "role": "frontend_specialist",
  "avatarUrl": "https://i.pravatar.cc/150?u=jane"
}
```

**Response 201**
```json
{
  "data": {
    "id": "usr_a1b2c3d4",
    "name": "Jane Smith",
    "email": "jane@acme.io",
    "role": "frontend_specialist",
    "avatarUrl": "https://i.pravatar.cc/150?u=jane",
    "createdAt": "2026-09-12T14:00:00.000Z"
  },
  "meta": { "timestamp": "2026-09-12T14:00:00.000Z" }
}
```

**Error — 409 Conflict** (duplicate email)
```json
{ "error": { "message": "User with this email already exists", "code": "CONFLICT" } }
```

---

### Projects

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/projects` | Create a project |
| GET | `/api/projects` | List all projects |
| GET | `/api/projects/:id` | Get project by ID |

**POST /api/projects** — Body
```json
{
  "name": "Nexus Cloud Control Plane",
  "description": "Unified cloud orchestration layer",
  "ownerId": "usr_98a72f01",
  "status": "active"
}
```

`status` enum: `planning` | `active` | `in_progress` | `on_hold` | `completed`

**Response 201**
```json
{
  "data": {
    "id": "proj_e5f6g7h8",
    "name": "Nexus Cloud Control Plane",
    "description": "Unified cloud orchestration layer",
    "ownerId": "usr_98a72f01",
    "status": "active",
    "createdAt": "2026-09-12T14:00:00.000Z",
    "updatedAt": "2026-09-12T14:00:00.000Z"
  },
  "meta": { "timestamp": "2026-09-12T14:00:00.000Z" }
}
```

---

### Tasks

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks` | List tasks (filterable) |
| GET | `/api/tasks/:id` | Get task by ID |
| PATCH | `/api/tasks/:id` | Update task fields |
| DELETE | `/api/tasks/:id` | Delete task (204) |

**POST /api/tasks** — Body
```json
{
  "title": "Implement OAuth2 login",
  "description": "Use PKCE flow with Google provider",
  "projectId": "proj_cloud_nexus",
  "assigneeId": "usr_98a72f01",
  "priority": "high",
  "status": "todo",
  "dueDate": "2026-10-01T00:00:00.000Z"
}
```

`status` enum: `todo` | `in-progress` | `done`  
`priority` enum: `low` | `medium` | `high` | `urgent`

**GET /api/tasks** — Query filters
```
GET /api/tasks?status=in-progress
GET /api/tasks?projectId=proj_cloud_nexus
GET /api/tasks?status=todo&projectId=proj_auth_service
```

**PATCH /api/tasks/:id** — Partial update
```json
{ "status": "done" }
```

**DELETE /api/tasks/:id** — Returns `204 No Content`

---

## Architecture

```
src/
├── app.ts               ← Express app (middleware stack)
├── server.ts            ← HTTP server + graceful shutdown
├── docs/
│   └── swagger.ts       ← OpenAPI 3.0 spec
├── routes/
│   ├── index.ts         ← Aggregates all routers + /health
│   ├── userRoutes.ts
│   ├── projectRoutes.ts
│   └── taskRoutes.ts
├── controllers/         ← HTTP layer (req → service → res)
├── services/            ← Business logic (only layer touching db)
├── models/              ← TypeScript interfaces
├── data/
│   └── store.ts         ← InMemoryDataStore (swap for DB in Task 3)
└── middleware/
    ├── errorHandler.ts  ← Centralised AppError + error middleware
    ├── validate.ts      ← Zod schemas + validate() HOF
    ├── rateLimiter.ts   ← generalLimiter + writeLimiter
    ├── logger.ts        ← Request logger w/ field redaction
    └── auth.ts          ← JWT placeholder (Task 4)
```

**Data flow**: `Route → Controller → Service → InMemoryDataStore`  
**Error flow**: `throw AppError → next(err) → errorHandler middleware`

> Task 3 will replace only the `src/data/store.ts` and `src/services/` layer — no route or controller changes needed.
