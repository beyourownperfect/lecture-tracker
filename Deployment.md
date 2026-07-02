# Deployment

The entire app (API + frontend) runs as a single Render Web Service backed by MongoDB Atlas.

## One Service

| Component | Platform |
|-----------|----------|
| API + Frontend | Render (single Web Service) |
| Database | MongoDB Atlas |

The server serves the built frontend files via `@fastify/static` with SPA fallback.

## Deploy to Render

### 1. Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/lecture-tracker.git
git branch -M main
git push -u origin main
```

### 2. Create Render Web Service

- Go to [render.com](https://render.com) → New → Web Service
- Connect your GitHub repository
- Configure:

| Setting | Value |
|---------|-------|
| **Name** | lecture-tracker |
| **Root Directory** | (leave empty — project root) |
| **Build Command** | `npm run build:render` |
| **Start Command** | `npm start` |
| **Plan** | Free |

### 3. Environment Variables

Add these in the Render dashboard under Environment:

| Key | Value |
|-----|-------|
| `PORT` | `3001` |
| `HOST` | `0.0.0.0` |
| `MONGODB_URI` | `mongodb+srv://...` (your Atlas connection string) |
| `NODE_ENV` | `production` |
| `LOG_LEVEL` | `warn` |

### 4. Deploy

Click "Create Web Service" — Render will clone, install, build both packages, and start the server.

### 5. Seed Subjects

After deploy, seed subjects from your local machine:

```bash
set MONGODB_URI=mongodb+srv://...
npx tsx packages/server/src/seed.ts
```

### 6. Visit

Open your Render URL (`https://lecture-tracker.onrender.com`) — 12 subjects should appear.

Verify health: `https://lecture-tracker.onrender.com/health` → `{"status":"ok"}`
