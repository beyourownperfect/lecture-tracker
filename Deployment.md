# Deployment

## Frontend (Vercel)

1. Push repository to GitHub
2. Import project in Vercel
3. Configure:
   - **Framework:** Vite
   - **Build Command:** `npm run build -w packages/web`
   - **Output Directory:** `packages/web/dist`
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`

## Backend (Render)

1. Create a new Web Service
2. Connect to GitHub repository
3. Configure:
   - **Root Directory:** `packages/server`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Add environment variables (see `.env.production`):
   ```
   PORT=3001
   HOST=0.0.0.0
   MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/lecture-tracker
   NODE_ENV=production
   CLIENT_URL=https://your-app.vercel.app
   LOG_LEVEL=warn
   ```

## Database (MongoDB Atlas)

1. Create an M7 cluster (Free tier)
2. Create a database user with read/write permissions
3. Whitelist Render's IP or use 0.0.0.0/0
4. Copy the connection string into Render's `MONGODB_URI` env var

## Post-Deployment

1. Run `npm run db:seed` (set `MONGODB_URI` and run locally, or SSH into Render)
2. Visit the Vercel URL
3. Verify health endpoint: `https://your-backend.onrender.com/health`

## Production Checklist

- [ ] CORS: `CLIENT_URL` set to Vercel domain
- [ ] Rate limiting: 100 req/min (already configured)
- [ ] Helmet: Security headers enabled
- [ ] MongoDB: Atlas IP whitelist configured
- [ ] Environment: `NODE_ENV=production`
- [ ] Logs: Pino JSON output in production
