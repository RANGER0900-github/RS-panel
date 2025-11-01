# MS VPS Panel

A professional, production-ready VPS management panel for admins and users to create, manage, monitor, and operate VPS instances easily and securely.

## Features

### Admin Panel
- **Dashboard**: Professional admin interface with role-based access control (Admin, Support, Billing, User)
- **VPS Management**: Full CRUD operations for VPS instances
- **VPS Creation**: Comprehensive form with:
  - CPU cores, RAM, storage configuration
  - OS image selector (Ubuntu, Debian, custom images)
  - Expiration settings (minutes, hours, days, months) with configurable actions
  - User assignment
  - Network type (public IPv4 / private-only)
  - Start on create, auto-backups options
  - Cloud-init / user-data support
- **User Management**: Create, edit, suspend users, manage roles and SSH keys
- **Host Statistics**: Cluster-wide resource usage, per-host health, capacity planning
- **Activity & Audit Logs**: Complete audit trail of all actions
- **Image Management**: Upload, validate, and manage OS images
- **Templates/Plans**: Reusable VM flavors with pricing

### User Panel
- **Dashboard**: View all user VPS instances with status badges
- **VPS Detail**: Comprehensive VPS information with:
  - Live console (WebSocket-backed) or tmate for private-only instances
  - Real-time usage graphs (CPU, RAM, Disk, Network)
  - Start/Stop/Reboot/Rebuild/Resize/Reinstall actions
  - SSH keys management
  - Backups/snapshots
  - Networking details and firewall rules
  - Logs and notifications
- **Expiration & Renewal**: Clear expiry information and renewal actions

## Tech Stack

- **Backend**: FastAPI (Python 3.11+)
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Database**: PostgreSQL 15
- **Cache/Queue**: Redis 7
- **Storage**: MinIO (S3-compatible) or local filesystem
- **Virtualization**: KVM/QEMU via libvirt (for actual VPS provisioning)
- **Containerization**: Docker + Docker Compose

## Installation on Ubuntu VPS

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
    lsb-release
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

# Add current user to docker group (optional, to run docker without sudo)
sudo usermod -aG docker $USER

# Enable Docker to start on boot
sudo systemctl enable docker
sudo systemctl start docker

# Verify Docker installation
docker --version
docker compose version
```

### Step 3: Install Docker Compose (if not installed via plugin)

```bash
# Docker Compose is included with Docker 20.10+
# If you need standalone version:
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### Step 4: Clone the Repository

```bash
# Clone the MS VPS Panel repository
cd /opt
sudo git clone https://github.com/your-org/ms-vps-panel.git
cd ms-vps-panel

# Or if you have the files locally, upload them to /opt/ms-vps-panel
```

### Step 5: Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit the .env file with your settings
sudo nano .env
```

**Important**: Change these values in `.env`:
- `SECRET_KEY`: Generate a strong random secret key
  ```bash
  # Generate a secret key
  openssl rand -hex 32
  ```
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- Other service configurations as needed

### Step 6: Set Up libvirt/KVM (Required for VPS Provisioning)

```bash
# Install KVM and libvirt
sudo apt-get install -y \
    qemu-kvm \
    libvirt-daemon-system \
    libvirt-clients \
    bridge-utils \
    virt-manager \
    virtinst \
    libvirt-dev

# Add your user to libvirt group (adjust username as needed)
sudo usermod -aG libvirt $USER

# Enable and start libvirt service
sudo systemctl enable libvirtd
sudo systemctl start libvirtd

# Verify KVM is available
sudo virt-host-validate qemu
```

**Note**: If running in a VPS, nested virtualization may not be available. In that case, you may need to use a different virtualization backend or run on bare metal.

### Step 7: Install tmate (For Private-Only VPS Console Access)

```bash
# Install tmate
sudo apt-get install -y tmate

# Verify installation
tmate -V
```

### Step 8: Set Up Firewall (Optional but Recommended)

```bash
# Install UFW if not already installed
sudo apt-get install -y ufw

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow Docker (if needed)
sudo ufw allow 8000/tcp  # Backend API

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Step 9: Build and Start Services

```bash
# Navigate to project directory
cd /opt/ms-vps-panel

# Build Docker images
docker compose build

# Start all services
docker compose up -d

# Check service status
docker compose ps

# View logs
docker compose logs -f
```

### Step 10: Initialize Database

```bash
# Wait for services to be ready (about 30 seconds)
sleep 30

# The database tables will be created automatically on first run
# You can verify by checking backend logs
docker compose logs backend

# Initialize database with sample data (admin user, test user, sample host, OS images)
docker compose exec backend python init_db.py

# This creates:
# - Admin user: admin@example.com / admin123
# - Test user: user@example.com / user123
# - Sample host: localhost
# - Sample OS images: Ubuntu 22.04 LTS, Debian 12

# ⚠️  SECURITY WARNING: Change default passwords immediately!
```

