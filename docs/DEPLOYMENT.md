# Deployment Guide - Advanced Snake Game

This guide provides step-by-step instructions for deploying the Advanced Snake Game to production.

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Preparation](#preparation)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Post-Deployment Testing](#post-deployment-testing)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## System Architecture

### Deployment Flow

```
┌──────────────────────┐
│   Development PC     │
│  (Local Environment) │
│                      │
│  Frontend + Backend  │
│  Testing, Testing    │
└──────────┬───────────┘
           │ git push
           ▼
┌──────────────────────────────────────────┐
│       GitHub Repository                  │
│  (Code Storage & Version Control)        │
└──────┬─────────────────────┬─────────────┘
       │                     │
       │ Pull Repository     │ Pull Repository
       ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│  Render/Railway  │  │     Vercel       │
│  (Backend)       │  │  (Frontend)      │
│                  │  │                  │
│ FastAPI Server   │  │ Static HTML/JS   │
│ Persistent Data  │  │ CDN Distribution │
└────────┬─────────┘  └──────┬───────────┘
         │                   │
         └───────┬───────────┘
                 │ HTTP/HTTPS
                 ▼
         ┌──────────────┐
         │   Players    │
         │   (Browser)  │
         └──────────────┘
```

---

## Preparation

### Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click "New repository"
3. Set up:
   - **Repository name**: `snake-game`
   - **Description**: Advanced Snake Game with Leaderboard
   - **Visibility**: Public
   - **Initialize with README**: No

### Step 2: Prepare Backend for Deployment

#### Create Procfile

In the `backend/` directory, create `Procfile`:

```
web: gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

#### Update requirements.txt

```bash
cd backend
pip install gunicorn
pip freeze > requirements.txt
```

The `requirements.txt` should include:
```
fastapi==0.104.1
gunicorn==21.2.0
pydantic==2.5.0
python-multipart==0.0.6
uvicorn==0.24.0
```

#### Create .gitignore

```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# IDE
.vscode/
.idea/
*.swp
*.swo

# Environment
.env
.env.local

# OS
.DS_Store
Thumbs.db

# Leaderboard (don't commit, managed by backend)
leaderboard.json.bak

# Logs
*.log
```

### Step 3: Prepare Frontend for Deployment

#### Create Vercel Configuration

In `frontend/` directory, create `vercel.json`:

```json
{
  "buildCommand": "echo 'No build step needed'",
  "outputDirectory": ".",
  "env": {
    "REACT_APP_API_URL": "@api-url"
  }
}
```

#### Create .gitignore

```
# Dependencies
node_modules/
npm-debug.log
yarn-error.log

# Environment
.env
.env.local
.env.*.local

# Build outputs
.next/
out/
dist/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

### Step 4: Initialize Git Repository

```bash
# From project root
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: Advanced Snake Game with Leaderboard"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/snake-game.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Verify**: Go to your GitHub repo and see all files uploaded.

---

## Backend Deployment

### Option A: Deploy to Render

#### 1. Create Render Account

- Go to [render.com](https://render.com)
- Sign up with GitHub
- Authorize Render to access your repositories

#### 2. Create Web Service

1. Click "New +" button
2. Select "Web Service"
3. Select your `snake-game` repository
4. Connect GitHub account if needed

#### 3. Configure Service

Fill in the configuration:

| Field | Value |
|-------|-------|
| Name | `snake-game-api` |
| Environment | `Python 3` |
| Region | Choose closest to you |
| Branch | `main` |
| Build Command | `cd backend && pip install -r requirements.txt` |
| Start Command | `gunicorn -w 4 -k uvicorn.workers.UvicornWorker backend.main:app` |
| Instance Type | `Free` or `Starter` (paid) |

#### 4. Add Persistent Storage

1. In the service dashboard, go to "Disks"
2. Click "Create Disk"
3. Configure:
   - **Name**: `leaderboard-storage`
   - **Mount Path**: `/var/data`
   - **Size**: `1 GB`

#### 5. Update Backend Code for Persistent Path

Edit `backend/main.py`:

```python
# At the top of the file
import os

# Update initialization
leaderboard_path = os.getenv("LEADERBOARD_PATH", "/var/data/leaderboard.json")
leaderboard_manager = LeaderboardManager(leaderboard_path)
```

Or modify `main.py` before deployment:

```python
# Line where LeaderboardManager is initialized
leaderboard_manager = LeaderboardManager("/var/data/leaderboard.json")
```

#### 6. Deploy

1. Click "Deploy" button
2. Wait for build to complete
3. Access your backend at the provided URL (e.g., `https://snake-game-api.onrender.com`)

#### 7. Test Backend

```bash
# Replace with your actual URL
curl https://snake-game-api.onrender.com/health

# Should return:
# {"status":"healthy","timestamp":"2026-02-03T..."}
```

**Keep the backend URL for frontend configuration.**

---

### Option B: Deploy to Railway

#### 1. Create Railway Account

- Go to [railway.app](https://railway.app)
- Sign up with GitHub
- Authorize Railway

#### 2. Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your `snake-game` repository

#### 3. Configure Environment

Railway auto-detects Python. Configure in `railway.toml` in backend directory:

```toml
[build]
builder = "dockerfile"
dockerfile = "./Dockerfile"

[deploy]
startCommand = "python -m uvicorn main:app --host 0.0.0.0 --port $PORT"
```

Or edit in Railway dashboard:
- Service Settings → Build
- Build Command: `pip install -r requirements.txt`
- Start Command: `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`

#### 4. Add Persistent Volume

1. Project → Backend Service → Volumes
2. Create volume:
   - **Name**: `leaderboard`
   - **Mount Path**: `/var/data`

#### 5. Set Environment Variables

In Service → Variables:

```
PORT=8000
PYTHONUNBUFFERED=1
```

#### 6. Update Backend Code

Edit `backend/main.py`:

```python
leaderboard_manager = LeaderboardManager("/var/data/leaderboard.json")
```

#### 7. Deploy

Railway auto-deploys on git push. Wait for build to complete.

**Backend URL**: Found in Railway dashboard (e.g., `https://yourgame-api.up.railway.app`)

---

## Frontend Deployment

### Deploy to Vercel

#### 1. Create Vercel Account

- Go to [vercel.com](https://vercel.com)
- Sign up with GitHub
- Authorize Vercel

#### 2. Import Project

1. Click "Import Project"
2. Select "Import Git Repository"
3. Paste your GitHub repo URL: `https://github.com/YOUR_USERNAME/snake-game.git`
4. Click "Continue"

#### 3. Configure Project

Fill in:

| Field | Value |
|-------|-------|
| Project Name | `snake-game` |
| Framework | `Other` |
| Root Directory | `frontend` |
| Build Command | (leave empty) |
| Output Directory | `.` |
| Install Command | `npm install` (or leave empty) |

#### 4. Set Environment Variables

1. Continue to environment variables step
2. Add variable:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: `https://your-backend-url.onrender.com` (from backend deployment)
   - Apply to: All Environments

#### 5. Deploy

Click "Deploy" button.

Wait for build to complete. You'll see:
```
Deployment successful!
https://yourgame.vercel.app
```

#### 6. Configure Custom Domain (Optional)

In Vercel project settings → Domains:
1. Add your custom domain
2. Follow DNS configuration steps

---

## Updating CORS for Production

After both are deployed, update backend CORS configuration:

Edit `backend/main.py`:

```python
# Before production, change from:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# To production configuration:
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://yourgame.vercel.app",
        "https://www.yourgame.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)
```

Commit and push:
```bash
git add backend/main.py
git commit -m "Production: Restrict CORS to Vercel frontend"
git push origin main
```

Backend will auto-redeploy (if using Railway/Render with auto-deploy enabled).

---

## Post-Deployment Testing

### 1. Test Backend Health

```bash
BACKEND_URL="https://your-backend-url.onrender.com"

# Health check
curl $BACKEND_URL/health

# Start game
curl -X POST $BACKEND_URL/game/start \
  -H "Content-Type: application/json" \
  -d '{"player_name":"TestUser"}'

# Submit score
curl -X POST $BACKEND_URL/scores/submit \
  -H "Content-Type: application/json" \
  -d '{
    "player_name":"TestUser",
    "score":250,
    "difficulty_level":2
  }'

# Get leaderboard
curl $BACKEND_URL/leaderboard/top?limit=5
```

### 2. Test Frontend

1. Open `https://yourgame.vercel.app`
2. Enter name and start game
3. Play for a few seconds
4. End game (hit wall)
5. Verify score appears on leaderboard
6. Click "View Leaderboard" to see global scores

### 3. Test Full Flow

#### Step-by-step test:
1. Open frontend in browser
2. Enter player name: "DeploymentTest"
3. Play game
4. Achieve score (aim for >100 for visible difficulty changes)
5. Game ends → Score submitted
6. Game over screen shows rank/medal
7. Play again with different player
8. View leaderboard → Verify both players appear
9. Check leaderboard is sorted by score

### 4. Monitoring

#### Render Dashboard
- **Logs**: Service → Logs (check for errors)
- **Metrics**: Service → Metrics (CPU, memory, network)
- **Events**: Service → Events (deployment history)

#### Railway Dashboard
- **Logs**: Service → View Logs
- **Metrics**: Service → Metrics
- **Deployments**: Project → Deployments (history)

#### Vercel Dashboard
- **Analytics**: Project → Analytics
- **Logs**: Project → Logs
- **Deployments**: Project → Deployments

---

## Monitoring & Maintenance

### Regular Checks

#### Weekly
- [ ] Check backend logs for errors
- [ ] Verify leaderboard file size is reasonable
- [ ] Test game flow end-to-end

#### Monthly
- [ ] Backup leaderboard.json
- [ ] Review error logs
- [ ] Check performance metrics
- [ ] Update dependencies if needed

### Backup Leaderboard

#### Render
```bash
# Download from Render disk
# Use Render dashboard → Service → Logs & Disks
```

#### Railway
```bash
# Use Railway dashboard to download volumes
```

### Scale Up from Free Tier

If traffic increases:

#### Render
1. Go to Service → Pricing
2. Upgrade instance type
3. Auto-deploy with new resources

#### Railway
1. Project Settings → Pricing
2. Increase CPU/Memory allocation
3. Deploy with new resources

#### Vercel
1. Project → Settings → General
2. Functions → Serverless Functions config
3. Edit build settings if needed

### Troubleshooting

#### Frontend shows "Backend unavailable"
1. Check backend health: `https://backend-url/health`
2. Verify CORS headers in backend logs
3. Check network tab in browser DevTools
4. Verify `REACT_APP_API_URL` environment variable

#### Leaderboard not persisting
1. Check if persistent volume exists
2. Verify write permissions
3. Check backend logs for file errors
4. Ensure leaderboard.json path is correct

#### Game too slow/fast
1. Check server CPU usage
2. Verify network latency (DevTools → Network)
3. Increase server resources if needed
4. Check for database locks (if applicable)

#### High memory usage
1. Check if requests are being cached properly
2. Verify leaderboard.json isn't growing too large
3. Monitor connection count
4. Consider implementing request pagination

---

## Security Considerations

### Before Going to Production

- [ ] Change CORS to specific domains only
- [ ] Add request rate limiting (if heavy usage expected)
- [ ] Enable HTTPS (automatic on Vercel/Render/Railway)
- [ ] Set up monitoring alerts
- [ ] Implement input validation (already done)
- [ ] Consider adding request authentication for admin endpoints

### Rate Limiting Example (Optional)

In `backend/main.py`:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/scores/submit")
@limiter.limit("10/minute")
async def submit_score(request: Request, payload: ScoreSubmissionRequest):
    # Endpoint implementation
    pass
```

### Data Privacy

- No personal data beyond player names is stored
- No user authentication required (simple MVP)
- For production with user accounts:
  - Add user registration/authentication
  - Hash passwords
  - Secure session management
  - GDPR compliance

---

## Performance Optimization

### Frontend Optimization
- Canvas rendering is already optimized
- Mobile-friendly with responsive canvas
- Minimal dependencies (no frameworks)
- Debounced input handling

### Backend Optimization
- Thread-safe JSON operations
- Atomic writes prevent data corruption
- Efficient sorting and pagination
- Minimal memory footprint

### Further Optimization (If Needed)
- Implement caching headers for frontend
- Add database (PostgreSQL) for leaderboard if player count exceeds 10K
- Implement CDN caching for static assets
- Monitor and optimize hot paths

---

## Summary Checklist

### Before Deployment
- [ ] All code committed to GitHub
- [ ] Procfile created for backend
- [ ] requirements.txt updated
- [ ] .gitignore files added
- [ ] Vercel config created
- [ ] Backend tested locally
- [ ] Frontend tested locally

### Backend Deployment
- [ ] Render/Railway account created
- [ ] Service configured
- [ ] Persistent storage added
- [ ] Environment variables set
- [ ] Backend URL obtained
- [ ] Health check tested

### Frontend Deployment
- [ ] Vercel account created
- [ ] Project imported
- [ ] API URL environment variable set
- [ ] Deployment successful
- [ ] Frontend URL obtained

### Post-Deployment
- [ ] Backend health check passes
- [ ] Frontend loads successfully
- [ ] CORS configured for production
- [ ] Full game flow tested
- [ ] Score submits and persists
- [ ] Leaderboard works correctly
- [ ] Mobile controls tested

---

**Last Updated**: February 3, 2026

For detailed information, see [README.md](README.md)
