# EC2 Deployment Guide for SSC Exam Backend

This guide will help you deploy the Spring Boot backend on an AWS EC2 instance.

## Prerequisites

1. AWS Account with EC2 access
2. Domain name (optional, but recommended)
3. SSH key pair for EC2 access

## Step 1: Launch EC2 Instance

### Recommended Instance Configuration:
- **Instance Type**: t3.medium or t3.large (for production)
- **AMI**: Ubuntu 22.04 LTS
- **Storage**: 20-30 GB SSD
- **Security Group Rules**:
  - SSH (22) - Your IP only
  - HTTP (80) - 0.0.0.0/0
  - HTTPS (443) - 0.0.0.0/0
  - Custom TCP (8080) - 0.0.0.0/0 (temporary, will be removed later)

### Launch Instance:
```bash
# From AWS Console:
1. Go to EC2 Dashboard
2. Click "Launch Instance"
3. Choose Ubuntu 22.04 LTS
4. Select instance type (t3.medium recommended)
5. Configure security group as above
6. Download your .pem key file
```

## Step 2: Connect to EC2 Instance

```bash
# Make key file readable only by you
chmod 400 your-key.pem

# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

## Step 3: Initial Server Setup

Run these commands on your EC2 instance:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y git curl wget unzip

# Install Java 17
sudo apt install -y openjdk-17-jdk openjdk-17-jre

# Verify Java installation
java -version
javac -version
```

## Step 4: Install and Configure PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE sscexam;
CREATE USER sscexam_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE sscexam TO sscexam_user;
\q
EOF

# Test connection
psql -U sscexam_user -d sscexam -h localhost
```

## Step 5: Install Maven

```bash
# Install Maven
sudo apt install -y maven

# Verify installation
mvn -version
```

## Step 6: Setup Application

```bash
# Create application directory
sudo mkdir -p /opt/ssc-exam-backend
sudo chown ubuntu:ubuntu /opt/ssc-exam-backend

# Clone your repository (or upload files)
cd /opt/ssc-exam-backend
git clone https://github.com/your-username/ssc-exam-platform.git .

# Or use SCP to copy files:
# From your local machine:
# scp -i your-key.pem -r ./ssc-exam-backend ubuntu@your-ec2-ip:/opt/ssc-exam-backend/
```

## Step 7: Configure Environment Variables

```bash
# Create .env file
sudo nano /opt/ssc-exam-backend/ssc-exam-backend/.env
```

Add the following (replace with your actual values):

```properties
DATABASE_URL=jdbc:postgresql://localhost:5432/sscexam
DATABASE_USERNAME=sscexam_user
DATABASE_PASSWORD=your_secure_password

JWT_SECRET=your-very-long-secret-key-at-least-256-bits-change-this-in-production-make-it-random

CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=ssc-exam-files

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@sscexam.com
EMAIL_VERIFICATION_URL=https://yourdomain.com/verify-email
EMAIL_RESET_PASSWORD_URL=https://yourdomain.com/reset-password

PORT=8080
```

## Step 8: Build the Application

```bash
# Navigate to backend directory
cd /opt/ssc-exam-backend/ssc-exam-backend

# Build with Maven (skip tests for faster build)
mvn clean package -DskipTests

