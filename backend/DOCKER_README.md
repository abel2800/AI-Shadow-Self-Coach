# Docker Setup Guide
## Shadow Coach Backend — Containerization

This guide explains how to run the Shadow Coach backend using Docker.

---

## 🐳 Quick Start

### Development Environment

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Or run in background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f api

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Production Environment

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

---

## 📋 Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- `.env` file configured (see `.env.example`)

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=ai
DB_USER=postgres
DB_PASSWORD=1992

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=your-openai-key-here

# Server
PORT=3000
NODE_ENV=production

# Vector Store (optional)
ENABLE_VECTOR_STORE=false
VECTOR_STORE_PROVIDER=memory
PINECONE_API_KEY=
PINECONE_INDEX_NAME=
WEAVIATE_URL=
WEAVIATE_API_KEY=

# WebSocket
ENABLE_WEBSOCKET=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🚀 Development Setup

### Using Docker Compose (Recommended)

**Start services:**
```bash
docker-compose -f docker-compose.dev.yml up
```

**Access services:**
- API: http://localhost:3000
- Database: localhost:5432
- Health check: http://localhost:3000/health

**Hot reload:**
- Code changes automatically reload
- Uses nodemon for development

**Run migrations:**
```bash
# Inside container
docker-compose -f docker-compose.dev.yml exec api npm run migrate

# Or from host
docker-compose -f docker-compose.dev.yml run --rm api npm run migrate
```

**Run tests:**
```bash
docker-compose -f docker-compose.dev.yml run --rm api npm test
```

---

## 🏭 Production Setup

### Build Image

```bash
# Build production image
docker build -t shadow-coach-api:latest .

# Or use docker-compose
docker-compose build
```

### Run Container

```bash
# Start with docker-compose
docker-compose up -d

# Or run directly
docker run -d \
  --name shadow-coach-api \
  -p 3000:3000 \
  --env-file .env \
  shadow-coach-api:latest
```

### Health Check

```bash
# Check health
curl http://localhost:3000/health

# Check detailed health
curl http://localhost:3000/health/detailed
```

---

## 📦 Docker Compose Services

### Development (`docker-compose.dev.yml`)

**Services:**
- `postgres` - PostgreSQL database
- `api` - Backend API with hot reload

**Features:**
- Volume mounting for code changes
- Hot reload with nodemon
- Development database

### Production (`docker-compose.yml`)

**Services:**
- `postgres` - PostgreSQL database
- `api` - Backend API (optimized build)

**Features:**
- Multi-stage build
- Optimized image size
- Production database
- Health checks
- Auto-restart

---

## 🔍 Useful Commands

### Development

```bash
# Start services
docker-compose -f docker-compose.dev.yml up

# Start in background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down

# Remove volumes (⚠️ deletes data)
docker-compose -f docker-compose.dev.yml down -v

# Rebuild containers
docker-compose -f docker-compose.dev.yml build --no-cache

# Execute command in container
docker-compose -f docker-compose.dev.yml exec api npm run migrate
```

### Production

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Scale API (if needed)
docker-compose up -d --scale api=3
```

### Database

```bash
# Access PostgreSQL
docker-compose exec postgres psql -U postgres -d ai

# Backup database
docker-compose exec postgres pg_dump -U postgres ai > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres ai < backup.sql
```

---

## 🐛 Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs api

# Check container status
docker-compose ps

# Restart container
docker-compose restart api
```

### Database connection issues

```bash
# Check database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker-compose exec api node -e "require('./src/config/database').sequelize.authenticate()"
```

### Port already in use

```bash
# Change port in docker-compose.yml
ports:
  - "3001:3000"  # Use 3001 instead of 3000
```

### Permission issues

```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Or run with sudo (not recommended)
sudo docker-compose up
```

---

## 🔒 Security Best Practices

### Production Checklist

- [ ] Use strong `JWT_SECRET`
- [ ] Use strong database password
- [ ] Don't commit `.env` file
- [ ] Use secrets management (Docker secrets, Kubernetes secrets)
- [ ] Enable SSL/TLS
- [ ] Use non-root user (already configured)
- [ ] Limit container resources
- [ ] Regular security updates

### Environment Variables

**Never commit:**
- `.env` files
- API keys
- Secrets
- Passwords

**Use secrets management:**
- Docker secrets
- Kubernetes secrets
- AWS Secrets Manager
- HashiCorp Vault

---

## 📊 Monitoring

### Health Checks

**Built-in health check:**
```bash
curl http://localhost:3000/health
```

**Detailed health:**
```bash
curl http://localhost:3000/health/detailed
```

### Logs

**View logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api

# Last 100 lines
docker-compose logs --tail=100 api
```

### Resource Usage

```bash
# Container stats
docker stats

# Specific container
docker stats shadow-coach-api
```

---

## 🚀 Deployment

### Docker Hub

```bash
# Login
docker login

# Tag image
docker tag shadow-coach-api:latest username/shadow-coach-api:latest

# Push image
docker push username/shadow-coach-api:latest
```

### Kubernetes

```yaml
# Example deployment (k8s/deployment.yaml)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: shadow-coach-api
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: api
        image: username/shadow-coach-api:latest
        ports:
        - containerPort: 3000
```

### AWS ECS / Fargate

Use the Docker image with ECS task definitions.

---

## 📝 Notes

- **Development:** Uses volume mounting for hot reload
- **Production:** Uses optimized multi-stage build
- **Database:** Persistent volume for data
- **Health Checks:** Automatic container health monitoring
- **Networking:** Isolated Docker network

---

## ✅ Next Steps

1. Configure `.env` file
2. Start development environment
3. Run migrations
4. Test API endpoints
5. Deploy to production

---

**Docker setup is ready!** 🐳

For more information, see:
- `Dockerfile` - Production build
- `Dockerfile.dev` - Development build
- `docker-compose.yml` - Production services
- `docker-compose.dev.yml` - Development services

