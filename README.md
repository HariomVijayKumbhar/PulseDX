# PulseDX — Developer Productivity Platform

Full-stack internship project built in two self-contained folders.

## Repository Structure

```
/
├── frontend/   ← Task 1 — Next.js 14 dashboard (TypeScript + Tailwind + R3F)
├── backend/    ← Task 2 — REST API (Express + TypeScript, in-memory store)
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### 1 — Frontend (Next.js · port 3000)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 2 — Backend (Express · port 5000)

```bash
cd backend
cp .env.example .env   # first time only
npm install
npm run dev
```

| URL | Description |
|-----|-------------|
| `http://localhost:5000/api/health` | Health check |
| `http://localhost:5000/api/docs`   | Swagger / OpenAPI UI |
| `http://localhost:5000/api/users`  | Users resource |
| `http://localhost:5000/api/projects` | Projects resource |
| `http://localhost:5000/api/tasks`  | Tasks resource |

---

## Roadmap

| Task | Status | Notes |
|------|--------|-------|
| Task 1 — Frontend Dashboard | ✅ Complete | Next.js 14, R3F, Framer Motion |
| Task 2 — REST API (in-memory) | ✅ Complete | Express, Zod validation, Swagger |
| Task 3 — Database Integration | 🔜 Upcoming | PostgreSQL / Prisma |
| Task 4 — Auth + RBAC | 🔜 Upcoming | JWT, refresh tokens |
| Task 5 — Full Integration | 🔜 Upcoming | Wire frontend ↔ backend |
