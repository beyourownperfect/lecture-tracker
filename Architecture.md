# Architecture

## System Overview

Single-page React application communicating with a Fastify REST API backed by MongoDB.

```
┌─────────────┐     HTTP/JSON     ┌─────────────┐     Mongoose     ┌──────────┐
│  React SPA  │ ────────────────→ │   Fastify   │ ───────────────→ │ MongoDB  │
│  (Vite)     │ ←──────────────── │   API       │ ←─────────────── │          │
└─────────────┘                   └─────────────┘                  └──────────┘
```

## Data Model

```
Subject (12 seeded)
  └── Topic
       ├── Lecture
       │    └── Revision (NOTES | FLASHCARDS)
       └── TopicTest
  └── SubjectTest

FullMockTest (standalone, no parent)
```

## API Design

All endpoints use JSON. Validation via Zod. Errors return `{ error: string }`.

### Core Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/subjects` | All subjects with aggregated lecture stats |
| GET | `/api/subjects/:id/topics` | Topics for a subject |
| POST/PUT/DELETE | `/api/topics`, `/api/topics/:id` | Topic CRUD |
| GET | `/api/topics/:id/lectures` | Lectures with nested revisions |
| POST/PUT/DELETE | `/api/lectures`, `/api/lectures/:id` | Lecture CRUD |
| POST/PUT/DELETE | `/api/revisions`, `/api/revisions/:id` | Revision CRUD (auto-schedules via spaced repetition) |
| GET | `/api/revisions/dashboard` | Overdue/due/upcoming grouped revisions |
| GET | `/api/tests/dashboard` | All tests grouped by type |
| POST/PUT/DELETE | `/api/subject-tests`, `/api/topic-tests`, `/api/mock-tests` | Test CRUD |
| GET | `/health` | Health check |

## Frontend State

**Zustand:** Global view state only (`selectedSubjectId`, `expandedTopicIds`, `view`).

**TanStack Query:** All server state. Optimistic updates on lecture completion, revision toggle, topic edit, and test completion. Stale times set to 30s for dashboards.

## Spaced Repetition

Revisions follow a 4-stage schedule: 3 → 7 → 14 → 30 days. When a numbered revision is marked complete, the next revision is auto-created. Manual-date revisions (no `revisionNumber`) are one-off.

## Deployment

| Service | Platform | Config |
|---------|----------|--------|
| Frontend | Vercel | Build: `npm run build -w packages/web`, Output: `packages/web/dist` |
| Backend | Render | Start: `npm start -w packages/server`, Port: 3001 |
| Database | MongoDB Atlas | M7 cluster recommended |