**⚠️ Security Warning**: Change the admin password immediately after first login!

### Step 11: Access the Panel

- **Frontend**: http://your-server-ip
- **Backend API**: http://your-server-ip:8000
- **API Docs**: http://your-server-ip:8000/api/docs
- **MinIO Console**: http://your-server-ip:9001 (default: minioadmin/minioadmin)

### Step 12: Set Up as System Service (Optional)

Create a systemd service for auto-start:

```bash
sudo nano /etc/systemd/system/ms-vps-panel.service
```

Add the following content:

```ini
[Unit]
Description=MS VPS Panel
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/ms-vps-panel
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable ms-vps-panel.service
sudo systemctl start ms-vps-panel.service
```

## Updating the Panel

```bash
cd /opt/ms-vps-panel

# Pull latest changes
git pull

# Rebuild and restart
docker compose down
docker compose build
docker compose up -d

# Run database migrations if needed
docker compose exec backend alembic upgrade head
```

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

### Backup Database

```bash
# Create backup
docker compose exec postgres pg_dump -U vpspanel vpspanel > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker compose exec -T postgres psql -U vpspanel vpspanel < backup_file.sql
```

### Clean Up

```bash
# Stop and remove containers, networks
docker compose down

# Remove volumes (⚠️ This will delete all data)
docker compose down -v

# Remove images
docker compose down --rmi all
```

## Troubleshooting

### Port Already in Use

If port 80, 8000, or 5432 is already in use:

```bash
# Find process using port
sudo lsof -i :80
sudo lsof -i :8000

# Kill the process or change ports in docker-compose.yml
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
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

# Or add user to docker group (requires re-login)
sudo usermod -aG docker $USER
```

### libvirt Connection Errors

```bash
# Check libvirt status
sudo systemctl status libvirtd

# Restart libvirt
sudo systemctl restart libvirtd

# Verify KVM support
sudo virt-host-validate qemu
```

## Security Best Practices

1. **Change Default Credentials**: Immediately change all default passwords
2. **Use Strong Secret Key**: Generate a strong `SECRET_KEY` in `.env`
3. **Firewall**: Configure UFW or iptables to restrict access
4. **SSL/TLS**: Set up reverse proxy (nginx/Traefik) with Let's Encrypt SSL certificates
5. **Regular Updates**: Keep system and Docker images updated
6. **Backup**: Regular database and volume backups
7. **Monitor**: Set up monitoring and logging
8. **Access Control**: Use VPN or restrict admin panel access

## Production Deployment

For production deployment:

1. Set up reverse proxy (nginx) with SSL
2. Use environment-specific `.env` files
3. Set up automated backups
4. Configure monitoring (Prometheus/Grafana)
5. Use secrets management (Vault, AWS Secrets Manager)
6. Enable 2FA for all admin accounts
7. Configure rate limiting
8. Set up log aggregation
9. Use production PostgreSQL with proper backup strategy
10. Consider Kubernetes for orchestration (see `k8s/` directory)

## Architecture

```
┌─────────────┐
│   Nginx     │ (Reverse Proxy + SSL)
└──────┬──────┘
       │
┌──────▼──────────┐
│   Frontend     │ (React + Vite)
│   (Port 80)    │
└──────┬─────────┘
       │
┌──────▼──────────┐
│   Backend API   │ (FastAPI)
│   (Port 8000)   │
└──────┬─────────┘
       │
   ┌───┴───┬─────────┬──────────┐
   │       │         │          │
┌──▼──┐ ┌──▼──┐  ┌───▼───┐  ┌───▼────┐
│PostgreSQL│ │Redis │ │ MinIO │ │libvirt│
│ (5432)   │ │(6379)│ │ (9000)│ │ KVM   │
└─────────┘ └──────┘ └───────┘ └───────┘
```

## API Documentation

Once the backend is running, access the interactive API documentation:

- **Swagger UI**: http://your-server-ip:8000/api/docs
- **ReDoc**: http://your-server-ip:8000/api/redoc
- **OpenAPI JSON**: http://your-server-ip:8000/api/openapi.json

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

## Support

For issues, questions, or contributions:

- **Issues**: GitHub Issues
- **Documentation**: See `/docs` directory
- **API Docs**: http://your-server-ip:8000/api/docs

## License

[Your License Here]

## Credits

Inspired by Pterodactyl and other professional VPS management panels.

