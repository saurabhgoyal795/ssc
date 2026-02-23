#!/bin/bash

################################################################################
# SSC Exam Backend - Automated EC2 Setup Script
# This script automates the entire deployment process on Ubuntu 22.04
################################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/opt/ssc-exam-backend"
DB_NAME="sscexam"
DB_USER="sscexam_user"

# Functions for colored output
print_header() {
    echo ""
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_step() {
    echo -e "${BLUE}➜ $1${NC}"
}

# Check if running on Ubuntu
if [ ! -f /etc/lsb-release ]; then
    print_error "This script is designed for Ubuntu. Exiting."
    exit 1
fi

print_header "SSC Exam Backend - EC2 Automated Setup"

echo "This script will install and configure:"
echo "  • Java 17"
echo "  • PostgreSQL"
echo "  • Maven"
echo "  • Nginx"
echo "  • Application files and services"
echo ""
read -p "Continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Step 1: Update System
print_header "Step 1: Updating System Packages"
print_step "Updating package list..."
sudo apt update
print_step "Upgrading packages..."
sudo apt upgrade -y
print_success "System updated successfully"

# Step 2: Install Java 17
print_header "Step 2: Installing Java 17"
print_step "Installing OpenJDK 17..."
sudo apt install -y openjdk-17-jdk openjdk-17-jre
java -version
print_success "Java 17 installed successfully"

# Step 3: Install PostgreSQL
print_header "Step 3: Installing PostgreSQL"
print_step "Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
print_success "PostgreSQL installed and started"

# Step 4: Configure PostgreSQL
print_header "Step 4: Configuring PostgreSQL Database"
print_info "Enter a secure password for the database user"
read -sp "Database password: " DB_PASSWORD
echo ""
read -sp "Confirm password: " DB_PASSWORD_CONFIRM
echo ""

if [ "$DB_PASSWORD" != "$DB_PASSWORD_CONFIRM" ]; then
    print_error "Passwords do not match!"
    exit 1
fi

print_step "Creating database and user..."
sudo -u postgres psql <<EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;
\q
EOF

print_success "Database configured successfully"

# Step 5: Install Maven
print_header "Step 5: Installing Maven"
sudo apt install -y maven
mvn -version
print_success "Maven installed successfully"

# Step 6: Install Git and other tools
print_header "Step 6: Installing Additional Tools"
sudo apt install -y git curl wget unzip
print_success "Additional tools installed"

# Step 7: Setup Application Directory
print_header "Step 7: Setting Up Application Directory"
print_step "Creating application directory..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR
cd $APP_DIR

print_info "How do you want to get your application code?"
echo "1) Clone from GitHub"
echo "2) I'll upload files manually later"
read -p "Choose option (1 or 2): " CODE_OPTION

if [ "$CODE_OPTION" = "1" ]; then
    read -p "Enter your GitHub repository URL: " REPO_URL
    print_step "Cloning repository..."
    git clone $REPO_URL .
    print_success "Repository cloned"
else
    print_info "Please upload your code to $APP_DIR"
    print_info "You can use: scp -i your-key.pem -r ./ssc-exam-backend ubuntu@$HOSTNAME:$APP_DIR/"
    read -p "Press enter when you've uploaded the files..." dummy
fi

# Step 8: Create Environment Configuration
print_header "Step 8: Configuring Environment Variables"

# Navigate to backend directory
if [ -d "ssc-exam-backend" ]; then
    cd ssc-exam-backend
fi

print_step "Creating .env file..."

# JWT Secret generation
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')

# Get domain information
read -p "Enter your domain name (or press enter to use IP): " DOMAIN_NAME
if [ -z "$DOMAIN_NAME" ]; then
    DOMAIN_NAME="http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
fi

# Create .env file
cat > .env <<EOF
# Database Configuration
DATABASE_URL=jdbc:postgresql://localhost:5432/$DB_NAME
DATABASE_USERNAME=$DB_USER
DATABASE_PASSWORD=$DB_PASSWORD

# JWT Configuration
JWT_SECRET=$JWT_SECRET

# CORS Configuration
CORS_ORIGINS=$DOMAIN_NAME,https://$DOMAIN_NAME

# AWS S3 Configuration (Optional - add your values if needed)
AWS_ACCESS_KEY=
AWS_SECRET_KEY=
AWS_REGION=ap-south-1
AWS_S3_BUCKET=ssc-exam-files

# Razorpay Configuration (Optional - add your values if needed)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Email Configuration (Optional - add your values if needed)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
EMAIL_FROM=noreply@sscexam.com
EMAIL_VERIFICATION_URL=$DOMAIN_NAME/verify-email
EMAIL_RESET_PASSWORD_URL=$DOMAIN_NAME/reset-password

# Server Configuration
PORT=8080
EOF

print_success ".env file created"
print_info "You can edit $APP_DIR/ssc-exam-backend/.env later to add AWS, Razorpay, and Email configs"

# Step 9: Build Application
print_header "Step 9: Building Application"
print_step "Building with Maven (this may take a few minutes)..."

if mvn clean package -DskipTests; then
    print_success "Application built successfully"
else
    print_error "Build failed! Please check the errors above"
    exit 1
fi

# Check if JAR was created
JAR_FILE=$(find target -name "*.jar" -not -name "*-sources.jar" | head -n 1)
if [ -z "$JAR_FILE" ]; then
    print_error "JAR file not found!"
    exit 1
fi

print_success "JAR file created: $JAR_FILE"

# Step 10: Create Systemd Service
print_header "Step 10: Setting Up Systemd Service"

print_step "Creating service file..."
sudo tee /etc/systemd/system/ssc-exam-backend.service > /dev/null <<EOF
[Unit]
Description=SSC Exam Backend Service
After=postgresql.service network.target
Requires=postgresql.service

[Service]
Type=simple
User=$USER
Group=$USER
WorkingDirectory=$APP_DIR/ssc-exam-backend

ExecStart=/usr/bin/java -jar -Xmx512m -Xms256m $APP_DIR/ssc-exam-backend/$JAR_FILE

EnvironmentFile=$APP_DIR/ssc-exam-backend/.env

Restart=always
RestartSec=10

StandardOutput=journal
StandardError=journal
SyslogIdentifier=ssc-exam-backend

NoNewPrivileges=true
PrivateTmp=true

LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

print_step "Enabling and starting service..."
sudo systemctl daemon-reload
sudo systemctl enable ssc-exam-backend
sudo systemctl start ssc-exam-backend

sleep 5

if sudo systemctl is-active --quiet ssc-exam-backend; then
    print_success "Service started successfully"
else
    print_error "Service failed to start. Checking logs..."
    sudo journalctl -u ssc-exam-backend -n 50 --no-pager
    exit 1
fi

# Step 11: Install and Configure Nginx
print_header "Step 11: Installing and Configuring Nginx"
sudo apt install -y nginx

print_step "Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/ssc-exam-backend > /dev/null <<'EOF'
upstream backend {
    server localhost:8080;
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;
    server_name _;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /actuator/health {
        proxy_pass http://backend;
        access_log off;
    }

    client_max_body_size 10M;

    access_log /var/log/nginx/ssc-exam-backend-access.log;
    error_log /var/log/nginx/ssc-exam-backend-error.log;
}
EOF

print_step "Enabling site..."
sudo ln -sf /etc/nginx/sites-available/ssc-exam-backend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

print_step "Testing Nginx configuration..."
sudo nginx -t

print_step "Starting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

print_success "Nginx configured and started"

# Step 12: Configure Firewall
print_header "Step 12: Configuring Firewall"
sudo apt install -y ufw
sudo ufw allow 22/tcp
sudo ufw allow 'Nginx Full'
echo "y" | sudo ufw enable
sudo ufw status
print_success "Firewall configured"

# Step 13: Setup Database Backups
print_header "Step 13: Setting Up Database Backups"
sudo mkdir -p /opt/backups/postgres
sudo chown $USER:$USER /opt/backups/postgres

cat > /opt/backups/backup-db.sh <<EOF
#!/bin/bash
BACKUP_DIR="/opt/backups/postgres"
DB_NAME="$DB_NAME"
DB_USER="$DB_USER"
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="\$BACKUP_DIR/sscexam_\$DATE.sql.gz"

export PGPASSWORD="$DB_PASSWORD"
pg_dump -U \$DB_USER -h localhost \$DB_NAME | gzip > \$BACKUP_FILE

find \$BACKUP_DIR -name "sscexam_*.sql.gz" -mtime +7 -delete

echo "Backup completed: \$BACKUP_FILE"
EOF

chmod +x /opt/backups/backup-db.sh
print_success "Backup script created at /opt/backups/backup-db.sh"

# Step 14: Test Health Endpoint
print_header "Step 14: Testing Application"
sleep 5

print_step "Testing health endpoint..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health)

if [ "$HEALTH_STATUS" = "200" ]; then
    print_success "Health check passed!"
else
    print_error "Health check failed (Status: $HEALTH_STATUS)"
fi

# Final Summary
print_header "Installation Complete! 🎉"

PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

echo -e "${GREEN}Your backend is now running!${NC}"
echo ""
echo "Access your application:"
echo "  • API: http://$PUBLIC_IP"
echo "  • Health: http://$PUBLIC_IP/actuator/health"
echo "  • API Docs: http://$PUBLIC_IP/swagger-ui.html"
echo ""
echo "Important files:"
echo "  • Application: $APP_DIR/ssc-exam-backend"
echo "  • Environment: $APP_DIR/ssc-exam-backend/.env"
echo "  • Service: /etc/systemd/system/ssc-exam-backend.service"
echo "  • Nginx: /etc/nginx/sites-available/ssc-exam-backend"
echo "  • Backups: /opt/backups/backup-db.sh"
echo ""
echo "Useful commands:"
echo "  • View logs: sudo journalctl -u ssc-exam-backend -f"
echo "  • Restart app: sudo systemctl restart ssc-exam-backend"
echo "  • Status: sudo systemctl status ssc-exam-backend"
echo "  • Rebuild & deploy: cd $APP_DIR/ssc-exam-backend && mvn clean package -DskipTests && sudo systemctl restart ssc-exam-backend"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Update your EC2 security group to allow HTTP (80) and HTTPS (443)"
echo "  2. Point your domain to this IP: $PUBLIC_IP"
echo "  3. Setup SSL with: sudo certbot --nginx"
echo "  4. Edit .env to add AWS S3, Razorpay, and Email configs"
echo "  5. Setup cron for backups: (crontab -e) 0 2 * * * /opt/backups/backup-db.sh"
echo ""
print_success "Setup completed successfully!"
