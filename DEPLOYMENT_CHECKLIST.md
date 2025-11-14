# Deployment Checklist

Complete checklist for deploying AI Shadow-Self Coach to production.

## Pre-Deployment

### Environment Setup

- [ ] Set up production database (PostgreSQL)
- [ ] Configure environment variables
  - [ ] `DATABASE_URL`
  - [ ] `JWT_SECRET` (strong, random)
  - [ ] `OPENAI_API_KEY`
  - [ ] `SENTRY_DSN` (optional but recommended)
  - [ ] `NODE_ENV=production`
  - [ ] `PORT` (default: 3000)
- [ ] Set up SSL/TLS certificates
- [ ] Configure domain and DNS

### Database

- [ ] Run migrations: `npm run migrate`
- [ ] Verify all tables created
- [ ] Create admin user: `npm run admin:create`
- [ ] Set up database backups
- [ ] Test database connection

### ML Models (Optional but Recommended)

- [ ] Train safety classifier: `python ml/train_safety_classifier.py`
- [ ] Train intent classifier: `python ml/train_intent_classifier.py`
- [ ] Export to ONNX: `python ml/export_to_onnx.py`
- [ ] Install ONNX Runtime: `npm install onnxruntime-node`
- [ ] Update model service with ONNX inference
- [ ] Set `USE_ML_SAFETY_CLASSIFIER=true`
- [ ] Test ML model integration

### Security

- [ ] Review and update `.env` file (never commit!)
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable HTTPS only
- [ ] Review security headers (Helmet)
- [ ] Set up monitoring (Sentry)

### Testing

- [ ] Run all tests: `npm test`
- [ ] Run integration tests: `npm run test:integration`
- [ ] Test API endpoints manually
- [ ] Test authentication flow
- [ ] Test safety features
- [ ] Test error handling

## Deployment

### Server Setup

- [ ] Install Node.js 18+ on server
- [ ] Install PostgreSQL 12+ on server
- [ ] Set up process manager (PM2, systemd, etc.)
- [ ] Configure reverse proxy (Nginx, Apache)
- [ ] Set up log rotation
- [ ] Configure auto-restart on failure

### Application Deployment

- [ ] Clone repository
- [ ] Install dependencies: `npm install --production`
- [ ] Copy `.env` file to server
- [ ] Run migrations: `npm run migrate`
- [ ] Start application: `npm start` or `pm2 start`
- [ ] Verify application is running
- [ ] Test health endpoint: `/health`

### Monitoring

- [ ] Set up Sentry error tracking
- [ ] Configure log aggregation
- [ ] Set up uptime monitoring
- [ ] Configure alerting
- [ ] Set up performance monitoring

## Post-Deployment

### Verification

- [ ] Test all API endpoints
- [ ] Verify database connections
- [ ] Test authentication
- [ ] Test safety features
- [ ] Check logs for errors
- [ ] Verify ML models (if deployed)
- [ ] Test beta feedback system

### Beta Testing

- [ ] Enroll initial beta testers
- [ ] Set up feedback collection
- [ ] Monitor beta feedback
- [ ] Respond to critical issues

### Documentation

- [ ] Update API documentation
- [ ] Document deployment process
- [ ] Create runbook for common issues
- [ ] Document rollback procedure

## Rollback Plan

If issues occur:

1. [ ] Stop current deployment
2. [ ] Restore previous version
3. [ ] Restore database backup if needed
4. [ ] Verify rollback successful
5. [ ] Investigate issues
6. [ ] Fix and redeploy

## Maintenance

### Regular Tasks

- [ ] Monitor error logs daily
- [ ] Review beta feedback weekly
- [ ] Check database backups weekly
- [ ] Update dependencies monthly
- [ ] Review security patches monthly
- [ ] Monitor performance metrics

### Database Maintenance

- [ ] Regular backups (automated)
- [ ] Monitor database size
- [ ] Optimize queries as needed
- [ ] Review indexes

### ML Model Updates

- [ ] Retrain models with new data (quarterly)
- [ ] Evaluate model performance
- [ ] Deploy updated models
- [ ] A/B test new models

## Emergency Contacts

- **Technical Lead**: [Your Contact]
- **Database Admin**: [Contact]
- **DevOps**: [Contact]
- **Security**: [Contact]

## Useful Commands

```bash
# Health check
npm run health:full

# Database backup
npm run backup

# View logs
pm2 logs shadow-coach

# Restart application
pm2 restart shadow-coach

# Check status
pm2 status

# Database migrations
npm run migrate
npm run migrate:status
```

---

**Last Updated:** November 2024

