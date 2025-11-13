# Environment Configuration Guide
## Staging and Production Setup

This guide explains how to configure different environments (development, staging, production) for the AI Shadow-Self Coach backend.

---

## 🎯 Overview

The application supports four environments:
- **Development** - Local development
- **Test** - Automated testing
- **Staging** - Pre-production testing
- **Production** - Live production environment

---

## 📁 Environment Files

### Development
- File: `.env` (local, not committed)
- Template: `.env.example`

### Staging
- File: `.env.staging` (optional, use environment variables)
- Use environment variables or secrets management

### Production
- File: `.env.production` (optional, use environment variables)
- Use environment variables or secrets management (AWS Secrets Manager, Azure Key Vault, etc.)

---

## ⚙️ Environment Variables

### Required for All Environments

```env
# Application
NODE_ENV=development|test|staging|production
PORT=3000
API_BASE_URL=http://localhost:3000/api/v1

# Database
DB_NAME=shadow_coach
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432
DB_SSL=false

# Security
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_EXPIRES_IN=24h
ENCRYPTION_KEY=your_encryption_key_min_32_chars
BCRYPT_ROUNDS=10

# OpenAI
OPENAI_API_KEY=sk-your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7
```

### Staging-Specific

```env
NODE_ENV=staging
API_BASE_URL=https://staging-api.shadow-coach.com/api/v1
CORS_ORIGIN=https://staging.shadow-coach.com

# Database (SSL required)
DB_SSL=true
DB_HOST=staging-db.shadow-coach.com

# Sentry
ENABLE_SENTRY=true
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_TRACES_SAMPLE_RATE=0.5

# Rate Limiting (stricter)
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX=5
RATE_LIMIT_SESSION_MAX=10
```

### Production-Specific

```env
NODE_ENV=production
API_BASE_URL=https://api.shadow-coach.com/api/v1
CORS_ORIGIN=https://shadow-coach.com

# Database (SSL required)
DB_SSL=true
DB_HOST=production-db.shadow-coach.com
DB_POOL_MAX=20

# Security (REQUIRED - must be strong)
JWT_SECRET=production_jwt_secret_min_64_chars_use_secure_random
ENCRYPTION_KEY=production_encryption_key_min_64_chars_use_secure_random

# Sentry
ENABLE_SENTRY=true
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_TRACES_SAMPLE_RATE=0.1

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=200
RATE_LIMIT_AUTH_MAX=5
RATE_LIMIT_SESSION_MAX=10

# Logging
LOG_LEVEL=warn
ENABLE_FILE_LOGGING=true
```

### Optional Variables

```env
# Vector Store
ENABLE_VECTOR_STORE=true
VECTOR_STORE_PROVIDER=pinecone|weaviate|memory
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX_NAME=shadow-coach

# Weaviate
WEAVIATE_URL=http://localhost:8080
WEAVIATE_API_KEY=your_weaviate_key

# WebSocket
ENABLE_WEBSOCKET=true

# App Version
APP_VERSION=1.0.0
```

---

## 🔒 Security Requirements

### Production Security Checklist

- [ ] `JWT_SECRET` is set and at least 64 characters
- [ ] `ENCRYPTION_KEY` is set and at least 64 characters
- [ ] `DB_PASSWORD` is strong and unique
- [ ] Database SSL is enabled (`DB_SSL=true`)
- [ ] CORS origin is restricted to production domain
- [ ] Sentry is enabled for error tracking
- [ ] Rate limiting is configured appropriately
- [ ] Secrets are stored in a secrets manager (not in files)
- [ ] Environment variables are not logged
- [ ] `.env` files are in `.gitignore`

### Generating Secure Secrets

