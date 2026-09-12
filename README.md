# 🚀 PulseDX — Developer Productivity Dashboard (3D / Modern Edition)

A high-performance, 3D-accented SaaS **Developer Productivity Dashboard** engineered with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, and **React Three Fiber (R3F)**.

Built with a modern bento-grid layout, glassmorphic cards, procedural 3D elements, light/dark theme switching, rich toast feedback, and an enterprise-grade `/lib/api` data layer ready for seamless backend integration in subsequent full-stack tasks.

---

## 📸 Overview & Features

### 🌟 Core Capabilities
- **Bento-Grid Dashboard**: Balanced layout prioritizing high-value engineering metrics, active sprint tasks, and project velocity.
- **Glassmorphic SaaS Aesthetics**: Refined `backdrop-blur`, subtle borders, soft shadows, and vibrant gradient accents inspired by Linear, Stripe, and Vercel.
- **Responsive Architecture**: Fluid navigation with desktop top-bar, quick-search shortcut (`⌘K`), and an animated mobile drawer menu.
- **Interactive Sprint Backlog**:
  - Live search by task title, key (`NEX-104`, `PUL-88`), or tag.
  - Multi-status filter tabs (**All**, **To Do**, **In Progress**, **In Review**, **Completed**).
  - Priority filter dropdown (**Urgent**, **High**, **Medium**, **Low**).
  - One-click task completion toggle with optimistic state updates and interactive Sonner toast notifications.
- **Project Initiative Cards**: Detailed status badges, team member avatar stacks, due dates, and animated linear progress bars.
- **Smooth Theme Switcher**: Instant transition between dark mode (default) and clean high-contrast light mode with zero layout shift.
- **Accessible State Handling**:
  - Shimmering skeleton loaders (never plain spinners) during simulated async loading.
  - 3D empty state illustration when filters return zero tasks.
  - Automatic `prefers-reduced-motion` detection that gracefully degrades 3D scenes to ambient CSS gradients for motion-sensitive users.

---

### 🔮 3D / Modern Enhancements (React Three Fiber)
1. **Interactive 3D Hero Mesh (`Hero3DCanvas.tsx`)**:
   - A floating, procedural wireframe icosahedron with an inner glowing distorted sphere and orbiting particle ring.
   - Smooth mouse pointer tracking for realistic parallax tilt and rotational momentum.
2. **3D Stats Visualization (`Stats3DCanvas.tsx`)**:
   - Interactive 3D spatial pillar chart comparing project completion rates across engineering initiatives.
   - Hover reactions: pillars elevate and intensify emissive glow on pointer hover.
   - Includes a toggle between **3D Spatial Pillars** and **2D Flat Bars**.
3. **3D Empty State (`EmptyState3D.tsx`)**:
   - Procedural floating wireframe cube with an oscillating inner octahedron rendered when no tasks match current search/filter parameters.
4. **Ambient Particle Field (`ParticleBackground.tsx`)**:
   - Lightweight, low-power GPU-accelerated background particle field drifting at low opacity (`opacity-30`).
5. **Zero Initial Blocking (`DynamicScenes.tsx`)**:
   - All 3D canvases are dynamically imported (`next/dynamic` with `ssr: false`), preventing hydration mismatches and guaranteeing sub-second First Contentful Paint.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict mode, zero `any`) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) + Custom Glassmorphism tokens |
