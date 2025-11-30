# 🚀 Deployment Guide - TPT Bus Booking System

Hướng dẫn deploy ứng dụng lên production với Docker.

## 📋 Yêu Cầu Production Server

- **OS:** Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **RAM:** 4GB minimum (8GB recommended)
- **Storage:** 20GB minimum
- **Docker:** 20.10+
- **Docker Compose:** 2.0+
- **Domain:** Có domain hoặc IP public

## 🔧 Pre-deployment Setup

### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker --version
docker-compose --version
```

### 3. Setup Firewall

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

## 📦 Deploy Steps

### 1. Clone Repository

```bash
cd /opt
sudo git clone <your-repo-url> bus-booking
cd bus-booking
sudo chown -R $USER:$USER .
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with production values
nano .env
```

**Production .env:**

```env
# Database - USE STRONG PASSWORDS!
MYSQL_ROOT_PASSWORD=<strong-random-password>
MYSQL_DATABASE=bus_booking
MYSQL_USER=busbooking_user
MYSQL_PASSWORD=<strong-random-password>

# Backend
SPRING_PROFILES_ACTIVE=docker
JWT_SECRET=<generate-256-bit-random-string>

# Email (Gmail)
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=<gmail-app-password>

# VNPay Production
VNPAY_TMN_CODE=<production-code>
VNPAY_HASH_SECRET=<production-secret>
VNPAY_URL=https://vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=https://yourdomain.com/payment/result

# MoMo Production
MOMO_PARTNER_CODE=<production-code>
MOMO_ACCESS_KEY=<production-key>
MOMO_SECRET_KEY=<production-secret>
MOMO_ENDPOINT=https://payment.momo.vn/v2/gateway/api/create
MOMO_RETURN_URL=https://yourdomain.com/payment/result
MOMO_NOTIFY_URL=https://yourdomain.com/api/payment/momo/callback

# Frontend
VITE_API_BASE_URL=https://yourdomain.com/api

# Ports
FRONTEND_PORT=80
BACKEND_PORT=8080
MYSQL_PORT=3306
```

### 3. Update docker-compose.yml for Production

Edit `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: bus-booking-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - bus-booking-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: bus-booking-backend
    restart: always
    environment:
      - SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE}
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/${MYSQL_DATABASE}
      - SPRING_DATASOURCE_USERNAME=${MYSQL_USER}
      - SPRING_DATASOURCE_PASSWORD=${MYSQL_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - MAIL_USERNAME=${MAIL_USERNAME}
      - MAIL_PASSWORD=${MAIL_PASSWORD}
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - bus-booking-network

  frontend:
    build:
      context: ./frontend-react
      dockerfile: Dockerfile
      args:
        - VITE_API_BASE_URL=${VITE_API_BASE_URL}
    container_name: bus-booking-frontend
    restart: always
    ports:
      - "${FRONTEND_PORT}:80"
    depends_on:
      - backend
    networks:
      - bus-booking-network

networks:
  bus-booking-network:
    driver: bridge

volumes:
  mysql_data:
```

### 4. Build và Start

```bash
# Build images
docker-compose build --no-cache

# Start containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 5. Import Database

```bash
# Wait for MySQL to be ready (about 30 seconds)
sleep 30

# Import schema
docker exec -i bus-booking-mysql mysql -uroot -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} < bus_booking.sql

# Verify
docker exec -it bus-booking-mysql mysql -uroot -p${MYSQL_ROOT_PASSWORD} -e "USE ${MYSQL_DATABASE}; SHOW TABLES;"
```

## 🌐 Setup Nginx Reverse Proxy (Optional)

Nếu muốn dùng HTTPS và domain name:

### 1. Install Nginx

```bash
sudo apt install nginx -y
```

### 2. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/bus-booking
```

**Content:**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/bus-booking /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (already setup by certbot)
sudo certbot renew --dry-run
```

## 📊 Monitoring

### Check Container Status

```bash
docker-compose ps
```

### View Logs

```bash
# All containers
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### Check Resource Usage

```bash
docker stats
```

## 🔄 Updates & Maintenance

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Backup Database

```bash
# Create backup directory
mkdir -p /opt/backups

# Backup
docker exec bus-booking-mysql mysqldump -uroot -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} > /opt/backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Auto backup (cron)
echo "0 2 * * * docker exec bus-booking-mysql mysqldump -uroot -p\${MYSQL_ROOT_PASSWORD} \${MYSQL_DATABASE} > /opt/backups/backup_\$(date +\\%Y\\%m\\%d_\\%H\\%M\\%S).sql" | crontab -
```

### Restore Database

```bash
docker exec -i bus-booking-mysql mysql -uroot -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} < /opt/backups/backup_YYYYMMDD_HHMMSS.sql
```

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs

# Remove and recreate
docker-compose down
docker-compose up -d
```

### Database Connection Issues

```bash
# Check MySQL is running
docker-compose ps mysql

# Check MySQL logs
docker-compose logs mysql

# Access MySQL shell
docker exec -it bus-booking-mysql mysql -uroot -p${MYSQL_ROOT_PASSWORD}
```

### Out of Memory

```bash
# Check memory
free -h

# Increase swap
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 📈 Performance Optimization

### 1. Enable MySQL Query Cache

Edit MySQL config in docker-compose.yml:

```yaml
mysql:
  command: --query-cache-size=64M --query-cache-type=1
```

### 2. Increase Java Heap Size

Edit backend in docker-compose.yml:

```yaml
backend:
  environment:
    - JAVA_OPTS=-Xms512m -Xmx2g
```

### 3. Enable Nginx Caching

Add to Nginx config:

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 7d;
    add_header Cache-Control "public, immutable";
}
```

## 🔒 Security Checklist

- [ ] Use strong passwords for database
- [ ] Use HTTPS (SSL certificate)
- [ ] Enable firewall
- [ ] Disable SSH password login (use keys only)
- [ ] Regular backups
- [ ] Keep Docker images updated
- [ ] Monitor logs for suspicious activity
- [ ] Use environment variables (never hardcode secrets)

## 📞 Support

Nếu gặp vấn đề khi deploy, vui lòng:
1. Check logs: `docker-compose logs -f`
2. Verify .env configuration
3. Open GitHub issue with detailed error message

---

**Happy Deploying! 🚀**