```bash
# Generate JWT Secret (64 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Encryption Key (64 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🚀 Deployment

### Staging Deployment

1. **Set Environment Variables**
   ```bash
   export NODE_ENV=staging
   export DB_PASSWORD=staging_password
   export JWT_SECRET=staging_jwt_secret
   # ... other variables
   ```

2. **Run Migrations**
   ```bash
   npm run migrate
   ```

3. **Start Application**
   ```bash
   npm start
   ```

### Production Deployment

1. **Use Secrets Manager**
   - AWS Secrets Manager
   - Azure Key Vault
   - HashiCorp Vault
   - Kubernetes Secrets

2. **Set Environment Variables**
   ```bash
   export NODE_ENV=production
   # Load from secrets manager
   ```

3. **Validate Configuration**
   ```bash
   node -e "require('./src/config/environment').validateConfig()"
   ```

4. **Run Migrations**
   ```bash
   npm run migrate
   ```

5. **Start Application**
   ```bash
   npm start
   ```

---

## 🐳 Docker Deployment

### Staging

```yaml
# docker-compose.staging.yml
version: '3.8'
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=staging
      - DB_HOST=staging-db
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      # ... other variables
    env_file:
      - .env.staging
```

### Production

```yaml
# docker-compose.production.yml
version: '3.8'
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - DB_HOST=production-db
      # Load from secrets manager
    # Do NOT use env_file in production
```

---

## 📊 Environment Differences

| Feature | Development | Staging | Production |
|---------|------------|---------|------------|
| **Database SSL** | Optional | Required | Required |
| **Logging Level** | debug | info | warn |
| **Sentry** | Optional | Enabled | Enabled |
| **Sentry Sample Rate** | 100% | 50% | 10% |
| **Rate Limiting** | Relaxed | Moderate | Strict |
| **CORS** | * (all) | Staging domain | Production domain |
| **Pool Size** | 5 | 10 | 20 |
| **Error Details** | Full stack | Limited | Minimal |

---

## ✅ Validation

The configuration system validates required variables:

```javascript
const { validateConfig } = require('./src/config/environment');

try {
  validateConfig();
  console.log('✅ Configuration valid');
} catch (error) {
  console.error('❌ Configuration invalid:', error.message);
  process.exit(1);
}
```

---

## 🔍 Checking Current Environment

```javascript
const { getEnvironment, isProduction, isStaging } = require('./src/config/environment');

console.log('Environment:', getEnvironment());
console.log('Is Production:', isProduction());
console.log('Is Staging:', isStaging());
```

---

## 📝 Best Practices

### 1. Never Commit Secrets
- Use `.gitignore` for `.env` files
- Use secrets managers in production
- Rotate secrets regularly

### 2. Use Strong Secrets
- Minimum 64 characters for production
- Use cryptographically secure random generators
- Different secrets for each environment

### 3. Environment-Specific Configs
- Staging should mirror production
- Test with production-like data
- Use separate databases

### 4. Monitoring
- Enable Sentry in staging and production
- Monitor error rates
- Track performance metrics

### 5. Database
- Use SSL in staging and production
- Configure connection pooling
- Set up backups

---

## 🐛 Troubleshooting

### Configuration Validation Fails

**Error:** `JWT_SECRET must be set in production`

**Solution:** Set `JWT_SECRET` environment variable with a strong secret.

### Database Connection Fails

**Error:** `Connection refused`

**Solution:** 
- Check `DB_HOST` and `DB_PORT`
- Verify database is running
- Check firewall rules
- Verify SSL settings

### CORS Errors

**Error:** `CORS policy blocked`

**Solution:**
- Set `CORS_ORIGIN` to your frontend domain
- Ensure `CORS_CREDENTIALS=true` if using cookies

---

## 📚 Resources

- [Node.js Environment Variables](https://nodejs.org/api/process.html#process_process_env)
- [Docker Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)
- [Azure Key Vault](https://azure.microsoft.com/services/key-vault/)

---

**Environment configuration is ready!** 🎯

For questions, see `backend/src/config/environment.js` or check the deployment guide.

