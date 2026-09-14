# PulseDX — Backend API (Task 3: Persistent Supabase Data Layer)

REST API for the Developer Productivity Platform. Built with **Express + TypeScript**, backed by a real **Supabase (PostgreSQL)** database.

## Tech Stack
- **Express 4** + **TypeScript 5**
- **Supabase PostgreSQL** (`@supabase/supabase-js`)
- **Zod** for schema validation
- **Helmet**, **CORS**, and **express-rate-limit** for API security
- **Swagger UI** (`/api/docs`) for OpenAPI documentation

---

## Quick Start & Supabase Setup

### 1. Create Supabase Project & Run Migrations
1. Go to [database.new](https://database.new) and create a new project.
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste the contents of `backend/supabase/schema.sql` and run it. This creates:
   - `users`, `projects`, and `tasks` tables with primary keys (`UUID`), foreign keys, and cascading deletes.
   - Check constraints on task status (`todo`, `in-progress`, `done`) and priority (`low`, `medium`, `high`, `urgent`).
   - PostgreSQL trigger (`update_updated_at_column`) to automatically manage `updated_at` on row changes.
   - Row Level Security (RLS) enabled on all tables with initial permissive policies.

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in `backend/`:

```bash
cp .env.example .env
```

Fill in your Supabase credentials:
```env
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_ANON_KEY=<your-anon-key>
```

### 3. Install & Seed Sample Data
```bash
npm install
npm run db:seed     # Populates sample users, projects, and tasks
npm run dev         # Launches Express API with hot-reloading (tsx)
```

---

## API Reference

Base URL: `http://localhost:5000/api`  
Interactive Swagger Docs: `http://localhost:5000/api/docs`

### Response Envelope

**Success**
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-09-14T08:00:00.000Z",
    "total": 12,
    "page": 1,
    "limit": 20
  }
}
```

**Error**
```json
{
  "error": {
    "message": "Resource with ID '...' was not found",
    "code": "NOT_FOUND",
    "details": null
  }
}
```

---

### Endpoints

#### Health
- `GET /api/health` — API health check and server uptime

#### Statistics / Dashboard Overview
- `GET /api/stats/overview` — Database-level aggregated stats (total tasks, completion percentage, tasks by status & priority, project & user totals)

#### Users
- `POST /api/users` — Create user
- `GET /api/users?search=&page=&limit=&sortBy=&order=` — List users with pagination and search
- `GET /api/users/:id` — Get user by UUID
- `PATCH /api/users/:id` — Update user
- `DELETE /api/users/:id` — Delete user (204)

#### Projects
- `POST /api/projects` — Create project
- `GET /api/projects?search=&page=&limit=&sortBy=&order=` — List projects with pagination and search
- `GET /api/projects/:id` — Get project by UUID
- `PATCH /api/projects/:id` — Update project

#### Tasks
- `POST /api/tasks` — Create task
- `GET /api/tasks` — List tasks with combinable filters:
  - `?status=todo|in-progress|done`
  - `?priority=low|medium|high|urgent`
  - `?projectId=<uuid>`
  - `?assigneeId=<uuid>`
  - `?search=<term>`
  - `?includeJoined=true` (embeds project and assignee in one query)
  - `?page=1&limit=20`
  - `?sortBy=created_at&order=desc`
- `GET /api/tasks/:id?includeJoined=true` — Get task by UUID (optionally embeds joined relations)
- `PATCH /api/tasks/:id` — Update task fields
- `DELETE /api/tasks/:id` — Delete task (204)

---

## Architecture & Layered Design

```
backend/
├── supabase/
│   └── schema.sql        ← Complete PostgreSQL schema, constraints, triggers & RLS
├── scripts/
│   └── seed.ts           ← Database seeder script
├── src/
│   ├── lib/
│   │   └── supabaseClient.ts ← Singleton Supabase client (only imported by services)
│   ├── controllers/      ← HTTP request handling & status codes
│   ├── services/         ← Business logic & Supabase queries (joins, filters, aggregates)
│   ├── models/           ← TypeScript types and interfaces
│   ├── middleware/       ← Error handling, validation (Zod), rate limiting, logging, auth
│   ├── utils/
│   │   └── dbError.ts    ← Translates Postgres/Supabase errors to HTTP status codes
│   ├── routes/           ← Express routes
│   ├── app.ts            ← Express configuration
│   └── server.ts         ← HTTP server entry point
```
