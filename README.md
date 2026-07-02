# GATE CSE Lecture Tracker

A personal study tracking application for GATE Computer Science exam preparation. Track lectures, revisions, PYQs, and tests across 12 subjects.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand, Base UI
- **Backend:** Fastify 5, TypeScript, Zod validation, Mongoose ODM
- **Database:** MongoDB (Atlas for production)
- **Testing:** Vitest, React Testing Library
- **Deployment:** Vercel (frontend), Render (backend)

## Quick Start

### Prerequisites

- Node.js 22+
- MongoDB (local: `mongodb://localhost:27017` or Atlas)

### Setup

```bash
git clone <repo-url>
cd lecture-tracker
npm install
```

### Environment Variables

**Server** (`packages/server/.env`):
```
PORT=3001
HOST=0.0.0.0
MONGODB_URI=mongodb://localhost:27017/lecture-tracker
NODE_ENV=development
CLIENT_URL=http://localhost:5173
LOG_LEVEL=info
```

**Web** (`packages/web/.env`):
```
VITE_API_URL=http://localhost:3001
```

### Seed Database

```bash
npm run db:seed
```

This creates the 12 preset GATE CSE subjects.

### Run Locally

```bash
npm run dev
```

Starts both the backend (port 3001) and frontend (port 5173) concurrently.

## Project Structure

```
packages/
├── server/                     # Fastify API
│   └── src/
│       ├── index.ts            # Server entry point
│       ├── lib/
│       │   ├── db.ts           # MongoDB connection
│       │   └── errors.ts       # Error handler
│       ├── models/index.ts     # Mongoose schemas
│       ├── routes/             # API routes
│       ├── schemas/            # Zod validation
│       └── seed.ts             # Database seeder
└── web/                        # React frontend
    └── src/
        ├── App.tsx             # Root component
        ├── components/
        │   ├── layout/         # Sidebar, WelcomeScreen
        │   ├── lectures/       # LectureRow
        │   ├── revisions/      # RevisionBadges, RevisionDashboard
        │   ├── tests/          # TestDashboard, GlobalTests
        │   ├── topics/         # SubjectDetail (TopicSection)
        │   └── ui/             # Shared primitives
        ├── hooks/              # TanStack Query hooks
        ├── lib/                # API client, utilities
        ├── stores/             # Zustand store
        └── types/              # TypeScript interfaces
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start full dev environment |
| `npm run build` | Production build |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run test` | Run all tests |
| `npm run ci` | Full CI pipeline (lint → typecheck → test → build) |
| `npm run db:seed` | Seed subjects |

## Testing

```bash
# All tests
npm test

# Server only
npm test -w packages/server

# Web only
npm test -w packages/web
```

**Coverage:** Schema validation, UI store behaviour, utility functions, type contracts. 27 tests total.

## Architecture

See [Architecture.md](./Architecture.md) for a detailed system design document.
