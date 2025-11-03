#!/bin/bash

# ============================================
# MS VPS Panel - Automated Installer
# ============================================
# This script automatically installs MS VPS Panel
# Supports: Ubuntu VPS and CodeSandbox

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Print banner
print_banner() {
    echo ""
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}    MS VPS Panel - Automated Installer${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo ""
}

# Global variables
COMPOSE_CMD="docker compose"
DOCKER_CMD="docker"

# Check if running as root
check_root() {
    if [ "$EUID" -eq 0 ]; then 
        log_warning "Running as root. Some commands may need sudo."
        SUDO=""
    else
        SUDO="sudo"
    fi
}

# Detect system type
detect_system() {
    log_info "Detecting system environment..."
    
    # Check for CodeSandbox
    if [ -n "$CODESANDBOX_ENV" ] || [ -d "/sandbox" ] || [ -n "$SANDBOX_ID" ] || grep -q "codesandbox" /etc/hostname 2>/dev/null; then
        SYSTEM_TYPE="codesandbox"
        log_success "Detected: CodeSandbox environment"
        return
    fi
    
    # Check for Ubuntu/Debian
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        if [[ "$ID" == "ubuntu" ]] || [[ "$ID" == "debian" ]]; then
            SYSTEM_TYPE="ubuntu"
            OS_VERSION="$VERSION_ID"
            log_success "Detected: $PRETTY_NAME"
            return
        fi
    fi
    
    # Default to manual selection
    SYSTEM_TYPE="unknown"
    log_warning "Could not auto-detect system type"
}

# System compatibility check
check_compatibility() {
    log_info "Checking system compatibility..."
    
    # Check OS
    if [ "$SYSTEM_TYPE" == "ubuntu" ]; then
        # Check Ubuntu version
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            UBUNTU_VERSION=$(echo $VERSION_ID | cut -d. -f1)
            if [ "$UBUNTU_VERSION" -lt 20 ]; then
                log_error "Ubuntu 20.04 or later is required. Detected: $VERSION_ID"
                exit 1
            fi
        fi
    fi
    
    # Check available disk space (at least 5GB)
    AVAILABLE_SPACE=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
    if [ "$AVAILABLE_SPACE" -lt 5 ]; then
        log_warning "Less than 5GB disk space available. Installation may fail."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        log_success "Disk space check passed: ${AVAILABLE_SPACE}GB available"
    fi
    
    # Check RAM (at least 2GB recommended)
    TOTAL_RAM=$(free -g | awk '/^Mem:/{print $2}')
    if [ "$TOTAL_RAM" -lt 2 ]; then
        log_warning "Less than 2GB RAM detected. Performance may be impacted."
    else
        log_success "RAM check passed: ${TOTAL_RAM}GB available"
    fi
}

# Install dependencies for Ubuntu
install_ubuntu_dependencies() {
    log_info "Installing system dependencies for Ubuntu..."
    
    $SUDO apt-get update -qq
    $SUDO apt-get install -y \
        curl \
        wget \
        git \
        build-essential \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release \
        openssl \
        ufw
    
    log_success "System dependencies installed"
}

# Install Docker
install_docker() {
    log_info "Installing Docker..."
    
    # Check if Docker is already installed
    if command -v docker &> /dev/null && docker --version &> /dev/null; then
        log_success "Docker is already installed: $(docker --version)"
        return
    fi
    
    if [ "$SYSTEM_TYPE" == "ubuntu" ]; then
        # Install Docker using official repository
        log_info "Installing Docker from official repository..."
        
        # Remove old versions
        $SUDO apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
        
        # Add Docker's official GPG key
        $SUDO mkdir -p /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | $SUDO gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        
        # Set up Docker repository
        echo \
          "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
          $(lsb_release -cs) stable" | $SUDO tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        # Install Docker
        $SUDO apt-get update -qq
        $SUDO apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        
        # Add current user to docker group (if not root)
        if [ "$EUID" -ne 0 ]; then
            $SUDO usermod -aG docker $USER
            log_info "Added $USER to docker group. You may need to log out and back in."
        fi
        
        # Enable and start Docker
        $SUDO systemctl enable docker
        $SUDO systemctl start docker
        
        # Verify installation
        if docker --version &> /dev/null; then
            log_success "Docker installed successfully: $(docker --version)"
        else
            log_error "Docker installation failed"
            exit 1
        fi
    else
        # CodeSandbox - Docker should already be available
        log_info "Checking Docker availability in CodeSandbox..."
        if command -v docker &> /dev/null; then
            log_success "Docker is available"
        else
            log_error "Docker is not available in this environment"
            exit 1
        fi
    fi
}

