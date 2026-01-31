# SPARKTherapy Operations Manual

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Deployment](#deployment)
4. [Monitoring](#monitoring)
5. [Maintenance](#maintenance)
6. [Troubleshooting](#troubleshooting)
7. [Security](#security)
8. [Backup & Recovery](#backup--recovery)
9. [Scaling](#scaling)
10. [API Documentation](#api-documentation)

## 🏗️ System Overview

SPARKTherapy is a comprehensive Applied Behavior Analysis (ABA) therapy management platform designed for seamless coordination between parents, therapists, and administrators.

### Key Features
- **Multi-role Access**: Admin, Therapist, and Parent interfaces
- **Real-time Communication**: Instant notifications and messaging
- **Progress Tracking**: Detailed program and target tracking
- **Scheduling**: Automated session scheduling and management
- **Financial Management**: Invoice and payment processing
- **Reporting**: Comprehensive analytics and reporting

### Technology Stack
- **Frontend**: React Native with Expo
- **Backend**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with refresh tokens
- **Infrastructure**: Docker containers, NGINX reverse proxy

## 🏗️ Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Mobile/Web    │────│   API Gateway    │────│   Application    │
│   Clients       │    │   (NGINX)        │    │   Server         │
└─────────────────┘    └──────────────────┘    └──────────────────┘
                                │                         │
                        ┌───────┴────────┐        ┌───────┴────────┐
                        │                │        │                │
                ┌──────────────┐  ┌─────────────┐ │ ┌──────────────┐
                │   MongoDB    │  │   Redis     │ │ │   Logger     │
                │   (Primary)  │  │   (Cache)   │ │ │   (Winston)  │
                └──────────────┘  └─────────────┘ │ └──────────────┘
                                                  │
                                          ┌──────────────┐
                                          │   File       │
                                          │   Storage    │
                                          └──────────────┘
```

### Component Responsibilities

**Frontend Layer**
- User interface and experience
- State management and navigation
- API communication and error handling
- Offline capability and caching

**API Layer**
- Request routing and authentication
- Rate limiting and security
- Request/response validation
- Load balancing and failover

**Application Layer**
- Business logic implementation
- Data processing and transformation
- Third-party service integration
- Event handling and notifications

**Data Layer**
- Primary database operations
- Caching strategies
- Data backup and recovery
- Performance optimization

## 🚀 Deployment

### Prerequisites
- Ubuntu 20.04+ or CentOS 8+
- Node.js 18+ (LTS)
- MongoDB 5.0+
- NGINX 1.18+
- PM2 process manager
- SSL certificate (Let's Encrypt)

### Deployment Steps

1. **Environment Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt update
sudo apt install -y mongodb-org

# Install NGINX and PM2
sudo apt install nginx -y
sudo npm install -g pm2
```

2. **Application Deployment**
```bash
# Create application directory
sudo mkdir -p /var/www/sparktherapy/{backend,frontend,logs,backups}
sudo chown -R $USER:$USER /var/www/sparktherapy

# Clone repository
cd /var/www/sparktherapy
git clone <repository-url> .

# Backend setup
cd backend
npm ci --production
cp .env.example .env.production
# Configure environment variables

# Frontend setup
cd ..
npm ci
npm run build
```

3. **Service Configuration**
```bash
# PM2 ecosystem configuration
cat > ecosystem.config.js << EOF
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
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

4. **NGINX Configuration**
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
    
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
    
    location / {
        root /var/www/sparktherapy/web-build;
        try_files $uri $uri/ /index.html;
        expires 1h;
    }
}
```

## 🔍 Monitoring

### Health Checks
```bash
# Automated health monitoring script
#!/bin/bash
HEALTH_ENDPOINT="https://api.yourdomain.com/api/health"
SLACK_WEBHOOK="your-slack-webhook-url"

check_health() {
    response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_ENDPOINT)
    
    if [ $response -ne 200 ]; then
        # Send alert
        curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚨 SPARKTherapy Health Check Failed - Status: $response\"}" \
        $SLACK_WEBHOOK
        
        # Restart application
        pm2 restart sparktherapy-backend
    fi
}

# Run every 5 minutes
*/5 * * * * /path/to/health-check.sh
```

### Performance Monitoring
```bash
# System monitoring with Prometheus + Grafana
# Metrics to monitor:
# - API response times
# - Database query performance
# - Memory and CPU usage
# - Error rates and patterns
# - User session counts
# - Database connection pools

# Sample Prometheus configuration
scrape_configs:
  - job_name: 'sparktherapy'
    static_configs:
      - targets: ['localhost:5000']
    metrics_path: '/metrics'
```

### Log Analysis
```bash
# Centralized logging with ELK stack
# Key log sources:
# - Application logs (structured JSON)
# - NGINX access/error logs
# - Database slow query logs
# - System logs (auth, kernel, etc.)

# Log rotation configuration
/var/www/sparktherapy/logs/*.log {
    daily
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

## 🔧 Maintenance

### Routine Maintenance Tasks

**Daily**
- [ ] Check system health and alerts
- [ ] Review error logs and warnings
- [ ] Monitor disk space and cleanup if needed
- [ ] Verify backup completion

**Weekly**
- [ ] Review performance metrics
- [ ] Update security patches
- [ ] Test backup restoration
- [ ] Review user feedback and issues

**Monthly**
- [ ] Database optimization and index review
- [ ] Security audit and penetration testing
- [ ] Update dependencies and libraries
- [ ] Review and optimize configurations

### Database Maintenance
```bash
# MongoDB maintenance script
#!/bin/bash
MONGO_URI="mongodb://localhost:27017/spark_therapy"

# Compact databases
mongosh $MONGO_URI --eval "db.runCommand({ compact: 'users' })"
mongosh $MONGO_URI --eval "db.runCommand({ compact: 'children' })"

# Rebuild indexes
mongosh $MONGO_URI --eval "db.users.reIndex()"
mongosh $MONGO_URI --eval "db.children.reIndex()"

# Analyze query performance
mongosh $MONGO_URI --eval "
    db.system.profile.find({ millis: { $gt: 100 } }).sort({ ts: -1 }).limit(10)
"
```

## 🆘 Troubleshooting

### Common Issues and Solutions

**1. Database Connection Issues**
```bash
# Symptoms: Database connection timeouts, authentication failures
# Solutions:
- Check MongoDB service status: systemctl status mongod
- Verify connection string in .env file
- Check firewall rules for MongoDB port (27017)
- Review MongoDB logs: /var/log/mongodb/mongod.log
```

**2. Performance Degradation**
```bash
# Symptoms: Slow API responses, high latency
# Solutions:
- Check system resources: htop, iotop
- Analyze database queries: mongostat, mongotop
- Review application logs for errors
- Scale horizontally or vertically based on metrics
```

**3. Authentication Problems**
```bash
# Symptoms: Login failures, token expiration issues
# Solutions:
- Verify JWT secret configuration
- Check token expiration settings
- Review user account statuses
- Clear browser/application cache
```

**4. Deployment Failures**
```bash
# Symptoms: Application won't start, build errors
# Solutions:
- Check PM2 logs: pm2 logs sparktherapy-backend
- Verify environment variables
- Ensure all dependencies are installed
- Check file permissions and ownership
```

### Emergency Procedures

**Immediate Actions (First 30 minutes)**
1. Assess impact and scope of issue
2. Check system health dashboards
3. Review recent deployments or changes
4. Engage relevant team members

**Short-term Resolution (2-4 hours)**
1. Implement temporary fixes if available
2. Communicate status to stakeholders
3. Document incident and actions taken
4. Begin root cause analysis

**Long-term Prevention**
1. Implement permanent fix
2. Update monitoring and alerting
3. Improve documentation and procedures
4. Conduct post-mortem analysis

## 🔐 Security

### Security Best Practices

**Access Control**
- Implement least privilege principle
- Regular access reviews and audits
- Multi-factor authentication for admin access
- Session management and timeout policies

**Data Protection**
- Encryption at rest and in transit
- Regular security scanning and penetration testing
- Data backup encryption
- Secure API key management

**Network Security**
- Firewall configuration and monitoring
- Intrusion detection systems
- Regular security patching
- Network segmentation

### Compliance Requirements
- HIPAA compliance for healthcare data
- GDPR compliance for European users
- SOC 2 Type II certification preparation
- Regular security assessments

## 💾 Backup & Recovery

### Backup Strategy

**Database Backups**
```bash
# Automated MongoDB backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/sparktherapy"
RETENTION_DAYS=30

# Create backup
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/db_$DATE"

# Compress backup
tar -czf "$BACKUP_DIR/db_$DATE.tar.gz" "$BACKUP_DIR/db_$DATE"
rm -rf "$BACKUP_DIR/db_$DATE"

# Cleanup old backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Verify backup integrity
tar -tzf "$BACKUP_DIR/db_$DATE.tar.gz" > /dev/null
```

**Application Backups**
```bash
# Full application backup
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/sparktherapy"

# Backup application code
tar -czf "$BACKUP_DIR/app_$DATE.tar.gz" \
    --exclude='node_modules' \
    --exclude='.git' \
    /var/www/sparktherapy

# Backup configuration files
tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" \
    /etc/nginx/sites-available/sparktherapy \
    /var/www/sparktherapy/backend/.env.production \
    /etc/systemd/system/sparktherapy.service
```

### Recovery Procedures

**Database Recovery**
```bash
# Restore from backup
#!/bin/bash
BACKUP_FILE=$1
MONGO_URI="mongodb://localhost:27017/spark_therapy"

# Stop application
pm2 stop sparktherapy-backend

# Drop existing database
mongosh $MONGO_URI --eval "db.dropDatabase()"

# Restore from backup
tar -xzf $BACKUP_FILE -C /tmp
mongorestore --uri="$MONGO_URI" --drop /tmp/dump/

# Start application
pm2 start sparktherapy-backend
```

**Full System Recovery**
```bash
# Complete system restore procedure
#!/bin/bash
BACKUP_DATE=$1

# Restore application
tar -xzf /var/backups/sparktherapy/app_$BACKUP_DATE.tar.gz -C /
chown -R www-data:www-data /var/www/sparktherapy

# Restore configuration
tar -xzf /var/backups/sparktherapy/config_$BACKUP_DATE.tar.gz -C /

# Restore database
./restore-database.sh /var/backups/sparktherapy/db_$BACKUP_DATE.tar.gz

# Restart services
systemctl restart nginx
pm2 restart sparktherapy-backend
```

## 📈 Scaling

### Horizontal Scaling
```bash
# Load balancer configuration (NGINX Plus)
upstream sparktherapy_backend {
    least_conn;
    server 10.0.1.10:5000 weight=3 max_fails=3 fail_timeout=30s;
    server 10.0.1.11:5000 weight=3 max_fails=3 fail_timeout=30s;
    server 10.0.1.12:5000 weight=3 max_fails=3 fail_timeout=30s;
    
    # Health checks
    zone backend 64k;
    state /var/lib/nginx/state/backend.state;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    location /api/ {
        proxy_pass http://sparktherapy_backend;
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;
        proxy_next_upstream_tries 3;
    }
}
```

### Vertical Scaling
```bash
# Resource allocation guidelines
# Small instance: 2 vCPU, 4GB RAM (up to 100 concurrent users)
# Medium instance: 4 vCPU, 8GB RAM (up to 500 concurrent users)
# Large instance: 8 vCPU, 16GB RAM (up to 2000 concurrent users)

# Auto-scaling configuration
resource "aws_autoscaling_group" "sparktherapy" {
  desired_capacity = 2
  max_size         = 10
  min_size         = 2
  
  launch_template {
    id      = aws_launch_template.sparktherapy.id
    version = "$Latest"
  }
  
  target_group_arns = [aws_lb_target_group.sparktherapy.arn]
  
  tag {
    key                 = "Name"
    value               = "sparktherapy-worker"
    propagate_at_launch = true
  }
}
```

### Database Scaling
```javascript
// MongoDB sharding configuration
sh.enableSharding("spark_therapy")

// Shard collections by common query patterns
sh.shardCollection("spark_therapy.users", { "_id": "hashed" })
sh.shardCollection("spark_therapy.children", { "parentId": 1 })
sh.shardCollection("spark_therapy.programs", { "childId": 1 })

// Add read replicas for better performance
rs.add("mongodb-replica-1.yourdomain.com")
rs.add("mongodb-replica-2.yourdomain.com")
```

## 📚 API Documentation

### Authentication Endpoints

**POST /api/auth/register**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "parent"
}
```

**POST /api/auth/login**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**GET /api/auth/profile**
*Requires authentication header*

### User Management

**GET /api/users**
*Admin only*
Returns all users in the system

**PUT /api/users/:id**
*Admin only*
Updates user information

**DELETE /api/users/:id**
*Admin only*
Deactivates user account

### Child Management

**POST /api/children**
Creates a new child profile

**GET /api/children**
Returns children accessible to current user

**GET /api/children/:id**
Returns specific child information

**PUT /api/children/:id**
Updates child information

**DELETE /api/children/:id**
Deletes (archives) child record

### Program Management

**POST /api/programs**
Creates a new therapy program

**GET /api/programs/child/:childId**
Returns programs for specific child

**PUT /api/programs/:id**
Updates program information

**DELETE /api/programs/:id**
Archives program

**PUT /api/programs/:id/targets/:targetId**
Updates specific target progress

---

This operations manual provides comprehensive guidance for deploying, maintaining, and scaling the SPARKTherapy platform in production environments. Regular updates to this document ensure operational excellence and system reliability.