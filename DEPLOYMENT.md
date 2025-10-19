# 🚀 ADRD Knowledge Graph Deployment Guide

This comprehensive guide covers deploying your Django + React ADRD Knowledge Graph application across different platforms and environments.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (Docker)](#quick-start-docker)
3. [Local Development](#local-development)
4. [Production Deployment](#production-deployment)
5. [Cloud Platform Deployment](#cloud-platform-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Docker** (20.10+) and **Docker Compose** (2.0+)
- **Git** for version control
- **Node.js** (18+) and **npm** (for local frontend development)
- **Python** (3.11+) (for local backend development)

### System Requirements
- **Minimum**: 2GB RAM, 2 CPU cores, 10GB disk space
- **Recommended**: 4GB RAM, 4 CPU cores, 20GB disk space
- **Production**: 8GB RAM, 4+ CPU cores, 50GB+ disk space

## Quick Start (Docker)

### 1. Clone and Setup
```bash
git clone <your-repository-url>
cd ADRD-KG

# Copy environment template
cp env.example .env
# Edit .env with your settings
```

### 2. Deploy with One Command

**Linux/macOS:**
```bash
./deploy.sh
```

**Windows:**
```cmd
deploy.bat
```

### 3. Access Your Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost/api/
- **Django Admin**: http://localhost/admin/
- **Health Check**: http://localhost/health

## Local Development

### Backend (Django)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r ../requirements.txt

# Setup database
python manage.py migrate
python manage.py load_sample_data
python manage.py createsuperuser

# Run development server
python manage.py runserver 0.0.0.0:8000
```

### Frontend (React)
```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:5173
```

## Production Deployment

### Docker Compose (Recommended)

#### Full Stack with Database
```bash
# Use the main docker-compose.yml
docker-compose up -d

# Check status
docker-compose ps
```

#### Production Configuration
```bash
# Use production-specific compose file
docker-compose -f docker-compose.production.yml up -d
```

### Manual Production Setup

#### 1. Database Setup (PostgreSQL)
```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE adrd_kg;
CREATE USER adrd_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE adrd_kg TO adrd_user;
\q
```

#### 2. Backend Deployment
```bash
# Install dependencies
pip install -r requirements.txt gunicorn

# Environment setup
export DJANGO_SETTINGS_MODULE=adrd_kg.settings_production
export DATABASE_URL=postgresql://adrd_user:password@localhost:5432/adrd_kg

# Database setup
python manage.py migrate
python manage.py collectstatic
python manage.py load_sample_data

# Run with Gunicorn
gunicorn adrd_kg.wsgi:application --bind 0.0.0.0:8000 --workers 3
```

#### 3. Frontend Deployment
```bash
cd frontend
npm install
npm run build

# Serve with Nginx
sudo cp -r dist/* /var/www/html/
```

## Cloud Platform Deployment

### 1. Heroku

#### Setup
```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-app-name

# Set stack to container
heroku stack:set container

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set SECRET_KEY=your-secret-key
heroku config:set DEBUG=False
heroku config:set DJANGO_SETTINGS_MODULE=adrd_kg.settings_production

# Deploy
git push heroku main
```

#### Configuration Files
- `heroku.yml` - Already configured
- Uses `Dockerfile.backend` for deployment

### 2. Railway

#### Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Configuration
- `railway.toml` - Already configured
- Automatic PostgreSQL and Redis provisioning

### 3. DigitalOcean App Platform

#### Setup via CLI
```bash
# Install doctl
# Create app spec
doctl apps create --spec digitalocean-app.yaml
```

#### Configuration
Create `digitalocean-app.yaml`:
```yaml
name: adrd-knowledge-graph
services:
- name: backend
  source_dir: /
  dockerfile_path: Dockerfile.backend
  instance_count: 1
  instance_size_slug: basic-xxs
  environment_slug: python
  envs:
  - key: DJANGO_SETTINGS_MODULE
    value: adrd_kg.settings_production
  - key: DEBUG
    value: "False"
  http_port: 8000
  
- name: frontend
  source_dir: /
  dockerfile_path: Dockerfile.frontend
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 80

databases:
- name: db
  engine: PG
  version: "15"
```

### 4. AWS (ECS/Fargate)

#### Prerequisites
- AWS CLI configured
- ECR repositories created

#### Deployment
```bash
# Build and push images
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker build -f Dockerfile.backend -t adrd-backend .
docker tag adrd-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/adrd-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/adrd-backend:latest

docker build -f Dockerfile.frontend -t adrd-frontend .
docker tag adrd-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/adrd-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/adrd-frontend:latest

# Deploy using ECS task definitions (create via AWS Console or CLI)
```

## Environment Configuration

### Required Environment Variables

#### Core Settings
```bash
# Security
SECRET_KEY=your-very-secure-secret-key-minimum-50-characters
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/database
# OR individual settings:
POSTGRES_DB=adrd_kg
POSTGRES_USER=adrd_user
POSTGRES_PASSWORD=secure_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

#### Optional Settings
```bash
# HTTPS
USE_HTTPS=True

# Caching
REDIS_URL=redis://localhost:6379/1

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

### Platform-Specific Variables

#### Heroku
```bash
heroku config:set SECRET_KEY=your-secret-key
heroku config:set DEBUG=False
heroku config:set ALLOWED_HOSTS=your-app.herokuapp.com
```

#### Railway
```bash
railway variables set SECRET_KEY=your-secret-key
railway variables set DEBUG=False
```

## Monitoring & Maintenance

### Health Checks
```bash
# Application health
curl http://localhost/api/health/

# Service status
docker-compose ps

# Logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Database Maintenance
```bash
# Backup database
docker-compose exec db pg_dump -U adrd_user adrd_kg > backup.sql

# Restore database
docker-compose exec -T db psql -U adrd_user adrd_kg < backup.sql

# Django management
docker-compose exec backend python manage.py shell
docker-compose exec backend python manage.py migrate
```

### Updates and Scaling
```bash
# Update application
git pull origin main
docker-compose build --no-cache
docker-compose up -d

# Scale services
docker-compose up -d --scale backend=3

# Resource monitoring
docker stats
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check database status
docker-compose exec db pg_isready

# Check connection from backend
docker-compose exec backend python manage.py dbshell
```

#### 2. CORS Issues
- Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL
- Check browser network tab for preflight requests
- Ensure backend is accessible from frontend

#### 3. Static Files Not Loading
```bash
# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput

# Check static file serving
curl http://localhost/static/admin/css/base.css
```

#### 4. Memory Issues
```bash
# Check resource usage
docker stats

# Increase memory limits in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1G
```

### Debug Mode
For troubleshooting, temporarily enable debug mode:
```bash
# Set in .env
DEBUG=True

# Restart services
docker-compose restart backend
```

### Log Analysis
```bash
# Application logs
docker-compose logs backend | grep ERROR

# Database logs
docker-compose logs db

# Nginx logs
docker-compose logs frontend
```

## Security Considerations

### Production Security Checklist
- [ ] Change default SECRET_KEY
- [ ] Set DEBUG=False
- [ ] Configure ALLOWED_HOSTS properly
- [ ] Use HTTPS in production
- [ ] Set up proper CORS origins
- [ ] Use strong database passwords
- [ ] Enable security headers
- [ ] Set up monitoring and alerting
- [ ] Regular security updates
- [ ] Backup strategy in place

### SSL/HTTPS Setup
```bash
# Using Let's Encrypt with Certbot
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com

# Update nginx configuration for HTTPS
# Set USE_HTTPS=True in environment
```

## Performance Optimization

### Database Optimization
```python
# Django settings for production
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'CONN_MAX_AGE': 60,  # Connection pooling
        'OPTIONS': {
            'MAX_CONNS': 20,
        }
    }
}
```

### Caching
```python
# Enable Redis caching
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://redis:6379/1',
    }
}
```

### CDN Integration
- Use AWS CloudFront or similar for static files
- Configure `STATIC_URL` to point to CDN
- Enable gzip compression in Nginx

## Backup Strategy

### Automated Backups
```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T db pg_dump -U adrd_user adrd_kg > "backup_${DATE}.sql"
aws s3 cp "backup_${DATE}.sql" s3://your-backup-bucket/
```

### Backup Schedule
- Daily database backups
- Weekly full system backups
- Monthly backup verification
- Offsite backup storage

---

## 🎉 Congratulations!

Your ADRD Knowledge Graph is now deployed and ready for production use. The application provides:

- **Scalable Architecture**: Docker-based deployment
- **Production Ready**: Security, monitoring, and performance optimizations
- **Multi-Platform**: Deploy on any cloud provider
- **Easy Maintenance**: Automated scripts and comprehensive monitoring

For support or questions, refer to the troubleshooting section or check the application logs.
