# DevOps Academy — Serverless Infrastructure Platform

A full-stack DevOps educational platform built with a TypeScript pnpm monorepo, Next.js App Router frontend, Hono REST API backend, PostgreSQL, and Drizzle ORM.

## Architecture & Monorepo Layout

```text
.
├── apps/
│   ├── api/                 # Hono REST API server (port 4000)
│   └── web/                 # Next.js 16 App Router frontend (port 3000)
├── packages/
│   ├── database/            # Drizzle ORM schema, migrations, and idempotent seed
│   └── shared/              # Shared TypeScript types and Zod validation schemas
├── docker-compose.yml       # Local PostgreSQL 16 service
├── .env.example             # Environment variable template
└── package.json             # Workspace scripts
```

## Core Features

- **Authentication & Authorization**: Email/password registration and login with `bcryptjs`, HMAC-hashed HTTP-only session cookies stored in PostgreSQL (`sessions`), role-based access control (`user` and `admin`), and rate limiting on auth/contact endpoints.
- **Articles & Categories**: Searchable, filterable, sortable, and paginated engineering articles with Markdown + syntax highlighting, view counters, featured flags, and 12 DevOps topic categories.
- **Learning Paths & Lessons**: Ordered multi-lesson tracks with difficulty filters (`beginner`, `intermediate`, `advanced`), learning objectives, code examples, hands-on lab instructions, and previous/next lesson navigation.
- **Progress Tracking & Bookmarks**: Authenticated learners can mark lessons completed/incomplete and save/remove article bookmarks, persisted in PostgreSQL.
- **Comments & Contact**: Authenticated article discussions and public contact form submissions.
- **User & Admin Dashboards**: Learner dashboard (`/dashboard`) for profile editing, path progress, and bookmarks; Admin dashboard (`/admin`) for platform metrics, articles/categories CRUD, paths/lessons management, user role updates, comment moderation, and contact inbox management.

## Local Prerequisites

- **Node.js** `>= 20.9.0`
- **pnpm** `12.x` (or local workspace binaries)
- **PostgreSQL 16** (either local PostgreSQL service or `docker compose up -d postgres`)

## Environment Setup

1. Copy `.env.example` to `.env` (already present for local dev) and ensure `apps/web/.env.local` defines:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   API_URL=http://localhost:4000
   NEXT_PUBLIC_WEB_URL=http://localhost:3000
   WEB_URL=http://localhost:3000
   ```
2. Ensure PostgreSQL is running on `localhost:5432` with database `devops_academy` matching `DATABASE_URL` in `.env`.

## Running Locally

### 1. Start PostgreSQL (if using Docker Compose)
```bash
pnpm db:up
```

### 2. Run Migrations & Seed Data
```bash
pnpm db:migrate
pnpm db:seed
```

Seeded local accounts (defined in `.env`):
- **Admin**: `admin@devopsacademy.local` / `Admin!Local2026`
- **Student**: `sara@devopsacademy.local` / `Student!Local2026`
- **Student**: `omar@devopsacademy.local` / `Student!Local2026`

### 3. Start Development Servers
```bash
pnpm dev
```
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

### 4. Verification Commands
```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Key API Endpoints

| Area | Endpoints |
| :--- | :--- |
| Health | `GET /health` |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `PATCH /api/auth/me` |
| Categories | `GET /api/categories`, `GET /api/categories/:slug`, `POST /api/categories`, `PATCH /api/categories/:id`, `DELETE /api/categories/:id` |
| Articles | `GET /api/articles`, `GET /api/articles/:slug`, `POST /api/articles`, `PATCH /api/articles/:id`, `DELETE /api/articles/:id` |
| Learning Paths | `GET /api/paths`, `GET /api/paths/:slug`, `GET /api/paths/:slug/lessons/:lessonSlug`, `POST /api/paths`, `PATCH /api/paths/:id`, `DELETE /api/paths/:id` |
| Lessons | `GET /api/lessons/:id`, `POST /api/lessons`, `PATCH /api/lessons/:id`, `DELETE /api/lessons/:id` |
| Bookmarks | `GET /api/bookmarks`, `POST /api/bookmarks`, `DELETE /api/bookmarks/:articleId` |
| Progress | `GET /api/progress`, `POST /api/progress` |
| Comments | `GET /api/articles/:id/comments`, `POST /api/articles/:id/comments`, `PATCH /api/comments/:id`, `DELETE /api/comments/:id` |
| Contact | `POST /api/contact` |
| Admin | `GET /api/admin/stats`, `GET /api/admin/users`, `PATCH /api/admin/users/:id`, `GET /api/admin/articles`, `GET /api/admin/paths`, `GET /api/admin/comments`, `GET /api/admin/contact`, `PATCH /api/admin/contact/:id`, `DELETE /api/admin/contact/:id` |