| **3D Graphics** | [Three.js](https://threejs.org/) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) + [@react-three/drei](https://github.com/pmndrs/drei) |
| **Micro-Interactions** | [Framer Motion](https://www.framer.com/motion/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) |
| **Theming** | [next-themes](https://github.com/pacocoursey/next-themes) |

---

## 🔌 Forward-Compatibility Architecture (Tasks 2–4 Ready)

This dashboard is intentionally architected so that connecting to a live REST or GraphQL API in Tasks 2–4 requires **zero component refactoring**:

1. **Decoupled API Service Layer (`/lib/api/`)**:
   - No components directly manipulate raw mock data.
   - All data fetching and mutations pass through `/lib/api/projects.ts`, `/lib/api/tasks.ts`, and `/lib/api/user.ts`.
   - `client.ts` provides a centralized fetch wrapper that switches between local mock simulations and real HTTP requests based on `NEXT_PUBLIC_USE_REAL_BACKEND`.
2. **Strict REST Schemas (`/types/`)**:
   - Data shapes (`Project`, `Task`, `UserProfile`, `ActivityItem`, `ApiResponse<T>`) follow production-ready REST conventions (ISO timestamps, string UUIDs, status enums).
3. **Asynchronous Hooks (`useDashboardData`)**:
   - Implements realistic 300ms network delay simulation and optimistic UI updates.
4. **Environment-Based Configuration**:
   - Includes `.env.local.example` declaring `NEXT_PUBLIC_API_URL` and feature toggles.
5. **Auth UI Placeholders**:
   - User profile dropdown, security tokens, and sign-out buttons are in place, ready for JWT/OAuth integration in Task 4.

---

## 📁 Project Structure

```
d:/full stack/
├── .env.local.example            # Environment variables template
├── README.md                     # Documentation & setup guide
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── app/
│   ├── layout.tsx                # Root layout with ThemeProvider, Toaster, 3D background
│   ├── page.tsx                  # Dashboard Home (Bento Grid)
│   ├── projects/page.tsx         # Dedicated Projects initiative view
│   ├── tasks/page.tsx            # Dedicated Sprint Tasks view
│   ├── analytics/page.tsx        # Productivity & Velocity Telemetry
│   ├── settings/page.tsx         # Preferences & API Configuration
│   └── globals.css               # Glassmorphism utilities & CSS variables
├── components/
│   ├── 3d/
│   │   ├── Hero3DCanvas.tsx      # Mouse-reactive floating icosahedron & core
│   │   ├── Stats3DCanvas.tsx     # 3D spatial pillar chart of project progress
│   │   ├── EmptyState3D.tsx      # Floating wireframe box for empty results
│   │   ├── ParticleBackground.tsx# Subtle ambient drifting particle canvas
│   │   └── DynamicScenes.tsx     # Lazy dynamic loaders with ssr: false
│   ├── layout/
│   │   ├── Navbar.tsx            # Responsive navigation & mobile sheet
│   │   └── UserProfileDropdown.tsx # User avatar, role, velocity preview, auth placeholder
│   ├── dashboard/
│   │   ├── BentoGrid.tsx         # Primary bento-grid orchestrator
│   │   ├── HeroBanner.tsx        # Header welcome section with 3D hero
│   │   ├── QuickMetrics.tsx      # Velocity, focus hours, PR counts with progress rings
│   │   ├── ProjectCard.tsx       # Initiative card with progress indicators
│   │   ├── TaskCard.tsx          # Interactive task item with completion toggle
│   │   ├── TaskListSection.tsx   # Search, filters, empty state, and task list
│   │   ├── StatsCardSection.tsx  # 3D/2D project completion velocity card
│   │   └── ActivityFeed.tsx      # Live developer activity & Git commits stream
│   └── ui/
│       ├── ThemeToggle.tsx       # Dark/Light switch with Framer Motion rotation
│       ├── Badge.tsx             # Priority, Status, and Health badges
│       ├── ProgressBar.tsx       # Animated linear progress bar
│       ├── ProgressRing.tsx      # SVG circular progress indicator
│       └── SkeletonLoaders.tsx   # Shimmer skeleton components
├── lib/
│   ├── api/
│   │   ├── client.ts             # Swappable API client abstraction
│   │   ├── projects.ts           # getProjects(), getProjectById()
│   │   ├── tasks.ts              # getTasks(), updateTaskStatus(), createTask()
│   │   └── user.ts               # getCurrentUser(), getUserActivities()
│   ├── hooks/
│   │   ├── useDashboardData.ts   # Centralized data orchestration hook
│   │   └── useReducedMotion.ts   # Accessibility hook for reduced motion
│   ├── mock-data.ts              # Rich mock datasets
│   └── utils.ts                  # cn() class merger & date utilities
└── types/
    ├── api.ts                    # ApiResponse, PaginatedResponse, FilterOptions
    ├── project.ts                # Project & Member definitions
    ├── task.ts                   # Task & Priority definitions
    └── user.ts                   # UserProfile & Activity definitions
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v18.17.0` or higher (tested on Node v24)
- **npm**: `v9+`

### 2. Installation
Clone or navigate to the project directory and install dependencies:
```bash
npm install
```

### 3. Environment Setup
Copy the example environment configuration:
```bash
cp .env.local.example .env.local
```

### 4. Development Server
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to explore the dashboard.

### 5. Production Build
Verify strict TypeScript compilation and production build optimization:
```bash
npm run build
npm run start
```

---

## ♿ Accessibility & Performance

- **Reduced Motion**: All 3D rotations, particle animations, and canvas instances respect the user's OS-level `prefers-reduced-motion` setting, automatically providing static visual alternatives.
- **Dynamic Imports**: Three.js canvases are never rendered during SSR, avoiding hydration errors and preserving fast initial time-to-interactive.
- **Semantic HTML**: Proper ARIA labels on all icon buttons, search inputs, and modal toggles.

---

## 📄 License
MIT License. Created for the Full-Stack Developer Internship — Task 1.
