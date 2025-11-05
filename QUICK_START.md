# Quick Start Guide

This guide will help you get MS VPS Panel up and running quickly on a fresh Ubuntu VPS.

## Prerequisites

- Ubuntu 20.04 LTS or later (22.04 LTS recommended)
- Root or sudo access
- At least 4GB RAM
- At least 50GB disk space
- Internet connection

## One-Command Installation

For a quick setup, you can use this script (run as root or with sudo):

```bash
curl -fsSL https://raw.githubusercontent.com/your-org/ms-vps-panel/main/install.sh | bash
```

Or manually follow the steps below:

## Step-by-Step Installation

### 1. Update System

```bash
sudo apt-get update && sudo apt-get upgrade -y
```

### 2. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (logout and login after this)
sudo usermod -aG docker $USER

# Enable Docker
sudo systemctl enable docker
sudo systemctl start docker
```

### 3. Install Docker Compose

```bash
# Docker Compose v2 is included with Docker 20.10+
# Verify installation
docker compose version
```

### 4. Clone Repository

```bash
cd /opt
sudo git clone https://github.com/your-org/ms-vps-panel.git
cd ms-vps-panel
```

### 5. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Generate secret key
SECRET_KEY=$(openssl rand -hex 32)
sed -i "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" .env

# Edit other settings if needed
nano .env
```

### 6. Install Dependencies (for libvirt)

```bash
sudo apt-get install -y \
    qemu-kvm \
    libvirt-daemon-system \
    libvirt-clients \
    bridge-utils \
    tmate

# Add user to libvirt group
sudo usermod -aG libvirt $USER

# Start libvirt
sudo systemctl enable libvirtd
sudo systemctl start libvirtd
```

### 7. Start Services

```bash
# Build and start
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### 8. Initialize Database

Wait 30 seconds for services to start, then:

```bash
docker compose exec backend python init_db.py
```

This creates:
- Admin user: `admin@example.com` / `admin123`
- Test user: `user@example.com` / `user123`
- Sample host and OS images

### 9. Access Panel

- **Frontend**: http://your-server-ip
- **API Docs**: http://your-server-ip:8000/api/docs
- **Login**: `admin@example.com` / `admin123`

**⚠️ Change passwords immediately!**

## Troubleshooting

### Check Service Status

```bash
docker compose ps
docker compose logs backend
docker compose logs frontend
```

### Restart Services

```bash
docker compose restart
```

### Rebuild After Code Changes

```bash
docker compose down
docker compose build
docker compose up -d
```

### Reset Everything

```bash
# Stop and remove everything
docker compose down -v

# Start fresh
docker compose up -d
docker compose exec backend python init_db.py
```

## Next Steps

1. **Change Passwords**: Log in and change admin password immediately
2. **Configure Host**: Add your first host in Admin → Hosts
3. **Upload OS Images**: Upload OS images in Admin → Images
4. **Create VPS**: Create your first VPS instance
5. **Configure SSL**: Set up reverse proxy with Let's Encrypt SSL

## Documentation

- **Full Installation Guide**: See [README.md](README.md)
- **Architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md)
- **API Documentation**: http://your-server-ip:8000/api/docs

