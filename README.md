# MS VPS Panel

A professional, production-ready VPS management panel for admins and users to create, manage, monitor, and operate VPS instances easily and securely.

## Features

### Admin Panel
- **Dashboard**: Professional admin interface with role-based access control (Admin, Support, Billing, User)
- **VPS Management**: Full CRUD operations for VPS instances
- **VPS Creation**: Comprehensive form with CPU, RAM, storage, OS images, expiration settings, and more
- **User Management**: Create, edit, suspend users, manage roles and SSH keys
- **Host Statistics**: Cluster-wide resource usage, per-host health monitoring
- **Activity & Audit Logs**: Complete audit trail of all actions
- **Image Management**: Upload, validate, and manage OS images
- **Templates/Plans**: Reusable VM flavors with pricing

### User Panel
- **Dashboard**: View all user VPS instances with status badges
- **VPS Detail**: Comprehensive VPS information with live console, usage graphs, and management actions
- **SSH Keys**: Manage SSH public keys
- **Backups/Snapshots**: View and restore backups
- **Notifications**: Real-time alerts and updates

## Tech Stack

- **Backend**: FastAPI (Python 3.11+)
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Database**: PostgreSQL 15
- **Cache/Queue**: Redis 7
- **Storage**: MinIO (S3-compatible)
- **Containerization**: Docker + Docker Compose

---

## Installation Methods

This project supports two installation methods:

