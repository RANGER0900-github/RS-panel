#!/bin/bash
# Generate .env file with random secret key

SECRET_KEY=$(openssl rand -hex 32)

cat > .env << EOF
# ============================================
# MS VPS Panel - Environment Configuration
# ============================================
# IMPORTANT: Change SECRET_KEY in production!

# ============================================
# SECURITY - REQUIRED FOR PRODUCTION
# ============================================
# Auto-generated secret key - CHANGE THIS IN PRODUCTION!
# Generate new one with: openssl rand -hex 32
SECRET_KEY=${SECRET_KEY}

# Debug mode (set to false in production)
DEBUG=false

# ============================================
# DATABASE CONFIGURATION
# ============================================
# Default values work with docker-compose
# Format: postgresql://username:password@host:port/database
DATABASE_URL=postgresql://vpspanel:vpspanel@postgres:5432/vpspanel

# ============================================
# REDIS CONFIGURATION
# ============================================
# Default values work with docker-compose
REDIS_URL=redis://redis:6379/0

# ============================================
# S3/MINIO STORAGE CONFIGURATION
# ============================================
# For local development with MinIO (default)
USE_S3=false
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=vps-panel
S3_REGION=us-east-1

# For production with AWS S3:
# USE_S3=true
# S3_ENDPOINT=https://s3.amazonaws.com
# S3_ACCESS_KEY=your-aws-access-key
# S3_SECRET_KEY=your-aws-secret-key
# S3_BUCKET=your-bucket-name
# S3_REGION=us-east-1

# ============================================
# LIBVIRT/KVM CONFIGURATION
# ============================================
# Note: libvirt won't work inside Docker containers
# This is only for host-based installations
LIBVIRT_URI=qemu:///system

# ============================================
# CELERY CONFIGURATION
# ============================================
# Background job processing
CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/2

# ============================================
# TMATE CONFIGURATION
# ============================================
# tmate is used for private-only VPS console access
TMATE_HOST=localhost
TMATE_PORT=22
TMATE_BIN_PATH=/usr/bin/tmate
EOF

echo "✅ .env file generated successfully!"
echo "⚠️  Remember to change SECRET_KEY in production!"

