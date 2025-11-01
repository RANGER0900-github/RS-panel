# MS VPS Panel - Installation Guide

This document provides detailed installation instructions for two different methods.

## Table of Contents

1. [Method 1: Ubuntu VPS Installation](#method-1-ubuntu-vps-installation)
2. [Method 2: CodeSandbox Docker Template](#method-2-codesandbox-docker-template)
3. [Common Setup Steps](#common-setup-steps)
4. [Troubleshooting](#troubleshooting)

---

## Method 1: Ubuntu VPS Installation

### Quick Start (5 minutes)

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# 2. Clone/upload project
cd /opt
sudo git clone https://github.com/your-org/ms-vps-panel.git
cd ms-vps-panel

# 3. Generate .env file
chmod +x generate-env.sh
./generate-env.sh

# 4. Build and start
docker compose build
docker compose up -d

# 5. Initialize database
sleep 30
docker compose exec backend python init_db.py

# 6. Access panel
# Frontend: http://your-ip
# Login: admin@example.com / admin123
```

### Detailed Steps

See the main [README.md](README.md) for complete Ubuntu VPS installation instructions.

---

## Method 2: CodeSandbox Docker Template

### Quick Start

1. **Import to CodeSandbox**:
   - Go to [CodeSandbox.io](https://codesandbox.io)
   - Click "Import from GitHub" or "Create Sandbox"
   - Upload project files or clone repository

2. **Configure Environment**:
   ```bash
   # In CodeSandbox terminal
   chmod +x generate-env.sh
   ./generate-env.sh
   ```

3. **Start Services**:
   ```bash
   docker compose up -d
   ```

4. **Initialize Database**:
   ```bash
   sleep 30
   docker compose exec backend python init_db.py
   ```

5. **Access Panel**:
   - CodeSandbox provides preview URLs automatically
   - Frontend: Check preview URL (usually `https://your-sandbox-id.csb.app`)
   - Backend API: Check exposed ports tab

### CodeSandbox-Specific Notes

- **Port Exposing**: CodeSandbox automatically exposes ports defined in `docker-compose.yml`
- **Environment Variables**: Can be set in CodeSandbox Settings → Environment Variables
- **Persistence**: Data persists across sessions
- **Limitations**: 
  - libvirt/KVM won't work (container limitations)
  - Some system-level operations restricted
  - Best for development/testing

---

## Common Setup Steps

### Generate Environment File

**Option 1: Using Script (Recommended)**
```bash
chmod +x generate-env.sh
./generate-env.sh
```

**Option 2: Manual**
```bash
cp .env.example .env

# Generate secret key
SECRET_KEY=$(openssl rand -hex 32)
sed -i "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" .env
```

### Build and Start Services

```bash
# Build Docker images
docker compose build

# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### Initialize Database

```bash
# Wait for services to be ready
sleep 30

# Initialize with sample data
docker compose exec backend python init_db.py
```

**Default Credentials**:
- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `user123`

**⚠️ Change these passwords immediately in production!**

---

## Troubleshooting

### Build Errors

**Frontend: npm ci fails**
- ✅ **Fixed**: Changed to `npm install` in Dockerfile

**Backend: libvirt-python fails**
- ✅ **Fixed**: Made libvirt-python optional (commented out in requirements.txt)

### Runtime Errors

**Database connection refused**
```bash
# Check PostgreSQL is running
docker compose ps postgres
docker compose logs postgres

# Restart services
docker compose restart
```

**Frontend not loading**
```bash
# Check frontend logs
docker compose logs frontend

# Rebuild frontend
docker compose build frontend
docker compose up -d frontend
```

**Backend not responding**
```bash
# Check backend logs
docker compose logs backend

# Check if port 8000 is available
sudo lsof -i :8000

# Restart backend
docker compose restart backend
```

### Permission Issues

**Docker permission denied**
```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Or use sudo
sudo docker compose up -d
```

**Cannot create .env file**
```bash
# Make script executable
chmod +x generate-env.sh

# Run with appropriate permissions
./generate-env.sh
```

### Port Conflicts

**Port already in use**
```bash
# Find process using port
sudo lsof -i :80
sudo lsof -i :8000
sudo lsof -i :5432

# Kill process or change ports in docker-compose.yml
```

### Data Persistence

**Reset everything**
```bash
# Stop and remove everything (⚠️ deletes all data)
docker compose down -v

# Rebuild and start fresh
docker compose build
docker compose up -d
docker compose exec backend python init_db.py
```

---

## Post-Installation

### Change Default Passwords

1. Log in to panel: http://your-ip
2. Login with: `admin@example.com` / `admin123`
3. Go to Profile or Admin → Users
4. Change password immediately

### Configure SSL/HTTPS

For production, set up reverse proxy with Let's Encrypt:

```bash
# Install nginx and certbot
sudo apt-get install -y nginx certbot python3-certbot-nginx

# Configure nginx (see nginx configuration examples)
# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

### Set Up Monitoring

1. Check service health: `docker compose ps`
2. Monitor logs: `docker compose logs -f`
3. Check resource usage: `docker stats`

---

## Support

- **Issues**: Open GitHub issue
- **Documentation**: See project docs
- **API Docs**: http://your-server-ip:8000/api/docs

