# 🏌️ Golf Tracker - NAS Deployment Guide

## Quick Deployment Checklist

### 1. Prerequisites
- [ ] Docker and Docker Compose installed on NAS
- [ ] Traefik v1.7 running with network named `traefik`
- [ ] Domain/subdomain configured (e.g., `golf.yourdomain.com`)

### 2. Copy Files to NAS
```bash
scp -r golf-tracker user@nas-ip:/path/to/apps/
```

### 3. Configure Environment
```bash
cd /path/to/apps/golf-tracker
cp .env.example .env
nano .env
```

**Required settings in `.env`:**
```bash
APP_PASSWORD=your-secure-password
SESSION_SECRET=random-secret-string-here
TRAEFIK_HOST=golf.yourdomain.com
```

### 4. Deploy
```bash
# Option 1: Use deployment script
./deploy.sh

# Option 2: Manual deployment
docker-compose build
docker-compose up -d
```

### 5. Verify
- Via Traefik: `https://golf.yourdomain.com`
- Direct access: `http://nas-ip:3001`
- Login with your `APP_PASSWORD`

## Traefik v1.7 Labels Explained

```yaml
labels:
  - "traefik.enable=true"                              # Enable Traefik
  - "traefik.backend=golf-tracker"                     # Backend name
  - "traefik.frontend.rule=Host:golf.yourdomain.com"   # Your domain
  - "traefik.port=3001"                                # Internal port
  - "traefik.docker.network=traefik"                   # Network name
```

## Common Issues & Solutions

### Issue: "traefik network not found"
**Solution:** Create the network or update `docker-compose.yml`:
```bash
# Create network
docker network create traefik

# OR update docker-compose.yml to use your network name
networks:
  your-network-name:
    external: true
```

### Issue: Can't access via domain
**Check:**
1. Traefik is running: `docker ps | grep traefik`
2. DNS points to your NAS IP
3. Container is in traefik network: `docker inspect golf-tracker`
4. Traefik logs: `docker logs traefik`

### Issue: Authentication not working
**Check:**
1. `APP_PASSWORD` is set in `.env`
2. Container restarted after changing `.env`: `docker-compose restart`
3. Browser cookies cleared

## Data Persistence

All data is stored in these volumes:
- `./uploads/` - Scorecard and round photos
- `./golf-tracker.db` - SQLite database with all rounds
- `./data/` - Additional data files

**Backup command:**
```bash
tar -czf golf-tracker-backup-$(date +%Y%m%d).tar.gz uploads/ golf-tracker.db data/
```

## Updating the App

```bash
# Stop container
docker-compose down

# Update files (git pull or copy new files)
git pull

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d
```

## Useful Commands

```bash
# View logs
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100

# Restart
docker-compose restart

# Stop
docker-compose down

# Rebuild
docker-compose build --no-cache

# Check status
docker-compose ps

# Access container shell
docker exec -it golf-tracker sh
```

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_PASSWORD` | `golf2024` | Password for authentication |
| `SESSION_SECRET` | auto-generated | Secret for session encryption |
| `TRAEFIK_HOST` | `golf.local` | Domain for Traefik routing |
| `PORT` | `3001` | Internal port (usually don't change) |
| `NODE_ENV` | `production` | Node environment |

## Security Recommendations

1. **Change default password** - Set strong `APP_PASSWORD` in `.env`
2. **Generate session secret** - Use random string for `SESSION_SECRET`
3. **Use HTTPS** - Configure Traefik with SSL/TLS certificates
4. **Regular backups** - Backup database and uploads folder
5. **Update regularly** - Keep Docker image updated

## Port Configuration

**Default setup:**
- Internal: `3001` (container)
- External: Via Traefik (port 80/443)
- Direct access: `3001` (if ports exposed)

**To change internal port:**
1. Update `PORT` in `.env`
2. Update `traefik.port` label in `docker-compose.yml`
3. Rebuild container

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Verify configuration in `.env`
3. Check Traefik is routing correctly
4. Ensure database file has correct permissions