# Generate .env file
generate_env() {
    log_info "Generating .env configuration file..."
    
    if [ -f .env ]; then
        log_warning ".env file already exists"
        read -p "Overwrite existing .env file? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Keeping existing .env file"
            return
        fi
    fi
    
    # Make generate-env.sh executable
    if [ -f generate-env.sh ]; then
        chmod +x generate-env.sh
        ./generate-env.sh
        log_success ".env file generated"
    else
        log_error "generate-env.sh not found"
        exit 1
    fi
}

# Build and start Docker containers
build_and_start() {
    log_info "Building Docker images (this may take a few minutes)..."
    
    # Check if we can use docker
    if ! docker ps &> /dev/null; then
        log_warning "Cannot access Docker. Trying with sudo..."
        if $SUDO docker ps &> /dev/null; then
            log_info "Using sudo for Docker commands"
            DOCKER_CMD="$SUDO docker"
            COMPOSE_CMD="$SUDO docker compose"
        else
            log_error "Docker is not accessible. Please ensure Docker is installed and running."
            log_info "If you just added yourself to docker group, you may need to:"
            log_info "  1. Log out and back in, OR"
            log_info "  2. Run: newgrp docker"
            exit 1
        fi
    else
        DOCKER_CMD="docker"
        COMPOSE_CMD="docker compose"
    fi
    
    # Build images
    $COMPOSE_CMD build
    
    log_success "Docker images built successfully"
    
    log_info "Starting Docker containers..."
    $COMPOSE_CMD up -d
    
    log_success "Containers started"
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 15
    
    # Check if services are running
    if $COMPOSE_CMD ps | grep -q "Up"; then
        log_success "Services are running"
    else
        log_warning "Some services may not be running. Check with: $COMPOSE_CMD ps"
    fi
}

# Initialize database
initialize_database() {
    log_info "Initializing database..."
    
    # Wait a bit more for database to be ready
    log_info "Waiting for database to be ready..."
    sleep 15
    
    # Try to initialize database
    MAX_RETRIES=5
    RETRY_COUNT=0
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if $COMPOSE_CMD exec -T backend python init_db.py 2>/dev/null; then
            log_success "Database initialized successfully"
            return
        else
            RETRY_COUNT=$((RETRY_COUNT + 1))
            log_warning "Database initialization attempt $RETRY_COUNT failed. Retrying..."
            sleep 5
        fi
    done
    
    log_error "Failed to initialize database after $MAX_RETRIES attempts"
    log_info "You can manually initialize later with: $COMPOSE_CMD exec backend python init_db.py"
    log_info "Exact command: $COMPOSE_CMD exec -T backend python init_db.py"
}

# Setup firewall (Ubuntu only)
setup_firewall() {
    if [ "$SYSTEM_TYPE" != "ubuntu" ]; then
        return
    fi
    
    log_info "Configuring firewall..."
    
    read -p "Do you want to configure UFW firewall? (Y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        log_info "Skipping firewall configuration"
        return
    fi
    
    # Allow SSH first
    $SUDO ufw allow 22/tcp comment 'SSH'
    $SUDO ufw allow 8080/tcp comment 'HTTP (frontend)'
    $SUDO ufw allow 443/tcp comment 'HTTPS'
    
    # Enable firewall
    read -p "Enable UFW firewall now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "y" | $SUDO ufw enable
        log_success "Firewall configured and enabled"
    else
        log_info "Firewall rules added but not enabled. Enable manually with: sudo ufw enable"
    fi
}

