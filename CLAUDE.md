# Golf Tracker - AI Assistant Documentation

This document provides comprehensive information about the Golf Tracker application for AI assistants and future maintainers.

## Project Overview

**Golf Tracker** is a full-stack web application for tracking golf rounds between Dad and Ethan. It includes score tracking, photo uploads, statistics, and highlights.

### Tech Stack

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js 20 + Express
- **Database**: SQLite3
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Deployment**: Docker + Traefik v1.7 reverse proxy
- **CI/CD**: GitHub Actions → GitHub Container Registry (ghcr.io)
- **Production**: Synology NAS via Portainer

## Architecture

### Frontend Structure (`client/src/`)

```
components/
├── Dashboard.jsx       # Main dashboard with stats, best scores, recent rounds
├── AddRound.jsx        # Form to add new golf rounds
├── EditRound.jsx       # Form to edit existing rounds
├── RoundDetail.jsx     # Detailed view of a single round
├── AllRounds.jsx       # List view of all rounds
├── Highlights.jsx      # Random highlight/achievement display
├── Header.jsx          # Navigation header with login/logout
└── Login.jsx           # Authentication page

App.jsx                 # Main router and auth state management
```

### Backend Structure (`server/`)

```
index.js                # Express server with all API endpoints
```

### Key Routes

**Frontend Routes:**
- `/` - Dashboard
- `/login` - Login page
- `/add` - Add new round (auth required)
- `/edit/:id` - Edit round (auth required)
- `/round/:id` - Round detail view
- `/rounds` - All rounds list

**API Endpoints:**
- `POST /api/login` - Authenticate user
- `GET /api/check-auth` - Check authentication status
- `POST /api/logout` - Logout user
- `GET /api/stats` - Get statistics and highlights
- `GET /api/courses` - Get list of course names
- `POST /api/rounds` - Create new round
- `GET /api/rounds/:id` - Get round details
- `PUT /api/rounds/:id` - Update round (auth required)
- `DELETE /api/rounds/:id` - Delete round (auth required)
- `POST /api/rounds/:id/scorecard` - Upload scorecard image
- `POST /api/rounds/:id/photos` - Upload photos
- `DELETE /api/photos/:id` - Delete photo (auth required)

## Database Schema

### `rounds` Table
```sql
CREATE TABLE rounds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  course_name TEXT,
  dad_score INTEGER NOT NULL,
  ethan_score INTEGER NOT NULL,
  dad_front_nine INTEGER,
  ethan_front_nine INTEGER,
  dad_back_nine INTEGER,
  ethan_back_nine INTEGER,
  notes TEXT,
  scorecard_image TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### `photos` Table
```sql
CREATE TABLE photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  round_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE
)
```

## Important Implementation Details

### Date Handling (CRITICAL!)

**Problem**: JavaScript's `new Date()` parses date strings as UTC, causing timezone shifts.

**Solution**: Use `parseLocalDate()` utility function in all components:

```javascript
const parseLocalDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};
```

**Where Used**:
- `Dashboard.jsx` - All date displays (5 locations)
- `RoundDetail.jsx` - Round date display
- `AllRounds.jsx` - Round list dates
- `Highlights.jsx` - Highlight dates (7 locations)

### Average Calculation

**9-Hole Round Normalization**: The average score calculation normalizes 9-hole rounds to 18-hole equivalents by doubling the scores.

**Logic** (`server/index.js` lines 404-411):
```javascript
if (isNineHoleRound) {
  stats.dadNormalizedStrokes += round.dad_score * 2;
  stats.ethanNormalizedStrokes += round.ethan_score * 2;
} else {
  stats.dadNormalizedStrokes += round.dad_score;
  stats.ethanNormalizedStrokes += round.ethan_score;
}
```

**Calculation** (lines 493-495):
```javascript
stats.dadAverage = (stats.dadNormalizedStrokes / rounds.length).toFixed(1);
stats.ethanAverage = (stats.ethanNormalizedStrokes / rounds.length).toFixed(1);
```

### Best Scores Tracking

Best scores are tracked separately for 9-hole and 18-hole rounds:
- `bestDadScore9` / `bestDadScore18`
- `bestEthanScore9` / `bestEthanScore18`

### Authentication

- **Method**: Session-based with `express-session`
- **Password**: Stored in `APP_PASSWORD` environment variable (default: `golf2024`)
- **Session Secret**: Stored in `SESSION_SECRET` environment variable
- **Storage**: In-memory (resets on server restart)

## Data Persistence

### Docker Volumes

**CRITICAL**: Database and uploads must be persisted via Docker volumes.

**Volume Mounts**:
```yaml
volumes:
  - golf-tracker-uploads:/app/uploads
  - golf-tracker-db:/app/data
```

**Database Location**: `/app/data/golf-tracker.db`

**Directory Creation** (`server/index.js` lines 55-59):
```javascript
const dataDir = './data';
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
```

## Deployment

### Environment Variables

Required:
- `APP_PASSWORD` - Login password (default: `golf2024`)
- `SESSION_SECRET` - Session encryption key (default: `change-this-secret-in-production`)
- `TRAEFIK_HOST` - Domain for Traefik routing (default: `golf.local`)

Optional:
- `NODE_ENV` - Set to `production` for production
- `PORT` - Server port (default: `3001`)

### Docker Compose (Portainer)

**File**: `docker-compose.portainer.yml`

**Key Points**:
- Uses pre-built image from `ghcr.io/wottle/golf-tracker:latest`
- Named volumes for persistence
- Traefik v1.7 labels for reverse proxy
- External `traefik` network

### GitHub Actions CI/CD

**Workflow**: `.github/workflows/docker-build.yml`

**Triggers**:
- Push to `main` branch
- Manual workflow dispatch

**Process**:
1. Checkout code
2. Set up Docker Buildx
3. Login to GitHub Container Registry
4. Build and push Docker image
5. Tag as `latest` and commit SHA

### Deployment Process

1. **Push to GitHub**: `git push origin main`
2. **Wait for Build**: Check https://github.com/wottle/golf-tracker/actions
3. **Update Portainer Stack**:
   - Navigate to Portainer → Stacks → `golf-tracker`
   - Click "Update the stack"
   - Enable "Re-pull image and redeploy"
   - Click "Update"

## Development

### Local Setup

```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Create .env file
cp .env.example .env
# Edit .env with your settings

