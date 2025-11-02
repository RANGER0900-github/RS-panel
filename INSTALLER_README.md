# MS VPS Panel - Quick Installer Guide

## Quick Start

Simply run the installer script:

```bash
chmod +x installer.sh
./installer.sh
```

The installer will:
1. ✅ Detect your system (Ubuntu VPS or CodeSandbox)
2. ✅ Check system compatibility
3. ✅ Install all dependencies automatically
4. ✅ Set up Docker (if needed)
5. ✅ Generate configuration files
6. ✅ Build and start all services
7. ✅ Initialize the database

## Installation Options

### Option 1: Ubuntu VPS (Normal Server)

**Requirements:**
- Ubuntu 20.04 LTS or later
- Root or sudo access
- At least 4GB RAM (8GB+ recommended)
- At least 50GB free disk space

**What it does:**
- Installs Docker and Docker Compose
- Sets up system dependencies
- Configures firewall (optional)
- Builds and starts all containers
- Initializes database

**Usage:**
```bash
./installer.sh
# Select option 1 when prompted
```

### Option 2: CodeSandbox

**Requirements:**
- CodeSandbox account
- Git access (if cloning)

**What it does:**
- Uses existing Docker in CodeSandbox
- Generates environment configuration
- Builds and starts containers
- Initializes database

**Usage:**
```bash
./installer.sh
# Select option 2 when prompted
```

Or import directly to CodeSandbox - it will detect automatically!

## What Gets Installed

### Services:
- **Frontend**: React app on port 80
- **Backend**: FastAPI on port 8000
- **PostgreSQL**: Database on port 5432
- **Redis**: Cache/Queue on port 6379
- **MinIO**: Object storage on ports 9000/9001

### Default Credentials:
- **Admin**: `admin@example.com` / `admin123`
- **User**: `user@example.com` / `user123`

⚠️ **Change these passwords immediately in production!**

## Access Points

After installation:

### Ubuntu VPS:
- Frontend: `http://your-server-ip`
- Backend API: `http://your-server-ip:8000`
- API Docs: `http://your-server-ip:8000/api/docs`
- MinIO Console: `http://your-server-ip:9001`

### CodeSandbox:
- Frontend: Check CodeSandbox preview URL
- Backend API: Check exposed ports (usually port 8000)
- API Docs: `http://your-sandbox-url:8000/api/docs`

## Troubleshooting

### Docker Permission Denied

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Apply changes (choose one):
# Option 1: Log out and back in
# Option 2: Run:
newgrp docker

# Then continue:
docker compose up -d
```

### Services Not Starting

```bash
# Check status
docker compose ps

# View logs
docker compose logs -f

# Restart services
docker compose restart
```

### Database Initialization Failed

```bash
# Wait a bit and try again
sleep 30
docker compose exec backend python init_db.py
```

### Port Already in Use

```bash
# Find what's using the port
sudo lsof -i :80
sudo lsof -i :8000

# Stop conflicting services or change ports in docker-compose.yml
```

## Manual Steps (if needed)

If the installer fails, you can do it manually:

1. **Install Docker**:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

2. **Generate .env**:
   ```bash
   chmod +x generate-env.sh
   ./generate-env.sh
   ```

3. **Build and Start**:
   ```bash
   docker compose build
   docker compose up -d
   ```

4. **Initialize Database**:
   ```bash
   sleep 30
   docker compose exec backend python init_db.py
   ```

## Post-Installation

1. **Change Default Passwords** (CRITICAL!)
2. **Configure Firewall** (Ubuntu VPS)
3. **Set up SSL/HTTPS** (Production)
4. **Review Environment Variables** in `.env`
5. **Set up Backups**

## Need Help?

- Check logs: `docker compose logs -f`
- View status: `docker compose ps`
- See [README.md](README.md) for detailed documentation
- See [INSTALLATION.md](INSTALLATION.md) for step-by-step guide

---

**Enjoy your VPS Panel! 🚀**

