#!/bin/bash

# SSC Exam Backend Deployment Script for EC2
# This script automates the deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/opt/ssc-exam-backend/ssc-exam-backend"
SERVICE_NAME="ssc-exam-backend"
BACKUP_DIR="/opt/backups"

echo -e "${GREEN}Starting deployment of SSC Exam Backend...${NC}"

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root directly. Use sudo when needed."
   exit 1
fi

# Backup current JAR if exists
if [ -f "$APP_DIR/target/ssc-exam-backend-1.0.0.jar" ]; then
    print_info "Backing up current JAR..."
    sudo mkdir -p $BACKUP_DIR/jars
    sudo cp "$APP_DIR/target/ssc-exam-backend-1.0.0.jar" \
        "$BACKUP_DIR/jars/ssc-exam-backend-$(date +%Y%m%d_%H%M%S).jar"
    print_success "Backup completed"
fi

# Navigate to application directory
cd $APP_DIR
print_success "Changed to application directory"

# Pull latest code (if using git)
if [ -d ".git" ]; then
    print_info "Pulling latest code from repository..."
    git pull
    print_success "Code updated"
else
    print_info "Not a git repository, skipping pull"
fi

# Build the application
print_info "Building application with Maven..."
mvn clean package -DskipTests

if [ $? -eq 0 ]; then
    print_success "Build completed successfully"
else
    print_error "Build failed!"
    exit 1
fi

# Check if JAR was created
if [ ! -f "$APP_DIR/target/ssc-exam-backend-1.0.0.jar" ]; then
    print_error "JAR file not found after build!"
    exit 1
fi

print_success "JAR file created successfully"

# Stop the service
print_info "Stopping $SERVICE_NAME service..."
sudo systemctl stop $SERVICE_NAME
print_success "Service stopped"

# Wait a moment for the service to fully stop
sleep 3

# Start the service
print_info "Starting $SERVICE_NAME service..."
sudo systemctl start $SERVICE_NAME

# Wait for service to start
sleep 5

# Check service status
if sudo systemctl is-active --quiet $SERVICE_NAME; then
    print_success "Service started successfully"
else
    print_error "Service failed to start!"
    print_info "Checking logs..."
    sudo journalctl -u $SERVICE_NAME -n 50 --no-pager
    exit 1
fi

# Test health endpoint
print_info "Testing health endpoint..."
sleep 5

HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health || echo "000")

if [ "$HEALTH_CHECK" = "200" ]; then
    print_success "Health check passed!"
else
    print_error "Health check failed! HTTP Status: $HEALTH_CHECK"
    print_info "Checking application logs..."
    sudo journalctl -u $SERVICE_NAME -n 20 --no-pager
fi

# Display service status
print_info "Service Status:"
sudo systemctl status $SERVICE_NAME --no-pager -l

echo ""
print_success "Deployment completed!"
echo ""
print_info "Useful commands:"
echo "  View logs: sudo journalctl -u $SERVICE_NAME -f"
echo "  Restart service: sudo systemctl restart $SERVICE_NAME"
echo "  Check status: sudo systemctl status $SERVICE_NAME"
echo ""
