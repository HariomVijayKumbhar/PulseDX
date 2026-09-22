# PulseDX — End-to-End 3D Full-Stack Developer Platform (Tasks 1–4)

**PulseDX** is an AI-assisted engineering productivity and task management platform featuring a high-performance **3D glassmorphic dashboard**, a **layered Express REST API**, persistent **Supabase PostgreSQL database**, **Supabase Auth**, and built-in **AI task decomposition**.

---

## 🏛️ Repository Architecture

```
/
├── frontend/                     ← Next.js 14 App Router + TypeScript + Tailwind + R3F
│   ├── app/                      ← Pages (/login, /register, /projects, /tasks, /analytics)
│   ├── components/               ← Bento grid, 3D scenes, Command Palette, Toasts
│   ├── context/                  ← AuthContext (Supabase Auth sessions & JWT tokens)
│   ├── lib/api/                  ← Typed API client (Bearer tokens, error handling)
│   └── types/                    ← Strict data contracts (User, Project, Task)
├── backend/                      ← Express + TypeScript REST API
│   ├── supabase/schema.sql       ← PostgreSQL schema, FK constraints, triggers & RLS
│   ├── scripts/seed.ts           ← Database seeder script
│   └── src/
│       ├── lib/supabaseClient.ts ← Singleton Supabase client (used only in services)
│       ├── controllers/          ← HTTP request handlers
│       ├── services/             ← Business logic, joins, filters & aggregate stats
│       ├── middleware/           ← Zod validation, JWT verification, rate limiting, error handling
│       └── routes/               ← Users, Projects, Tasks, Stats & AI endpoints
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js 18+** & **npm 9+**
- A **Supabase account** (free tier at [database.new](https://database.new))

---

### 1. Database Setup (Supabase)
1. In your Supabase Project Dashboard, navigate to the **SQL Editor**.
2. Open and run the migration script located at:
   ```
   backend/supabase/schema.sql
   ```
   This provisions:
   - `users`, `projects`, and `tasks` tables with primary keys (`UUID`), foreign keys, and cascading rules.
   - Check constraints for task status (`todo`, `in-progress`, `done`) and priority (`low`, `medium`, `high`, `urgent`).
   - PostgreSQL trigger (`update_updated_at_column`) that auto-updates `updated_at` on row modifications.
   - Row Level Security (RLS) enabled on all tables with initial development policies.

---

### 2. Backend Setup (`/backend`)
```bash
cd backend
cp .env.example .env
npm install
```

Configure your `backend/.env` with your Supabase credentials:
```env
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_ANON_KEY=<your-anon-key>

# (Optional) For OpenAI-powered task planning
OPENAI_API_KEY=your_openai_api_key
```

Populate the database with sample data and launch the server:
```bash
npm run db:seed     # Seeds sample users, projects, and tasks
npm run dev         # Launches Express API on http://localhost:5000
```

- **Interactive API Docs (Swagger)**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Dashboard Stats**: [http://localhost:5000/api/stats/overview](http://localhost:5000/api/stats/overview)

---

### 3. Frontend Setup (`/frontend`)
```bash
cd frontend
cp .env.local.example .env.local
npm install
```

Configure your `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## ⚡ Core Features Walkthrough

1. **3D Hero & Telemetry Visualization**
   - Procedural React Three Fiber floating geometries with dynamic mouse parallax.
   - Real-time 3D and 2D charts toggling for project and task completion velocity.
   - Ambient particle field that respects `prefers-reduced-motion`.

2. **Command Palette (`Cmd/Ctrl + K`)**
   - Instant keyboard-driven overlay built with `cmdk`.
   - Jump straight to any project or view.
   - Complete tasks directly from the palette using unified service functions.
   - Quick theme toggling (dark/light) with zero hydration mismatch.

3. **Authentication Flow (Supabase Auth)**
   - `/login` and `/register` pages styled with modern glassmorphism.
   - `AuthProvider` & `useAuth()` hook managing live user session state.
   - Automatic `Authorization: Bearer <token>` injection into all API requests.
   - Backend `requireAuth` middleware enforcing valid Supabase JWT tokens on write routes.

4. **AI Sprint Task Generator (`POST /api/ai/suggest-tasks`)**
   - Input high-level goals into the interactive AI Assistant modal.
   - Decomposes complex milestones into prioritized sprint tasks with descriptions and priority levels.
   - Uses OpenAI API if configured, with a robust built-in heuristic engine as a reliable offline fallback.

5. **Joined & Aggregated Database Queries**
   - Relational embedding via Supabase (`.select('*, projects(*), users(*)')`).
   - Database-level statistics via `GET /api/stats/overview` with zero heavy in-memory processing.
   - Multi-field combinable search, filtering, and pagination across all endpoints.

---

## 🚢 Production Deployment

- **Frontend (Next.js)**: Deploy to [Vercel](https://vercel.com) by pointing to the `/frontend` root directory.
- **Backend (Express)**: Deploy to [Render](https://render.com) or [Railway](https://railway.app) by setting root directory to `/backend` with build command `npm run build` and start command `npm start`.
- Ensure `ALLOWED_ORIGINS` on the backend matches the production frontend domain, and `NEXT_PUBLIC_API_URL` points to the deployed backend URL.

---

## 🐳 Running with Docker & Docker Compose

Docker Compose orchestrates all three services — **MongoDB**, **Express API**, and **Next.js** — with a single command.

### Service Architecture

| Service    | Container           | Port   | Data store       |
|------------|---------------------|--------|------------------|
| `mongo`    | pulsedx-mongo       | 27017  | Persistent volume|
| `backend`  | pulsedx-backend     | 5000   | Supabase + Mongo |
| `frontend` | pulsedx-frontend    | 3000   | —                |

> **Teams** are stored in MongoDB. **Users / Projects / Tasks** use Supabase PostgreSQL.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v24+)

### Quick Start

```bash
# 1. Create your root .env from the Docker template
cp .env.docker.example .env

# 2. Fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY
#    (open .env in your editor)

# 3. Build images and start all services
docker compose up --build -d

# 4. (Optional) Seed Supabase with sample users / projects / tasks
docker compose exec backend npm run db:seed

# 5. (Optional) Seed MongoDB with sample teams
docker compose exec backend npm run db:seed:teams
```

### URLs (after startup)

| URL                                      | Description              |
|------------------------------------------|--------------------------|
| http://localhost:3000                    | Frontend (Next.js)       |
| http://localhost:5000/api/health         | API health check         |
| http://localhost:5000/api/docs           | Swagger UI               |
| http://localhost:5000/api/teams          | Teams endpoint (MongoDB) |

### Common Commands

```bash
# View logs for a specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongo

# Stop all services (keeps volumes)
docker compose down

# Stop and wipe all data (including MongoDB volume)
docker compose down -v

# Rebuild a single service after code changes
docker compose up --build backend -d
```

### Development Mode (Hot Reload)

Run both servers with live source-file watching — no rebuilds needed on code changes:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

This mounts your local `backend/src` and `frontend/` directories into the containers and runs `tsx watch` / `next dev` inside them.

