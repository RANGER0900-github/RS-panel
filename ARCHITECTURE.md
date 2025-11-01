# MS VPS Panel - Architecture

## Overview

MS VPS Panel is a full-featured VPS management system built with modern, scalable technologies. It consists of a React frontend, FastAPI backend, PostgreSQL database, Redis cache, and integration with libvirt/KVM for actual VPS provisioning.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP/HTTPS
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Nginx Reverse Proxy                        │
│              (SSL/TLS, Load Balancing)                       │
└──────┬───────────────────────┬──────────────────────────────┘
       │                        │
       │ /api/*                 │ /*
       │                        │
┌──────▼──────────┐    ┌────────▼─────────┐
│  Backend API    │    │   Frontend        │
│  (FastAPI)      │    │   (React/Vite)    │
│  Port 8000     │    │   Port 80         │
└──────┬──────────┘    └──────────────────┘
       │
       ├─────────────┬────────────┬────────────┬──────────┐
       │             │            │            │          │
┌──────▼───┐  ┌──────▼───┐  ┌─────▼───┐  ┌────▼────┐ ┌───▼────┐
│PostgreSQL│  │  Redis   │  │  MinIO  │  │libvirt  │ │ Celery │
│  Port    │  │  Port    │  │  Port   │  │  KVM   │ │ Worker │
│  5432    │  │  6379    │  │  9000   │  │         │ │        │
└──────────┘  └──────────┘  └─────────┘  └─────────┘ └────────┘
```

## Component Details

### Frontend (React + TypeScript)

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **API Client**: Axios + React Query
- **Routing**: React Router v6
- **UI Components**: Custom components with Tailwind

**Key Features**:
- Responsive design (mobile-first)
- Real-time updates via WebSocket (future)
- Admin and User dashboards
- Role-based UI rendering
- Form validation and error handling

### Backend (FastAPI + Python)

- **Framework**: FastAPI
- **Language**: Python 3.11+
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **API Docs**: OpenAPI/Swagger (auto-generated)
- **Authentication**: JWT tokens
- **RBAC**: Role-based access control

**API Structure**:
```
/api/v1/
  ├── /auth          # Authentication endpoints
  ├── /admin         # Admin-only endpoints
  ├── /users         # User management
  ├── /vps           # VPS CRUD operations
  ├── /hosts         # Host management & statistics
  ├── /images        # OS image management
  ├── /ssh-keys      # SSH key management
  └── /tmate         # tmate session creation
```

**Core Services**:
- User authentication and authorization
- VPS provisioning and management
- Host monitoring and statistics
- Image upload and validation
- Audit logging
- Background job processing (Celery)

### Database (PostgreSQL)

**Schema Overview**:
- `users`: User accounts with roles (Admin, Support, Billing, User)
- `vpses`: VPS instances with specs and status
- `hosts`: Physical/virtual hosts running VPSes
- `os_images`: Operating system images
- `vps_templates`: Reusable VPS templates/plans
- `ssh_keys`: SSH public keys for users
- `audit_logs`: Complete audit trail
- `vps_snapshots`: Backup snapshots

**Relationships**:
- Users → VPSes (one-to-many)
- Hosts → VPSes (one-to-many)
- OS Images → VPSes (one-to-many)
- Users → SSH Keys (one-to-many)

### Cache/Queue (Redis)

**Usage**:
- Session storage
- API rate limiting
- Celery task queue (broker & result backend)
- tmate session storage
- Cache for frequently accessed data

### Storage (MinIO / S3)

**Storage for**:
- OS images (qcow2, raw, etc.)
- VPS snapshots
- Backup files
- User uploads

**Features**:
- S3-compatible API
- Supports local filesystem or S3-compatible services
- Configurable bucket policies

### Virtualization (libvirt/KVM)

**Integration**:
- Create VPS instances via libvirt
- Manage VM lifecycle (start, stop, reboot)
- Monitor resource usage
- Network configuration
- Snapshot management

**Requirements**:
- KVM-enabled host (bare metal or nested virtualization)
- libvirt daemon running
- Appropriate permissions

### Background Jobs (Celery)

**Job Types**:
- VPS provisioning
- Image processing/validation
- Backup creation
- Expiration handling
- Statistics collection
- Cleanup tasks

## Data Flow

### VPS Creation Flow

```
1. Admin submits VPS creation form
   ↓
2. Frontend sends POST /api/v1/vps
   ↓
3. Backend validates request & creates VPS record
   ↓
4. Backend triggers Celery task for provisioning
   ↓
5. Celery worker:
   - Selects available host
   - Uploads OS image if needed
   - Creates VM via libvirt
   - Configures networking
   - Applies cloud-init
   - Starts VM (if requested)
   ↓
6. Backend updates VPS status to "running"
   ↓
7. Frontend polls/WebSocket updates status
```

### Console Access Flow (Private-Only VPS)

```
1. User requests console access
   ↓
2. Frontend sends POST /api/v1/tmate/vps/{id}
   ↓
3. Backend:
   - SSHes to host
   - Runs tmate command
   - Captures session URL
   - Stores in Redis with TTL
   ↓
4. Returns tmate URL to frontend
   ↓
5. User clicks URL to connect via tmate
```

### Statistics Collection Flow

```
1. Celery periodic task runs (every minute)
   ↓
2. For each host:
   - Connects via libvirt
   - Collects CPU, RAM, storage usage
   - Updates host.stats_cache
   ↓
3. For each VPS:
   - Reads VM stats via libvirt
   - Updates vps.stats_cache
   ↓
4. API endpoints return cached stats
```

## Security Architecture

### Authentication

- **JWT Tokens**: Access token (30 min) + Refresh token (7 days)
- **Password Hashing**: bcrypt with salt
- **2FA Support**: TOTP (Time-based One-Time Password)
- **Session Management**: Redis-backed sessions

### Authorization

- **RBAC**: Role-based access control
  - Admin: Full access
  - Support: Read/update VPS, read users
  - Billing: Billing operations only
  - User: Own VPS operations only

### Security Features

- **Rate Limiting**: Per-IP and per-user
- **CORS**: Configurable origins
- **Input Validation**: Pydantic schemas
- **SQL Injection Prevention**: SQLAlchemy ORM
- **XSS Prevention**: React escaping
- **CSRF Protection**: SameSite cookies
- **Audit Logging**: All actions logged
- **Secrets Management**: Environment variables + optional Vault

## Scalability

### Horizontal Scaling

- **Frontend**: Stateless, can run multiple instances behind load balancer
- **Backend**: Stateless API, can run multiple instances
- **Database**: PostgreSQL replication (master-slave)
- **Redis**: Redis Cluster for high availability
- **Celery**: Multiple workers for job processing

### Vertical Scaling

- Increase host resources (CPU, RAM, storage)
- Add more hosts to cluster
- Increase database connection pool
- Scale Redis memory

## Deployment Options

### Docker Compose (Development/Simple Production)

- All services in containers
- Easy to set up and manage
- Good for small to medium deployments
- Single host deployment

### Kubernetes (Production)

- Container orchestration
- Auto-scaling
- Rolling updates
- High availability
- Multi-host deployment
- See `k8s/` directory for manifests

## Monitoring & Observability

### Metrics

- **Prometheus**: Application metrics
- **Grafana**: Visualization and dashboards
- **Host Metrics**: CPU, RAM, disk usage
- **VPS Metrics**: Per-VPS resource usage
- **API Metrics**: Request rates, latency, errors

### Logging

- **Structured Logging**: JSON format
- **Log Levels**: DEBUG, INFO, WARNING, ERROR
- **Log Aggregation**: Optional ELK stack or similar
- **Audit Logs**: All administrative actions

### Health Checks

- **Backend**: `/health` endpoint
- **Database**: Connection health check
- **Redis**: Ping check
- **Services**: Docker health checks

## Extensibility

### Plugin System

- **Hooks**: Pre/post action hooks
- **Webhooks**: External integrations
- **Custom Providers**: Cloud provider support
- **Billing Integration**: Stripe, PayPal, etc.

### API Extensibility

- **OpenAPI Spec**: Auto-generated and versioned
- **RESTful Design**: Standard HTTP methods
- **WebSocket Support**: Real-time updates (future)
- **GraphQL Support**: Optional (future)

## Disaster Recovery

### Backup Strategy

- **Database**: Daily automated backups (pg_dump)
- **Volumes**: Docker volume snapshots
- **Images**: Sync to secondary storage
- **Snapshots**: VPS snapshots stored in S3

### Recovery

- **Point-in-Time Recovery**: PostgreSQL WAL archiving
- **Failover**: Manual failover process
- **Data Restore**: From backups
- **Service Restoration**: Docker compose up

## Future Enhancements

- [ ] WebSocket support for real-time updates
- [ ] GraphQL API
- [ ] Advanced monitoring with Prometheus/Grafana
- [ ] Multi-region support
- [ ] Cloud provider integrations (AWS, GCP, Azure)
- [ ] Advanced billing system
- [ ] API rate limiting per user
- [ ] Advanced firewall rules
- [ ] Container-based VPS (LXC/Docker)
- [ ] Bare metal provisioning

