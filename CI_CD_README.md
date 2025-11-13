# CI/CD Pipeline Guide
## Shadow Coach — Continuous Integration & Deployment

This guide explains the CI/CD pipeline setup for the Shadow Coach project.

---

## 🔄 Pipeline Overview

### CI Pipeline (Continuous Integration)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**
1. **Backend Tests** - Run test suite
2. **Backend Build** - Build Docker image
3. **Mobile Lint** - Lint mobile code
4. **Security Scan** - Check for vulnerabilities

### CD Pipeline (Continuous Deployment)

**Triggers:**
- Push to `main` branch → Deploy to staging
- Tag with `v*` → Deploy to production

**Jobs:**
1. **Build and Push** - Build and push Docker image
2. **Deploy Staging** - Deploy to staging environment
3. **Deploy Production** - Deploy to production environment

---

## 📋 Setup

### GitHub Actions

**Location:** `.github/workflows/`

**Files:**
- `ci.yml` - Continuous Integration
- `cd.yml` - Continuous Deployment

### Required Secrets

**GitHub Secrets:**
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password/token
- `STAGING_DEPLOY_KEY` - SSH key for staging (if applicable)
- `PRODUCTION_DEPLOY_KEY` - SSH key for production (if applicable)

**Setting Secrets:**
1. Go to GitHub repository
2. Settings → Secrets and variables → Actions
3. Add new repository secret
4. Enter name and value

---

## 🧪 CI Pipeline Details

### Backend Tests

**What it does:**
- Sets up PostgreSQL service
- Installs Node.js dependencies
- Runs linter
- Runs test suite
- Uploads coverage to Codecov

**Configuration:**
```yaml
services:
  postgres:
    image: postgres:15-alpine
    env:
      POSTGRES_PASSWORD: 1992
      POSTGRES_DB: ai
```

**Test Environment:**
- Node.js 18
- PostgreSQL 15
- Test database: `ai`

### Backend Build

**What it does:**
- Builds Docker image
- Verifies build succeeds
- Tests image creation

**Dependencies:**
- Runs after backend tests pass

### Mobile Lint

**What it does:**
- Installs mobile dependencies
- Runs ESLint
- Checks code quality

### Security Scan

**What it does:**
- Runs `npm audit` on backend
- Runs `npm audit` on mobile
- Checks for vulnerabilities

---

## 🚀 CD Pipeline Details

### Build and Push

**What it does:**
- Builds Docker image
- Tags with `latest` and commit SHA
- Pushes to Docker Hub
- Uses build cache for speed

**Configuration:**
```yaml
tags: |
  ${{ secrets.DOCKER_USERNAME }}/shadow-coach-api:latest
  ${{ secrets.DOCKER_USERNAME }}/shadow-coach-api:${{ github.sha }}
```

### Deploy Staging

**Trigger:** Push to `main` branch

**What it does:**
- Deploys to staging environment
- Uses staging environment secrets
- Updates staging server

**Environment:**
- Name: `staging`
- URL: `https://staging-api.shadowcoach.app`

### Deploy Production

**Trigger:** Tag with `v*` (e.g., `v1.0.0`)

**What it does:**
- Deploys to production environment
- Uses production environment secrets
- Updates production server

**Environment:**
- Name: `production`
- URL: `https://api.shadowcoach.app`

---

## 🔧 Customization

### Adding New Jobs

**Example: Add E2E tests:**
```yaml
e2e-tests:
  name: E2E Tests
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Run E2E tests
      run: npm run test:e2e
```

### Changing Triggers

**Example: Run on schedule:**
```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
```

### Adding Environments

**Example: Add preview environment:**
```yaml
deploy-preview:
  environment:
    name: preview
    url: https://preview-api.shadowcoach.app
```

---

## 📊 Monitoring

### GitHub Actions

**View runs:**
- Go to repository
- Click "Actions" tab
- View workflow runs

**View logs:**
- Click on a workflow run
- Click on a job
- View step logs

### Status Badges

**Add to README:**
```markdown
![CI](https://github.com/username/repo/workflows/CI/badge.svg)
![CD](https://github.com/username/repo/workflows/CD/badge.svg)
```

---

## 🐛 Troubleshooting

### Tests Failing

**Check:**
- Test logs in GitHub Actions
- Database connection
- Environment variables
- Test data setup

**Fix:**
- Update test configuration
- Fix failing tests
- Check database setup

### Build Failing

**Check:**
- Docker build logs
- Dockerfile syntax
- Dependencies
- Build context

**Fix:**
- Fix Dockerfile
- Update dependencies
- Check build context

### Deployment Failing

**Check:**
- Deployment logs
- Server connectivity
- Environment secrets
- Deployment script

**Fix:**
- Update deployment script
- Check server access
- Verify secrets

---

## 🔒 Security

### Secrets Management

**Best Practices:**
- Never commit secrets
- Use GitHub Secrets
- Rotate secrets regularly
- Use least privilege

### Security Scanning

**Automated:**
- npm audit in CI
- Dependency scanning
- Code scanning (if enabled)

**Manual:**
- Regular security audits
- Dependency updates
- Vulnerability monitoring

---

## 📝 Workflow Files

### CI Pipeline (`.github/workflows/ci.yml`)

**Jobs:**
- `backend-test` - Run backend tests
- `backend-build` - Build Docker image
- `mobile-lint` - Lint mobile code
- `security-scan` - Security checks

### CD Pipeline (`.github/workflows/cd.yml`)

**Jobs:**
- `build-and-push` - Build and push image
- `deploy-staging` - Deploy to staging
- `deploy-production` - Deploy to production

---

## ✅ Checklist

### Setup
- [ ] GitHub repository created
- [ ] GitHub Actions enabled
- [ ] Secrets configured
- [ ] Workflow files added
- [ ] Test pipeline runs

### CI
- [ ] Tests run on push
- [ ] Tests run on PR
- [ ] Build succeeds
- [ ] Linting works
- [ ] Security scan works

### CD
- [ ] Docker image builds
- [ ] Image pushes to registry
- [ ] Staging deployment works
- [ ] Production deployment works
- [ ] Rollback process defined

---

## 🎯 Next Steps

1. **Configure Secrets** - Add required secrets
2. **Test Pipeline** - Push to test branch
3. **Monitor Runs** - Check workflow runs
4. **Deploy** - Deploy to staging/production
5. **Iterate** - Improve pipeline as needed

---

**CI/CD pipeline is ready!** 🚀

For more information:
- GitHub Actions docs: https://docs.github.com/en/actions
- Docker docs: https://docs.docker.com
- Deployment guides: See deployment documentation