# Print installation summary
print_summary() {
    echo ""
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}   Installation Complete!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""
    
    if [ "$SYSTEM_TYPE" == "codesandbox" ]; then
        log_info "CodeSandbox Installation Summary:"
        echo "  • Services are running in containers"
        echo "  • Frontend: Check CodeSandbox preview URL"
        echo "  • Backend API: Check exposed ports (usually port 8000)"
        echo "  • API Docs: http://your-sandbox-url:8000/api/docs"
    else
        # Get server IP
        SERVER_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "your-server-ip")
        
        log_info "Installation Summary:"
        echo "  • Frontend: http://${SERVER_IP}:8080"
        echo "  • Backend API: http://${SERVER_IP}:8000"
        echo "  • API Docs: http://${SERVER_IP}:8000/api/docs"
        echo "  • MinIO Console: http://${SERVER_IP}:9001"
    fi
    
    echo ""
    log_info "Default Login Credentials:"
    echo "  • Email: admin@example.com"
    echo "  • Password: admin123"
    echo ""
    log_warning "⚠️  SECURITY: Change default passwords immediately!"
    echo ""
    
    log_info "Useful Commands:"
    echo "  • View logs: docker compose logs -f"
    echo "  • Stop services: docker compose down"
    echo "  • Restart services: docker compose restart"
    echo "  • Check status: docker compose ps"
    echo ""
}

# Main installation function for Ubuntu
install_ubuntu() {
    log_info "Starting Ubuntu VPS installation..."
    
    check_compatibility
    install_ubuntu_dependencies
    install_docker
    
    generate_env
    build_and_start
    initialize_database
    setup_firewall
    
    # Note about docker group
    if [ "$EUID" -ne 0 ]; then
        log_info "Note: If you get 'permission denied' errors with docker, run:"
        log_info "  newgrp docker"
        log_info "  Or log out and back in to apply docker group changes"
    fi
}

# Main installation function for CodeSandbox
install_codesandbox() {
    log_info "Starting CodeSandbox installation..."
    
    # CodeSandbox usually has Docker pre-installed
    install_docker
    
    generate_env
    build_and_start
    initialize_database
    
    log_info "CodeSandbox installation complete!"
    log_info "Note: Ports are automatically exposed by CodeSandbox"
}

# Main function
main() {
    print_banner
    check_root
    detect_system
    
    # If system type is unknown, ask user
    if [ "$SYSTEM_TYPE" == "unknown" ]; then
        echo ""
        log_info "Please select your installation type:"
        echo "  1) Ubuntu VPS (Normal Ubuntu/Debian server)"
        echo "  2) CodeSandbox (Cloud development environment)"
        echo ""
        read -p "Enter your choice (1 or 2): " -n 1 -r
        echo
        
        if [[ $REPLY == "1" ]]; then
            SYSTEM_TYPE="ubuntu"
        elif [[ $REPLY == "2" ]]; then
            SYSTEM_TYPE="codesandbox"
        else
            log_error "Invalid choice. Exiting."
            exit 1
        fi
    else
        # Auto-detected, but ask for confirmation
        echo ""
        if [ "$SYSTEM_TYPE" == "ubuntu" ]; then
            log_info "Detected: Ubuntu VPS installation"
        else
            log_info "Detected: CodeSandbox installation"
        fi
        read -p "Is this correct? (Y/n): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Nn]$ ]]; then
            echo ""
            log_info "Please select your installation type:"
            echo "  1) Ubuntu VPS"
            echo "  2) CodeSandbox"
            echo ""
            read -p "Enter your choice (1 or 2): " -n 1 -r
            echo
            
            if [[ $REPLY == "1" ]]; then
                SYSTEM_TYPE="ubuntu"
            elif [[ $REPLY == "2" ]]; then
                SYSTEM_TYPE="codesandbox"
            else
                log_error "Invalid choice. Exiting."
                exit 1
            fi
        fi
    fi
    
    # Run appropriate installation
    if [ "$SYSTEM_TYPE" == "ubuntu" ]; then
        install_ubuntu
    else
        install_codesandbox
    fi
    
    print_summary
}

# Run main function
main

