# SPARKTherapy Production Deployment Guide

## 🚀 Production Ready Checklist

This guide covers everything needed to deploy SPARKTherapy in a production environment.

## 🔧 Pre-Deployment Requirements

### System Requirements
- **Node.js**: v18+ (LTS recommended)
- **MongoDB**: v5.0+ (Atlas or self-hosted)
- **Operating System**: Ubuntu 20.04+/CentOS 8+/Windows Server 2019+
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 20GB SSD storage
- **CPU**: Minimum 2 cores, Recommended 4 cores

### Network Requirements
- Domain name with SSL certificate
- Firewall rules for ports 80, 443, and application port
- Reverse proxy (NGINX/Apache) configuration

## 📁 Directory Structure Setup

```bash
# Create application directory
sudo mkdir -p /var/www/sparktherapy/{backend,frontend,logs,backups}
sudo chown -R $USER:$USER /var/www/sparktherapy

# Navigate to project directory
cd /var/www/sparktherapy
```

## ⚙️ Environment Configuration

### Backend Configuration (.env.production)
```bash
# Application Settings
NODE_ENV=production
PORT=5000
API_VERSION=v1

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spark_therapy_prod
MONGODB_OPTIONS_RETRY_WRITES=true
MONGODB_OPTIONS_W=majority
DB_CONNECTION_POOL_SIZE=10
DB_MAX_RETRIES=3

# Security Configuration
JWT_SECRET=your_production_jwt_secret_here_very_long_and_complex
JWT_EXPIRE=24h
JWT_REFRESH_SECRET=your_production_refresh_secret_here_also_very_long
JWT_REFRESH_EXPIRE=7d
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
HELMET_ENABLED=true

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json
LOG_TRANSPORT=file,console

# Performance Configuration
ENABLE_COMPRESSION=true
REQUEST_TIMEOUT_MS=30000

# Monitoring
ENABLE_HEALTH_CHECKS=true
ENABLE_METRICS=true
METRICS_PATH=/metrics

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30
```

### Frontend Configuration (.env.production)
```bash
# API Configuration
REACT_APP_API_BASE_URL=https://api.yourdomain.com/api
REACT_APP_ENVIRONMENT=production

# Feature Flags
REACT_APP_ENABLE_LOGGING=false
REACT_APP_ENABLE_DEBUG=false
```

## 🔐 Security Hardening

### SSL/TLS Certificate
```bash
# Using Let's Encrypt (Certbot)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### NGINX Configuration
```nginx
# /etc/nginx/sites-available/sparktherapy
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Client-side caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API reverse proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Static files
    location / {
        root /var/www/sparktherapy/frontend/build;
        try_files $uri $uri/ /index.html;
        expires 1h;
    }
}
```

### Process Manager (PM2)
```bash
# Install PM2 globally
npm install -g pm2

# PM2 ecosystem configuration
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'sparktherapy-backend',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 10000
  }]
};
```

## 🚀 Deployment Process

### 1. Backend Deployment
```bash
# Clone repository
git clone <repository-url> /var/www/sparktherapy
cd /var/www/sparktherapy/backend

# Install dependencies
npm ci --production

# Create required directories
mkdir -p logs backups

# Set environment variables
cp .env.example .env.production
# Edit .env.production with production values

# Run database optimization
node utils/dbOptimizer.js

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 2. Frontend Deployment
```bash
# Build frontend
cd /var/www/sparktherapy
npm ci
npm run build

# Copy build to deployment directory
cp -r web-build/* /var/www/sparktherapy/frontend/build/

# Configure environment
echo "REACT_APP_API_BASE_URL=https://api.yourdomain.com/api" > /var/www/sparktherapy/.env.production
```

### 3. NGINX Setup
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/sparktherapy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Enable auto-start
sudo systemctl enable nginx
```

## 🛡️ Security Configuration

### Firewall Setup (UFW)
```bash
# Install UFW
sudo apt install ufw

# Configure firewall rules
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Fail2Ban Configuration
```bash
# Install Fail2Ban
sudo apt install fail2ban

# Create jail configuration
sudo nano /etc/fail2ban/jail.local

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
port = http,https
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600
```

## 📊 Monitoring and Maintenance

### Health Checks
```bash
# Automated health check script
#!/bin/bash
HEALTH_ENDPOINT="https://api.yourdomain.com/api/health"

response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_ENDPOINT)

if [ $response -ne 200 ]; then
    echo "Health check failed with status $response" | mail -s "SPARKTherapy Health Alert" admin@yourdomain.com
    # Restart application
    pm2 restart sparktherapy-backend
fi
```

### Log Rotation
```bash
# /etc/logrotate.d/sparktherapy
/var/www/sparktherapy/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Automated Backups
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/sparktherapy"
mkdir -p $BACKUP_DIR

# Database backup
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/db_$DATE"

# Application backup
tar -czf "$BACKUP_DIR/app_$DATE.tar.gz" /var/www/sparktherapy

# Cleanup old backups (keep 7 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "db_*" -mtime +7 -delete
```

## 🔍 Performance Tuning

### MongoDB Optimization
```javascript
// Create compound indexes for common queries
db.children.createIndex({ "parentId": 1, "isActive": 1 })
db.programs.createIndex({ "childId": 1, "isArchived": 1 })
db.sessions.createIndex({ "therapistId": 1, "date": -1 })
```

### Node.js Tuning
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=2048"

# Optimize garbage collection
export NODE_OPTIONS="--optimize_for_size --max_old_space_size=2048 --gc_interval=100"
```

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Failures**
   ```bash
   # Check MongoDB connectivity
   mongo $MONGODB_URI --eval "db.adminCommand('ping')"
   
   # Check connection pool
   pm2 logs sparktherapy-backend --lines 100 | grep "MongoDB"
   ```

2. **Memory Issues**
   ```bash
   # Monitor memory usage
   pm2 monit
   
   # Check for memory leaks
   pm2 logs sparktherapy-backend | grep -i "memory\|heap"
   ```

3. **Performance Issues**
   ```bash
   # Check response times
   curl -w "@curl-format.txt" -o /dev/null -s "https://api.yourdomain.com/api/health"
   
   # Monitor system resources
   htop
   iostat -x 1
   ```

### Recovery Procedures

1. **Database Restore**
   ```bash
   # Restore from backup
   mongorestore --uri="$MONGODB_URI" --drop /path/to/backup/
   ```

2. **Application Rollback**
   ```bash
   # Revert to previous version
   git checkout <previous-commit-hash>
   pm2 restart sparktherapy-backend
   ```

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancer (NGINX Plus, AWS ELB)
- Implement sticky sessions for WebSocket connections
- Use Redis for session storage

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database queries and indexes
- Implement caching strategies

### Database Sharding
- Consider MongoDB sharding for large datasets
- Implement read replicas for better performance
- Use aggregation pipelines for complex queries

## 📋 Post-Deployment Checklist

- [ ] SSL certificate is valid and auto-renewing
- [ ] All environment variables are properly configured
- [ ] Database indexes are created and optimized
- [ ] Backup system is running and tested
- [ ] Monitoring alerts are configured
- [ ] Health checks are passing consistently
- [ ] Performance benchmarks meet requirements
- [ ] Security scans show no critical vulnerabilities
- [ ] Documentation is updated and accessible
- [ ] Team members are trained on deployment procedures

This production deployment guide ensures SPARKTherapy is deployed securely, scalably, and maintainably in a production environment.