# The JAR file will be in target/ directory
ls -lh target/*.jar
```

## Step 9: Create Systemd Service

```bash
# Create service file
sudo nano /etc/systemd/system/ssc-exam-backend.service
```

Add the following content (use the systemd service file provided separately):

```systemd
[Unit]
Description=SSC Exam Backend Service
After=postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/ssc-exam-backend/ssc-exam-backend
ExecStart=/usr/bin/java -jar -Xmx512m -Xms256m /opt/ssc-exam-backend/ssc-exam-backend/target/ssc-exam-backend-1.0.0.jar
EnvironmentFile=/opt/ssc-exam-backend/ssc-exam-backend/.env
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=ssc-exam-backend

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable ssc-exam-backend

# Start the service
sudo systemctl start ssc-exam-backend

# Check status
sudo systemctl status ssc-exam-backend

# View logs
sudo journalctl -u ssc-exam-backend -f
```

## Step 10: Install and Configure Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/ssc-exam-backend
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # API endpoints
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Increase body size for file uploads
    client_max_body_size 10M;
}
```

Enable the site:

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/ssc-exam-backend /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## Step 11: Setup SSL with Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow the prompts and choose to redirect HTTP to HTTPS

# Test auto-renewal
sudo certbot renew --dry-run
```

## Step 12: Configure Firewall

```bash
# Install UFW (if not already installed)
sudo apt install -y ufw

# Allow SSH
sudo ufw allow 22/tcp

# Allow Nginx
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Step 13: Update EC2 Security Group

Now that Nginx is handling traffic, update your EC2 security group:
1. Remove direct access to port 8080
2. Keep only SSH (22), HTTP (80), and HTTPS (443)

## Step 14: Application Management

### Check application status:
```bash
sudo systemctl status ssc-exam-backend
```

### View logs:
```bash
# Real-time logs
sudo journalctl -u ssc-exam-backend -f

# Last 100 lines
sudo journalctl -u ssc-exam-backend -n 100

# Logs from today
sudo journalctl -u ssc-exam-backend --since today
```

### Restart application:
```bash
sudo systemctl restart ssc-exam-backend
```

### Stop application:
```bash
sudo systemctl stop ssc-exam-backend
```

### Update application:
```bash
# Pull latest code
cd /opt/ssc-exam-backend
git pull

# Rebuild
cd ssc-exam-backend
mvn clean package -DskipTests

# Restart service
sudo systemctl restart ssc-exam-backend
```

## Step 15: Database Backups

Create a backup script:

```bash
# Create backup directory
sudo mkdir -p /opt/backups/postgres

# Create backup script
sudo nano /opt/backups/backup-db.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/postgres"
DB_NAME="sscexam"
DB_USER="sscexam_user"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/sscexam_$DATE.sql.gz"

# Create backup
pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "sscexam_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
```

Make it executable and schedule:

```bash
sudo chmod +x /opt/backups/backup-db.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e

# Add this line:
0 2 * * * /opt/backups/backup-db.sh >> /var/log/db-backup.log 2>&1
```

## Step 16: Monitoring (Optional but Recommended)

Install monitoring tools:

```bash
# Install htop for process monitoring
sudo apt install -y htop

# Install netdata for comprehensive monitoring
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# Access netdata at: http://your-ec2-ip:19999
```

## Testing Your Deployment

1. **Health Check**:
```bash
curl http://your-domain.com/actuator/health
```

2. **API Documentation**:
```
https://your-domain.com/swagger-ui.html
```

3. **Test API Endpoint**:
```bash
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## Troubleshooting

### Application won't start:
```bash
# Check logs
sudo journalctl -u ssc-exam-backend -n 100

# Check if port is in use
sudo netstat -tlnp | grep 8080

# Check Java process
ps aux | grep java
```

### Database connection issues:
```bash
# Test PostgreSQL connection
psql -U sscexam_user -d sscexam -h localhost

# Check PostgreSQL status
sudo systemctl status postgresql

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Nginx issues:
```bash
# Test Nginx configuration
sudo nginx -t

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Production Checklist

- [ ] Changed default passwords
- [ ] Set strong JWT secret
- [ ] Configured SSL/HTTPS
- [ ] Setup database backups
- [ ] Configured firewall
- [ ] Disabled SSH password authentication (key-only)
- [ ] Setup monitoring
- [ ] Configured log rotation
- [ ] Setup domain DNS
- [ ] Configured CORS properly
- [ ] Setup AWS S3 for file storage
- [ ] Configured email service
- [ ] Setup Razorpay for payments

## Performance Tuning

### Adjust JVM memory:
Edit `/etc/systemd/system/ssc-exam-backend.service`:

```
ExecStart=/usr/bin/java -jar -Xmx1024m -Xms512m /opt/ssc-exam-backend/ssc-exam-backend/target/ssc-exam-backend-1.0.0.jar
```

### PostgreSQL tuning:
```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
```

Adjust based on your instance:
```
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
work_mem = 16MB
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

## Support

For issues, check:
- Application logs: `sudo journalctl -u ssc-exam-backend -f`
- Nginx logs: `/var/log/nginx/error.log`
- PostgreSQL logs: `/var/log/postgresql/`

---

**Your backend should now be running on EC2!** 🚀
