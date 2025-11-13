# Deployment Guide
## AI Shadow-Self Coach — Production Deployment

Complete guide for deploying the Shadow Coach application to production.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Backend Deployment](#backend-deployment)
6. [Mobile App Deployment](#mobile-app-deployment)
7. [Post-Deployment](#post-deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

### Required Services

- **Hosting Provider** (AWS, GCP, Azure, DigitalOcean, etc.)
- **PostgreSQL Database** (managed or self-hosted)
- **Docker Registry** (Docker Hub, AWS ECR, GCR, etc.)
- **Domain Name** (for production API)
- **SSL Certificate** (Let's Encrypt, AWS ACM, etc.)

### Required Tools

- Docker & Docker Compose
- Git
- SSH access to servers
- Domain DNS access

### Required Credentials

- Database credentials
- Docker registry credentials
- Server SSH keys
- SSL certificate
- OpenAI API key
- JWT secret key

---

## ✅ Pre-Deployment Checklist

### Code & Configuration

- [ ] All code reviewed and merged
- [ ] Tests passing in CI
- [ ] Environment variables documented
- [ ] Secrets management configured
- [ ] Database migrations tested
- [ ] API documentation updated
- [ ] Version numbers updated

### Security

- [ ] Strong JWT secret generated
- [ ] Database password is strong
- [ ] API keys secured
- [ ] SSL/TLS configured
- [ ] Firewall rules configured
- [ ] Rate limiting enabled
- [ ] CORS configured correctly

### Infrastructure

- [ ] Servers provisioned
- [ ] Database created
- [ ] Docker registry access
- [ ] DNS configured
- [ ] SSL certificate obtained
- [ ] Monitoring setup
- [ ] Backup system configured

---

## 🔧 Environment Setup

### Production Environment Variables

Create `.env.production` file:

```env
# Server
NODE_ENV=production
PORT=3000
API_BASE_URL=https://api.shadowcoach.app

# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=shadow_coach_prod
DB_USER=shadow_coach_user
DB_PASSWORD=strong-password-here

# JWT
JWT_SECRET=very-strong-secret-key-here
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=your-openai-key

# Crisis Resources
CRISIS_HOTLINE_US=988

# Vector Store (Optional)
ENABLE_VECTOR_STORE=true
VECTOR_STORE_PROVIDER=pinecone
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_NAME=shadow-coach-sessions

# WebSocket
ENABLE_WEBSOCKET=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Monitoring (Optional)
SENTRY_DSN=your-sentry-dsn
```

### Secrets Management

**Recommended:**
- AWS Secrets Manager
- HashiCorp Vault
- Kubernetes Secrets
- Docker Secrets
- Environment variables (secure server)

**Never:**
- Commit secrets to Git
- Store in plain text files
- Share via insecure channels

---

## 🗄️ Database Setup

### 1. Create Production Database

```bash
# Using managed PostgreSQL
# Create via provider dashboard or CLI

# Or self-hosted
createdb shadow_coach_prod
```

### 2. Run Migrations

```bash
# Using Docker
docker-compose run --rm api npm run migrate

# Or directly
cd backend
npm run migrate
```

### 3. Verify Database

```bash
# Check tables
psql -h your-db-host -U shadow_coach_user -d shadow_coach_prod -c "\dt"

# Check connection
psql -h your-db-host -U shadow_coach_user -d shadow_coach_prod -c "SELECT version();"
```

### 4. Set Up Backups

```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h your-db-host -U shadow_coach_user shadow_coach_prod > backup_$DATE.sql

# Schedule with cron
# 0 2 * * * /path/to/backup-script.sh
```

---

## 🚀 Backend Deployment

### Option 1: Docker Compose (Recommended for Small Scale)

**1. Clone Repository**
```bash
git clone <repository-url>
cd ai/backend
```

**2. Configure Environment**
```bash
cp .env.example .env.production
# Edit .env.production with production values
```

**3. Build and Start**
```bash
docker-compose -f docker-compose.yml up -d
```

**4. Run Migrations**
```bash
docker-compose exec api npm run migrate
```

**5. Verify Deployment**
```bash
curl https://api.shadowcoach.app/health
```

### Option 2: Kubernetes

**1. Create Deployment**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: shadow-coach-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: shadow-coach-api
  template:
    metadata:
      labels:
        app: shadow-coach-api
    spec:
      containers:
      - name: api
        image: your-registry/shadow-coach-api:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: host
        # ... other env vars
```

**2. Create Service**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: shadow-coach-api
spec:
  selector:
    app: shadow-coach-api
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

**3. Deploy**
```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

### Option 3: AWS ECS / Fargate

**1. Build and Push Image**
```bash
docker build -t shadow-coach-api .
docker tag shadow-coach-api:latest your-ecr-repo/shadow-coach-api:latest
docker push your-ecr-repo/shadow-coach-api:latest
```

**2. Create ECS Task Definition**
```json
{
  "family": "shadow-coach-api",
  "containerDefinitions": [{
    "name": "api",
    "image": "your-ecr-repo/shadow-coach-api:latest",
    "portMappings": [{
      "containerPort": 3000
    }],
    "environment": [
      {"name": "NODE_ENV", "value": "production"}
    ]
  }]
}
```

**3. Create Service**
- Use AWS Console or CLI
- Configure load balancer
- Set up auto-scaling

### Option 4: Traditional Server

**1. Install Dependencies**
```bash
# On server
sudo apt update
sudo apt install nodejs npm postgresql docker docker-compose
```

**2. Clone and Setup**
```bash
git clone <repository-url>
cd ai/backend
npm install --production
```

**3. Configure**
```bash
cp .env.example .env
# Edit .env with production values
```

**4. Start with PM2**
```bash
npm install -g pm2
pm2 start server.js --name shadow-coach-api
pm2 save
pm2 startup
```

---

## 📱 Mobile App Deployment

### iOS (App Store)

**1. Build Configuration**
```bash
cd mobile/ios
# Update version in Info.plist
# Update bundle identifier
```

**2. Build Archive**
```bash
# In Xcode
Product → Archive
```

**3. Upload to App Store**
- Use Xcode Organizer
- Or use `altool` command line
- Submit for review

**4. App Store Connect**
- Complete app information
- Add screenshots
- Set pricing
- Submit for review

### Android (Google Play)

**1. Build Configuration**
```bash
cd mobile/android
# Update version in build.gradle
# Update package name
```

**2. Generate Signed APK**
```bash
cd android
./gradlew assembleRelease
# Or use Android Studio: Build → Generate Signed Bundle/APK
```

**3. Upload to Play Console**
- Create app in Play Console
- Upload APK/AAB
- Complete store listing
- Submit for review

### Environment Configuration

**Update API URL:**
```javascript
// mobile/src/services/api.js
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api/v1'
  : 'https://api.shadowcoach.app/api/v1';
```

---

## ✅ Post-Deployment

### 1. Verify Deployment

**Health Checks:**
```bash
# Basic health
curl https://api.shadowcoach.app/health

# Detailed health
curl https://api.shadowcoach.app/health/detailed
```

**API Endpoints:**
```bash
# Register user
curl -X POST https://api.shadowcoach.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Health check
curl https://api.shadowcoach.app/health
```

### 2. Test Critical Paths

- [ ] User registration
- [ ] User login
- [ ] Session creation
- [ ] Message sending
- [ ] Journal access
- [ ] Analytics
- [ ] Export functionality

### 3. Monitor Logs

```bash
# Docker
docker-compose logs -f api

# Kubernetes
kubectl logs -f deployment/shadow-coach-api

# PM2
pm2 logs shadow-coach-api
```

### 4. Set Up Monitoring

**Sentry:**
- Configure DSN in environment
- Test error reporting
- Set up alerts

**Application Monitoring:**
- Set up uptime monitoring
- Configure alerting
- Monitor performance metrics

---

## 📊 Monitoring & Maintenance

### Health Monitoring

**Endpoints:**
- `/health` - Basic health check
- `/health/detailed` - Detailed system status

**Monitoring Tools:**
- Uptime Robot
- Pingdom
- Datadog
- New Relic

### Log Management

**Log Locations:**
- Docker: `docker-compose logs`
- Files: `logs/app.log`
- Cloud: CloudWatch, Stackdriver, etc.

**Log Rotation:**
```bash
# Configure logrotate
/path/to/logs/*.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
}
```

### Database Maintenance

**Regular Tasks:**
- [ ] Daily backups
- [ ] Weekly vacuum
- [ ] Monthly analyze
- [ ] Monitor disk space
- [ ] Check slow queries

**Backup Script:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME | gzip > backup_$DATE.sql.gz
# Upload to S3 or backup storage
aws s3 cp backup_$DATE.sql.gz s3://your-backup-bucket/
```

### Updates & Maintenance

**Deployment Process:**
1. Test in staging
2. Create release tag
3. Build new Docker image
4. Deploy to production
5. Run migrations
6. Verify deployment
7. Monitor for issues

**Rollback Plan:**
```bash
# Rollback to previous version
docker-compose pull shadow-coach-api:previous-version
docker-compose up -d
```

---

## 🐛 Troubleshooting

### Common Issues

**API Not Responding:**
```bash
# Check container status
docker-compose ps

# Check logs
docker-compose logs api

# Restart service
docker-compose restart api
```

**Database Connection Issues:**
```bash
# Test connection
psql -h $DB_HOST -U $DB_USER -d $DB_NAME

# Check database logs
docker-compose logs postgres

# Verify environment variables
docker-compose exec api env | grep DB_
```

**High Memory Usage:**
```bash
# Check resource usage
docker stats

# Restart container
docker-compose restart api

# Scale down if needed
docker-compose up -d --scale api=1
```

**SSL Certificate Issues:**
```bash
# Check certificate
openssl s_client -connect api.shadowcoach.app:443

# Renew certificate (Let's Encrypt)
certbot renew
```

### Emergency Procedures

**Service Down:**
1. Check health endpoint
2. Review logs
3. Check database connectivity
4. Restart services
5. Rollback if needed

**Data Loss:**
1. Stop writes immediately
2. Restore from backup
3. Verify data integrity
4. Resume service
5. Investigate root cause

**Security Incident:**
1. Isolate affected systems
2. Preserve logs
3. Assess damage
4. Notify team
5. Implement fixes
6. Monitor closely

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] Code reviewed and tested
- [ ] Environment variables configured
- [ ] Secrets secured
- [ ] Database migrations tested
- [ ] SSL certificate obtained
- [ ] DNS configured
- [ ] Monitoring setup

### Deployment
- [ ] Database created and migrated
- [ ] Docker image built and pushed
- [ ] Services deployed
- [ ] Health checks passing
- [ ] API endpoints tested
- [ ] Mobile apps built and submitted

### Post-Deployment
- [ ] All endpoints verified
- [ ] Monitoring active
- [ ] Logs accessible
- [ ] Backups configured
- [ ] Team notified
- [ ] Documentation updated

---

## 🎯 Next Steps

1. **Set Up Staging Environment** - Test deployments
2. **Configure Monitoring** - Sentry, uptime monitoring
3. **Set Up Backups** - Automated database backups
4. **Load Testing** - Test under load
5. **Security Audit** - Review security measures
6. **Documentation** - Update deployment docs
7. **Team Training** - Train team on deployment process

---

## 📚 Additional Resources

- **Docker Guide:** `backend/DOCKER_README.md`
- **CI/CD Guide:** `CI_CD_README.md`
- **API Documentation:** http://api.shadowcoach.app/api-docs
- **Developer Guide:** `DEVELOPER_ONBOARDING.md`

---

**Deployment guide is ready!** 🚀

For questions or issues, contact the DevOps team or refer to troubleshooting section.