1. **[Method 1: Installation on Ubuntu VPS](#method-1-installation-on-ubuntu-vps)** - Full installation on a dedicated Ubuntu server
2. **[Method 2: CodeSandbox Docker Template](#method-2-codesandbox-docker-template)** - Quick setup using CodeSandbox

---

## Method 1: Installation on Ubuntu VPS

### Prerequisites

- Ubuntu 20.04 LTS or later (22.04 LTS recommended)
- Root or sudo access
- At least 4GB RAM (8GB+ recommended for production)
- At least 50GB free disk space
- Internet connection

### Step 1: Update System

```bash
# Update package lists
sudo apt-get update

# Upgrade existing packages
sudo apt-get upgrade -y

# Install essential tools
sudo apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    openssl
```

### Step 2: Install Docker

```bash
# Add Docker's official GPG key
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add current user to docker group
sudo usermod -aG docker $USER

# Enable Docker to start on boot
sudo systemctl enable docker
sudo systemctl start docker

# Verify Docker installation
docker --version
docker compose version
```

### Step 3: Clone the Repository

```bash
# Clone or upload the project
cd /opt
sudo git clone https://github.com/your-org/ms-vps-panel.git
cd ms-vps-panel

# Or if you have the files locally, upload them to /opt/ms-vps-panel
```

### Step 4: Generate Environment File

```bash
# Navigate to project directory
cd /opt/ms-vps-panel

# Generate .env file with random secret key
chmod +x generate-env.sh
./generate-env.sh

# Or manually generate .env
cp .env.example .env

# Generate a secret key and add to .env
SECRET_KEY=$(openssl rand -hex 32)
sed -i "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" .env
```

**Important**: Review the `.env` file and change any values as needed for production.

### Step 5: Build and Start Services

```bash
# Build Docker images
docker compose build

# Start all services
docker compose up -d

# Check service status
docker compose ps

# View logs
docker compose logs -f
```

### Step 6: Initialize Database

```bash
# Wait for services to be ready (about 30 seconds)
sleep 30

# Initialize database with sample data
docker compose exec backend python init_db.py

# This creates:
# - Admin user: admin@example.com / admin123
# - Test user: user@example.com / user123
# - Sample host: localhost
# - Sample OS images: Ubuntu 22.04 LTS, Debian 12

# ⚠️  SECURITY WARNING: Change default passwords immediately!
```

### Step 7: Access the Panel

- **Frontend**: http://your-server-ip
- **Backend API**: http://your-server-ip:8000
- **API Docs**: http://your-server-ip:8000/api/docs
- **MinIO Console**: http://your-server-ip:9001 (default: minioadmin/minioadmin)

**Default Login**: `admin@example.com` / `admin123`

### Step 8: Set Up Firewall (Optional but Recommended)

```bash
# Install UFW
sudo apt-get install -y ufw

# Allow SSH (IMPORTANT - do this first!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow Backend API (optional, only if needed externally)
sudo ufw allow 8000/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Step 9: Set Up libvirt/KVM (Optional - for VPS Provisioning)

**Note**: This is only needed if you want actual VPS provisioning. The panel works without it for management purposes.

```bash
# Install KVM and libvirt (on HOST, not in Docker)
sudo apt-get install -y \
    qemu-kvm \
    libvirt-daemon-system \
    libvirt-clients \
    bridge-utils \
    virt-manager \
    virtinst \
    libvirt-dev

# Add your user to libvirt group
sudo usermod -aG libvirt $USER

# Enable and start libvirt service
sudo systemctl enable libvirtd
sudo systemctl start libvirtd

# Verify KVM is available
sudo virt-host-validate qemu
```

**Important**: libvirt won't work inside Docker containers. For actual VPS provisioning, you'll need to run libvirt on the host system and connect to it from the backend.

### Step 10: Install tmate (Optional - for Private VPS Console Access)

```bash
# Install tmate
sudo apt-get install -y tmate

# Verify installation
tmate -V
```

---

## Method 2: CodeSandbox Docker Template

This method is ideal for quick testing, development, or deploying to cloud platforms like CodeSandbox.

### Prerequisites

- CodeSandbox account or Docker-compatible environment
- Git access (if cloning)

### Step 1: Import Project to CodeSandbox

1. Go to [CodeSandbox](https://codesandbox.io)
2. Click "Import from GitHub" or "Create Sandbox"
3. If importing from GitHub, paste your repository URL
4. If creating new, upload the project files

### Step 2: Configure Environment

CodeSandbox will automatically detect the `docker-compose.yml` file. You may need to:

1. Create a `.env` file in the root directory
2. Use the provided `generate-env.sh` script:

```bash
# In CodeSandbox terminal
chmod +x generate-env.sh
./generate-env.sh
```

Or manually create `.env`:

```bash
# Generate secret key
SECRET_KEY=$(openssl rand -hex 32)

# Create .env file
cat > .env << EOF
SECRET_KEY=${SECRET_KEY}
DEBUG=false
DATABASE_URL=postgresql://vpspanel:vpspanel@postgres:5432/vpspanel
REDIS_URL=redis://redis:6379/0
USE_S3=false
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=vps-panel
S3_REGION=us-east-1
LIBVIRT_URI=qemu:///system
CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/2
TMATE_HOST=localhost
TMATE_PORT=22
TMATE_BIN_PATH=/usr/bin/tmate
EOF
```

### Step 3: Start Services in CodeSandbox

CodeSandbox Docker template supports:

1. **Automatic Detection**: CodeSandbox will detect `docker-compose.yml`
2. **Manual Start**: If needed, run in terminal:

```bash
# Build and start services
docker compose up -d

# View logs
docker compose logs -f
```

### Step 4: Access the Panel

CodeSandbox provides preview URLs:
- **Frontend**: Check CodeSandbox preview (usually `https://your-sandbox-id.csb.app`)
- **Backend API**: Check exposed ports (usually `https://your-sandbox-id-8000.csb.app`)
- **API Docs**: `https://your-sandbox-id-8000.csb.app/api/docs`

### Step 5: Initialize Database

```bash
# Wait for services to start
sleep 30

# Initialize database
docker compose exec backend python init_db.py
```

### CodeSandbox-Specific Notes

1. **Port Exposing**: CodeSandbox automatically exposes ports 80 and 8000
2. **Environment Variables**: Can be set in CodeSandbox settings
3. **Persistence**: Data persists across sessions
4. **Limitations**: 
   - libvirt/KVM won't work (container limitations)
   - Some system-level operations may be restricted
   - Best for development/testing

### CodeSandbox Quick Start Template

For a ready-to-use CodeSandbox template, add this to your repository:

**`.codesandbox/template.json`**:
```json
{
  "title": "MS VPS Panel",
  "description": "Professional VPS Management Panel",
  "template": "docker",
  "containerPort": 80,
  "ports": [80, 8000],
  "postInstallCommand": "./generate-env.sh && docker compose up -d"
}
```

---

## Common Commands

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### Stop Services

```bash
docker compose down
```

### Restart Services

```bash
docker compose restart
```

### Rebuild After Changes

```bash
# Rebuild and restart
docker compose down
docker compose build
docker compose up -d
```

### Backup Database

```bash
# Create backup
docker compose exec postgres pg_dump -U vpspanel vpspanel > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker compose exec -T postgres psql -U vpspanel vpspanel < backup_file.sql
```

---

## Troubleshooting

### Build Errors

**Error**: `npm ci` fails - missing package-lock.json
- **Solution**: Already fixed in Dockerfile (uses `npm install`)

**Error**: `libvirt-python` build fails
- **Solution**: Already fixed - libvirt-python is optional and commented out

**Error**: Port already in use
```bash
# Find process using port
sudo lsof -i :80
sudo lsof -i :8000

# Kill process or change ports in docker-compose.yml
```

### Database Connection Issues

```bash
# Check PostgreSQL status
docker compose ps postgres

# Check PostgreSQL logs
docker compose logs postgres

# Restart PostgreSQL
docker compose restart postgres
```

### Frontend Not Loading

```bash
# Check frontend logs
docker compose logs frontend

# Rebuild frontend
docker compose build frontend
docker compose up -d frontend
```

### Permission Issues

```bash
# Fix Docker socket permissions
sudo chmod 666 /var/run/docker.sock

# Add user to docker group (requires re-login)
sudo usermod -aG docker $USER
newgrp docker
```

### Services Not Starting

```bash
# Check all services status
docker compose ps

# View error logs
docker compose logs

# Rebuild from scratch
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

---

## Environment Variables

The `.env` file contains all configuration. Generate it using:

```bash
./generate-env.sh
```

**Key Variables**:
- `SECRET_KEY`: **REQUIRED** - JWT token secret (generate with `openssl rand -hex 32`)
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `DEBUG`: Set to `false` in production
- `USE_S3`: Set to `true` for AWS S3, `false` for local MinIO

See `.env.example` for all available options.

---

## Security Best Practices

1. **Change Default Passwords**: Immediately change admin password after first login
2. **Use Strong Secret Key**: Generate a new `SECRET_KEY` for production
3. **Firewall**: Configure UFW or iptables to restrict access
4. **SSL/TLS**: Set up reverse proxy (nginx/Traefik) with Let's Encrypt SSL
5. **Regular Updates**: Keep system and Docker images updated
6. **Backup**: Regular database and volume backups
7. **Monitor**: Set up monitoring and logging
8. **Access Control**: Use VPN or restrict admin panel access

---

## API Documentation

Once the backend is running, access the interactive API documentation:

- **Swagger UI**: http://your-server-ip:8000/api/docs
- **ReDoc**: http://your-server-ip:8000/api/redoc
- **OpenAPI JSON**: http://your-server-ip:8000/api/openapi.json

---

## Development

### Backend Development

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

---

## Support

For issues, questions, or contributions:
- **Issues**: GitHub Issues
- **Documentation**: See project docs
- **API Docs**: http://your-server-ip:8000/api/docs

---

## License

[Your License Here]

## Credits

Inspired by Pterodactyl and other professional VPS management panels.