# Run development server
npm run dev
```

### Local Docker Build

```bash
# Build image
docker-compose build

# Run with docker-compose
docker-compose up -d
```

### File Upload Directories

Created automatically on startup:
- `uploads/scorecards/` - Scorecard images
- `uploads/photos/` - Round photos
- `data/` - SQLite database

## Production Details

### NAS Configuration

- **IP**: `192.168.0.16`
- **SSH Port**: `922`
- **User**: `wottle`
- **Project Path**: `/var/services/homes/wottle/docker/golf-tracker`
- **Docker Network**: `traefik` (external)

### Traefik Configuration

**Version**: Traefik v1.7 (legacy)

**Labels**:
```yaml
- "traefik.enable=true"
- "traefik.backend=golf-tracker"
- "traefik.frontend.rule=Host:${TRAEFIK_HOST}"
- "traefik.port=3001"
- "traefik.docker.network=traefik"
```

## Common Issues & Solutions

### Issue: Data Lost After Redeployment

**Cause**: Volume paths didn't match database location.

**Solution**: Database is now stored in `/app/data/golf-tracker.db` which matches the volume mount `/app/data`.

### Issue: Dates Off by One Day

**Cause**: Timezone conversion when parsing date strings with `new Date()`.

**Solution**: Use `parseLocalDate()` utility function (see Date Handling section).

### Issue: Build Fails with "CustomEvent is not defined"

**Cause**: Vite 8.0.0 requires Node.js 20+.

**Solution**: Dockerfile uses `FROM node:20-alpine`.

### Issue: Docker Compose Version Not Supported

**Cause**: Older Docker Compose on NAS.

**Solution**: Use `version: '3.3'` instead of `3.8`.

## Feature Highlights

### Statistics Calculated

- Total rounds played
- Total holes played
- Win/loss/tie counts
- Average scores (normalized for 9-hole rounds)
- Best 9-hole scores (separate for each player)
- Best 18-hole scores (separate for each player)
- Current win streak
- Longest win streak
- Biggest win margin
- Closest match
- First Ethan win (milestone)

### Highlights System

Random highlights displayed on dashboard:
- Current streak
- Longest streak
- Biggest wins
- Closest matches
- "On this day" anniversaries
- Personal bests
- First round milestone
- Round count milestones (10, 25, 50, 100)

### Photo Management

- Upload multiple photos per round
- Delete individual photos
- View full-size photos
- Scorecard image separate from photos

## Code Style & Conventions

### React Components

- Functional components with hooks
- `useState` for local state
- `useEffect` for data fetching
- `useNavigate` for routing
- `useParams` for route parameters

### Styling

- TailwindCSS utility classes
- Custom colors in `tailwind.config.js`:
  - `golf-green`: #2d5016
  - `golf-light`: #4a7c2c
  - `golf-sand`: #f5e6d3
  - `golf-sky`: #e3f2fd

### API Responses

- Success: `res.json({ ...data })`
- Error: `res.status(500).json({ error: message })`
- Created: Return object with `id` field

## Testing Checklist

When making changes, verify:

- [ ] Dates display correctly (no timezone shifts)
- [ ] 9-hole rounds calculate averages correctly
- [ ] Best scores show separately for 9 and 18 holes
- [ ] Authentication works (login/logout)
- [ ] Photos upload and display
- [ ] Scorecard uploads
- [ ] Edit functionality preserves existing data
- [ ] Delete removes files and database entries
- [ ] Statistics calculate correctly
- [ ] Highlights display random achievements
- [ ] Mobile responsive layout works

## Backup & Recovery

### Database Backup

```bash
# SSH into NAS
ssh -p 922 wottle@192.168.0.16

# Copy database
docker cp golf-tracker:/app/data/golf-tracker.db ~/backups/golf-tracker-$(date +%Y%m%d).db
```

### Full Data Backup

```bash
# Backup uploads and database
docker exec golf-tracker tar czf /tmp/backup.tar.gz /app/data /app/uploads
docker cp golf-tracker:/tmp/backup.tar.gz ~/backups/golf-tracker-full-$(date +%Y%m%d).tar.gz
```

## Future Enhancement Ideas

- [ ] Export statistics to PDF/CSV
- [ ] Handicap tracking
- [ ] Course difficulty ratings
- [ ] Weather data integration
- [ ] Hole-by-hole scoring
- [ ] Multi-user support
- [ ] Mobile app (React Native)
- [ ] Push notifications for milestones
- [ ] Social sharing features
- [ ] Advanced analytics and charts

## Repository Information

- **GitHub**: https://github.com/wottle/golf-tracker
- **Docker Image**: ghcr.io/wottle/golf-tracker:latest
- **License**: Not specified
- **Primary Users**: Dad and Ethan

## Contact & Maintenance

For issues or questions:
1. Check this documentation first
2. Review GitHub Issues
3. Check GitHub Actions for build status
4. Review Portainer logs for runtime issues

---

**Last Updated**: March 2026  
**Maintained By**: wottle  
**AI Assistant**: Claude (Anthropic)
