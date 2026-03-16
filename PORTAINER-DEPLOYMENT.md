# 🏌️ Golf Tracker - Portainer Deployment Guide

## Quick Portainer Stack Deployment

### Option 1: Using GitHub Container Registry (Recommended)

**Prerequisites:**
- Portainer installed on your NAS
- Traefik v1.7 running with network named `traefik`
- Domain configured (e.g., `golf.yourdomain.com`)

**Steps:**

1. **Push your code to GitHub** (if not already done)
```bash
cd /Users/wottle/CascadeProjects/windsurf-project-2/golf-tracker
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/golf-tracker.git
git push -u origin main
```

2. **GitHub Actions will automatically build the Docker image**
   - The workflow triggers on push to main/master
   - Image will be available at: `ghcr.io/YOUR_USERNAME/golf-tracker:latest`

3. **In Portainer, create a new Stack:**
   - Go to **Stacks** → **Add Stack**
   - Name: `golf-tracker`
   - Build method: **Web editor**

4. **Paste this docker-compose:**

```yaml
version: '3.8'

services:
  golf-tracker:
    image: ghcr.io/YOUR_USERNAME/golf-tracker:latest
    container_name: golf-tracker
    ports:
      - "3001:3001"
    volumes:
      - golf-tracker-uploads:/app/uploads
      - golf-tracker-db:/app/data
    environment:
      - NODE_ENV=production
      - APP_PASSWORD=want2run
      - SESSION_SECRET=your-random-secret-here
      - PORT=3001
    restart: unless-stopped
    networks:
      - traefik
    labels:
      - "traefik.enable=true"
      - "traefik.backend=golf-tracker"
      - "traefik.frontend.rule=Host:golf.yourdomain.com"
      - "traefik.port=3001"
      - "traefik.docker.network=traefik"

volumes:
  golf-tracker-uploads:
  golf-tracker-db:

networks:
  traefik:
    external: true
```

5. **Configure Environment Variables** (or edit the YAML above):
   - `APP_PASSWORD` - Your secure password
   - `SESSION_SECRET` - Random secret string
   - Update `traefik.frontend.rule` with your domain

6. **Deploy the Stack**
   - Click **Deploy the stack**
   - Wait for the image to pull and container to start

7. **Access your app:**
   - Via Traefik: `https://golf.yourdomain.com`
   - Direct: `http://nas-ip:3001`

---

### Option 2: Using Docker Hub

If you prefer Docker Hub over GitHub Container Registry:

1. **Login to Docker Hub:**
```bash
docker login
```

2. **Build and push manually:**
```bash
cd /Users/wottle/CascadeProjects/windsurf-project-2/golf-tracker

# Build the image
docker build -t YOUR_DOCKERHUB_USERNAME/golf-tracker:latest .

# Push to Docker Hub
docker push YOUR_DOCKERHUB_USERNAME/golf-tracker:latest
```

3. **In Portainer, use this image:**
```yaml
image: YOUR_DOCKERHUB_USERNAME/golf-tracker:latest
```

---

### Option 3: Build from Git Repository in Portainer

1. **In Portainer, create a new Stack:**
   - Go to **Stacks** → **Add Stack**
   - Name: `golf-tracker`
   - Build method: **Repository**

2. **Configure:**
   - Repository URL: `https://github.com/YOUR_USERNAME/golf-tracker`
   - Repository reference: `refs/heads/main`
   - Compose path: `docker-compose.portainer.yml`

3. **Add Environment Variables:**
   - `APP_PASSWORD=want2run`
   - `SESSION_SECRET=your-random-secret`
   - `TRAEFIK_HOST=golf.yourdomain.com`

4. **Deploy**

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_PASSWORD` | `golf2024` | Password for authentication |
| `SESSION_SECRET` | auto-generated | Secret for session encryption |
| `TRAEFIK_HOST` | `golf.local` | Domain for Traefik routing |
| `PORT` | `3001` | Internal port |
| `NODE_ENV` | `production` | Node environment |

---

## Data Persistence

The stack uses named Docker volumes:
- `golf-tracker-uploads` - Scorecard and round photos
- `golf-tracker-db` - SQLite database and data files

**To backup:**
```bash
# Backup uploads
docker run --rm -v golf-tracker-uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup.tar.gz -C /data .

# Backup database
docker run --rm -v golf-tracker-db:/data -v $(pwd):/backup alpine tar czf /backup/db-backup.tar.gz -C /data .
```

**To restore:**
```bash
# Restore uploads
docker run --rm -v golf-tracker-uploads:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/uploads-backup.tar.gz"

# Restore database
docker run --rm -v golf-tracker-db:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/db-backup.tar.gz"
```

---

## Updating the App

### If using GitHub Container Registry:

1. **Push code changes to GitHub:**
```bash
git add .
git commit -m "Update app"
git push
```

2. **GitHub Actions builds new image automatically**

3. **In Portainer:**
   - Go to **Stacks** → `golf-tracker`
   - Click **Update the stack**
   - Enable **Re-pull image and redeploy**
   - Click **Update**

### If using Docker Hub:

1. **Rebuild and push:**
```bash
docker build -t YOUR_USERNAME/golf-tracker:latest .
docker push YOUR_USERNAME/golf-tracker:latest
```

2. **In Portainer, update the stack** (same as above)

---

## Troubleshooting

### Container won't start
- Check logs in Portainer: **Containers** → `golf-tracker` → **Logs**
- Verify environment variables are set
- Ensure `traefik` network exists

### Can't access via domain
- Verify Traefik is running: `docker ps | grep traefik`
- Check Traefik labels are correct
- Verify DNS points to your NAS
- Check Traefik logs

### Database/uploads not persisting
- Verify volumes are created: `docker volume ls`
- Check volume mounts in container: `docker inspect golf-tracker`

### Authentication issues
- Verify `APP_PASSWORD` is set correctly
- Clear browser cookies
- Check container logs for errors

---

## Security Best Practices

1. **Change default password** - Set strong `APP_PASSWORD`
2. **Generate session secret** - Use random string for `SESSION_SECRET`
3. **Use HTTPS** - Configure Traefik with SSL/TLS
4. **Regular backups** - Backup volumes regularly
5. **Keep updated** - Pull latest image periodically

---

## Portainer Stack Template

For quick deployment, save this as a Portainer custom template:

```yaml
version: '3.8'

services:
  golf-tracker:
    image: ghcr.io/YOUR_USERNAME/golf-tracker:latest
    container_name: golf-tracker
    ports:
      - "3001:3001"
    volumes:
      - golf-tracker-uploads:/app/uploads
      - golf-tracker-db:/app/data
    environment:
      - NODE_ENV=production
      - APP_PASSWORD=${APP_PASSWORD}
      - SESSION_SECRET=${SESSION_SECRET}
      - PORT=3001
    restart: unless-stopped
    networks:
      - traefik
    labels:
      - "traefik.enable=true"
      - "traefik.backend=golf-tracker"
      - "traefik.frontend.rule=Host:${TRAEFIK_HOST}"
      - "traefik.port=3001"
      - "traefik.docker.network=traefik"

volumes:
  golf-tracker-uploads:
  golf-tracker-db:

networks:
  traefik:
    external: true
```

**Template Variables:**
- `APP_PASSWORD` - Your password
- `SESSION_SECRET` - Random secret
- `TRAEFIK_HOST` - Your domain
