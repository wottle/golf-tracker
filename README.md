# ⛳ Dad & Ethan Golf Tracker

A playful, modern web application for tracking golf rounds between father and son. Features quick score capture, photo uploads, and fun statistics!

## 🎯 Features

- **Quick Score Entry**: Capture final scores and optional 9-hole breakdowns
- **Photo Management**: Upload scorecard images and round photos
- **Statistics Dashboard**: 
  - Win/loss records
  - Running stroke totals
  - Best scores
  - "On this day..." memorable moments
- **Modern UI**: Playful, colorful interface with smooth animations
- **Lightweight**: Built with React + Express + SQLite
- **Docker Ready**: Easy deployment on your NAS

## 🚀 Quick Start with Docker

### Deploy with Portainer (Recommended)

The easiest way to deploy on your NAS is using Portainer with a pre-built Docker image.

**See [PORTAINER-DEPLOYMENT.md](PORTAINER-DEPLOYMENT.md) for complete instructions.**

**Quick Start:**
1. Push code to GitHub (triggers automatic Docker image build)
2. In Portainer, create a new Stack
3. Use the `docker-compose.portainer.yml` file
4. Set environment variables (APP_PASSWORD, SESSION_SECRET, TRAEFIK_HOST)
5. Deploy!

**Image:** `ghcr.io/YOUR_USERNAME/golf-tracker:latest`

---

### Deploy on Your NAS with Traefik v1.7 (Manual)

**Prerequisites:**
- Docker and Docker Compose installed on your NAS
- Traefik v1.7 running with a network named `traefik`
- Domain or subdomain configured (e.g., `golf.yourdomain.com`)

**Deployment Steps:**

1. **Copy the project to your NAS**
```bash
scp -r golf-tracker user@nas-ip:/path/to/apps/
```

2. **Navigate to the project directory**
```bash
cd /path/to/apps/golf-tracker
```

3. **Create environment file**
```bash
cp .env.example .env
nano .env
```

Edit the `.env` file:
```bash
APP_PASSWORD=your-secure-password
SESSION_SECRET=generate-a-random-secret-here
TRAEFIK_HOST=golf.yourdomain.com
```

4. **Build and start the container**
```bash
docker-compose up -d
```

5. **Access your app**
- Via Traefik: `https://golf.yourdomain.com` (or your configured domain)
- Direct access: `http://nas-ip:3001`

**Default Password:** `golf2024` (change this in `.env`!)

### Without Traefik (Direct Port Access)

If you're not using Traefik, the app is accessible directly on port 3001:

```bash
docker-compose up -d
```

Access at: `http://your-nas-ip:3001`

### Management Commands

**View logs:**
```bash
docker-compose logs -f
```

**Restart the app:**
```bash
docker-compose restart
```

**Stop the app:**
```bash
docker-compose down
```

**Update the app:**
```bash
git pull  # or copy new files
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Traefik v1.7 Configuration

The `docker-compose.yml` includes these Traefik v1.7 labels:
- `traefik.enable=true` - Enable Traefik routing
- `traefik.backend=golf-tracker` - Backend name
- `traefik.frontend.rule=Host:${TRAEFIK_HOST}` - Domain routing
- `traefik.port=3001` - Internal port
- `traefik.docker.network=traefik` - Network name

**Note:** Make sure your Traefik network is named `traefik`. If it's different, update the `docker-compose.yml` file.

## 💻 Local Development

### Prerequisites

- Node.js 18+ 
- npm

### Setup

1. Install dependencies:

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

2. Start development servers:

```bash
npm run dev
```

This runs both the backend (port 3001) and frontend (port 5173) concurrently.

3. Open your browser to `http://localhost:5173`

## 📁 Project Structure

```
golf-tracker/
├── server/
│   └── index.js          # Express API server
├── client/
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AddRound.jsx
│   │   │   ├── RoundDetail.jsx
│   │   │   └── Header.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
├── uploads/              # Photo storage (created automatically)
│   ├── scorecards/
│   └── photos/
├── golf-tracker.db       # SQLite database (created automatically)
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## 🎨 Tech Stack

**Frontend:**
- React 19
- React Router
- TailwindCSS
- Lucide Icons
- date-fns

**Backend:**
- Node.js
- Express
- SQLite3
- Multer (file uploads)

## 📊 Database Schema

**Rounds Table:**
- Date, course name
- Dad & Ethan scores (total + 9-hole breakdowns)
- Scorecard image path
- Notes

**Photos Table:**
- Round association
- Filename
- Optional caption

## 🔧 Configuration

### Environment Variables

**Server (Backend):**
- `APP_PASSWORD` - Password for authentication (default: `golf2024`)
- `SESSION_SECRET` - Secret key for session encryption (default: auto-generated)
- `PORT` - Server port (default: `3001`)

**Client (Frontend):**
Create a `.env` file in the client directory for custom API URL:

```
VITE_API_URL=http://your-nas-ip:3001
```

### Port Configuration

Default port is 3001. To change, update:
- `docker-compose.yml` (ports mapping)
- `server/index.js` (PORT variable)

## 🔐 Authentication

The app uses simple password authentication to protect adding/editing rounds and photos.

**Features:**
- View rounds and statistics without logging in
- Login required to add/edit/delete rounds
- Login required to upload photos
- Session persists for 7 days
- Password configurable via environment variable

**Default Credentials:**
- Password: `golf2024`

**To Change Password:**

For Docker:
```bash
# Edit docker-compose.yml and add:
environment:
  - APP_PASSWORD=your-secure-password
```

For local development:
```bash
export APP_PASSWORD=your-secure-password
npm run dev
```

## 📸 Usage

### Adding a Round

1. Click "Add Round" button
2. Enter date and course name
3. Input final scores (required)
4. Optionally add 9-hole scores
5. Upload scorecard photo
6. Upload round photos
7. Add notes
8. Save!

### Viewing Statistics

The dashboard shows:
- Total rounds played
- Win/loss records for both players
- Average scores
- Best individual rounds
- Recent rounds list
- Special milestones (like first win)

### Managing Rounds

- Click any round to view details
- View all photos and scorecard
- Delete photos individually
- Delete entire round

## 🐳 Docker Deployment Notes

**Data Persistence:**
- Database and uploads are mounted as volumes
- Data persists even if container is recreated
- Backup `golf-tracker.db` and `uploads/` folder regularly

**Updating the App:**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🎉 Fun Features

- **Color-coded winners**: Green for Dad, Purple for Ethan
- **Milestone tracking**: "X years ago, Ethan beat his father for the first time"
- **Visual stats**: Colorful cards with icons
- **Smooth animations**: Hover effects and transitions
- **Responsive design**: Works on desktop and mobile

## 📝 License

Personal use project - enjoy tracking your golf rounds!

---

Built with ❤️ for quality father-son time on the golf course! 🏌️‍♂️⛳
