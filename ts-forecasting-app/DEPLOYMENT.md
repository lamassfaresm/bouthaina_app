# Deployment Guide

## Production Deployment

### Backend Deployment

#### Option 1: Heroku Deployment

1. **Create Procfile**
```
web: gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --timeout 60
```

2. **Update requirements.txt**
```bash
pip install gunicorn
pip freeze > requirements.txt
```

3. **Add runtime.txt**
```
python-3.11.7
```

4. **Deploy**
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create ts-forecasting-api

# Set environment variables
heroku config:set UPLOAD_DIR=/tmp/uploads

# Deploy
git push heroku main
```

#### Option 2: Railway Deployment

1. **Connect GitHub**
   - Push code to GitHub
   - Link GitHub repo to Railway

2. **Create railway.json**
```json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker"
  }
}
```

3. **Deploy on Railway**
   - Connect repository
   - Configure environment variables
   - Deploy

#### Option 3: AWS EC2 Deployment

1. **Launch EC2 Instance**
```bash
# SSH into instance
ssh -i key.pem ubuntu@instance-ip

# Install dependencies
sudo apt-get update
sudo apt-get install python3-pip python3-venv nginx

# Clone repository
git clone <repo-url>
cd ts-forecasting-app/backend

# Setup
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. **Configure Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

3. **Run with Systemd**
```ini
[Unit]
Description=Time Series Forecasting API
After=network.target

[Service]
Type=notify
User=ubuntu
WorkingDirectory=/home/ubuntu/ts-forecasting-app/backend
Environment="PATH=/home/ubuntu/ts-forecasting-app/backend/venv/bin"
ExecStart=/home/ubuntu/ts-forecasting-app/backend/venv/bin/gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker

[Install]
WantedBy=multi-user.target
```

#### Option 4: Docker Deployment

1. **Create Dockerfile**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy application
COPY backend/app app/

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 8000

# Run application
CMD ["gunicorn", "app.main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

2. **Create docker-compose.yml**
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - UPLOAD_DIR=/app/uploads
    volumes:
      - ./backend/uploads:/app/uploads
    restart: always

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000/api
    depends_on:
      - backend
    restart: always
```

3. **Create Dockerfile.frontend**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY frontend/package*.json ./

RUN npm install

COPY frontend .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

4. **Deploy with Docker**
```bash
docker-compose up -d
```

### Frontend Deployment

#### Option 1: Vercel Deployment

1. **Connect GitHub Repository**
   - Push code to GitHub
   - Link repo to Vercel

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Output directory: `.next`
   - Install command: `npm install`

3. **Set Environment Variables**
   - `NEXT_PUBLIC_API_URL`: https://api.yourdomain.com

4. **Deploy**
   - Automatic deployment on push to main

#### Option 2: Netlify Deployment

1. **Create netlify.toml**
```toml
[build]
  command = "npm run build"
  functions = "api"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "https://api.yourdomain.com/:splat"
  status = 200
```

2. **Deploy**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### Option 3: AWS S3 + CloudFront

1. **Build Frontend**
```bash
npm run build
npm export  # If needed
```

2. **Upload to S3**
```bash
aws s3 sync .next/static s3://bucket-name --delete
```

3. **Configure CloudFront**
   - Create distribution pointing to S3
   - Enable caching
   - Set API domain as origin for /api/*

#### Option 4: Docker Deployment

1. **Dockerfile.frontend** (see Docker section above)

2. **Run with Docker**
```bash
docker build -t ts-forecasting-frontend -f Dockerfile.frontend .
docker run -p 3000:3000 ts-forecasting-frontend
```

## Production Configuration

### Environment Variables

**Backend**
```bash
UPLOAD_DIR=/var/uploads
MAX_UPLOAD_SIZE=52428800
DEBUG=False
WORKERS=4
```

**Frontend**
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_DEBUG=false
```

### Database Setup (Optional)

For persistent session storage:

```python
# backend/app/services/session_manager.py
# Replace with PostgreSQL backend
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
```

### Monitoring and Logging

1. **Backend Logging**
```python
import logging
from pythonjsonlogger import jsonlogger

handler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
handler.setFormatter(formatter)
logger = logging.getLogger()
logger.addHandler(handler)
```

2. **Frontend Error Tracking**
```typescript
// Sentry or similar
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
});
```

## SSL/TLS Configuration

### Nginx with Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certbot --nginx -d yourdomain.com
```

### Updated Nginx Config
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
    }

    location /api {
        proxy_pass http://localhost:8000;
    }
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Performance Optimization

### Backend
```python
# Use connection pooling
from sqlalchemy.pool import QueuePool

# Cache frequently accessed data
from functools import lru_cache

# Implement async operations
async def process_file(file):
    # Async file processing
```

### Frontend
```javascript
// Image optimization
import Image from 'next/image'

// Code splitting
dynamic(() => import('@/components/Heavy'), { ssr: false })

// Caching
revalidate: 3600  // ISR revalidation
```

## Backup Strategy

### Database Backups
```bash
# PostgreSQL backup
pg_dump database_name > backup.sql

# Restore
psql database_name < backup.sql
```

### File Uploads Backup
```bash
# S3 backup
aws s3 sync /var/uploads s3://backup-bucket/uploads
```

## Load Testing

### Using Apache Bench
```bash
ab -n 1000 -c 100 http://yourdomain.com/
```

### Using wrk
```bash
wrk -t12 -c400 -d30s http://yourdomain.com/
```

## Rollback Procedure

```bash
# Git rollback
git revert <commit-hash>
git push

# Heroku rollback
heroku releases
heroku rollback v<number>

# Docker rollback
docker pull myregistry/ts-forecasting:latest
docker stop container_id
docker run -d myregistry/ts-forecasting:latest
```

## Monitoring Checklist

- [ ] API response times < 2s
- [ ] CPU usage < 70%
- [ ] Memory usage < 80%
- [ ] Disk usage < 85%
- [ ] Error rate < 0.1%
- [ ] Uptime > 99.9%
- [ ] Database backup daily
- [ ] Security updates applied

## Security Checklist

- [ ] HTTPS only
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] CSRF tokens
- [ ] Security headers set
- [ ] Secrets not in code
- [ ] Regular security audits
- [ ] Dependency updates

## Scaling Recommendations

### Vertical Scaling
- Increase server resources
- More CPU cores
- More RAM

### Horizontal Scaling
- Multiple backend instances
- Load balancer (Nginx, HAProxy)
- Shared session store (Redis)
- Database replication

### CDN for Static Files
- CloudFront for frontend assets
- S3 for file uploads

## Costs Estimation

### Monthly Costs (Approximate)
- **Vercel Frontend**: $20-100
- **Heroku Backend**: $25-500
- **Database**: $10-100
- **Storage**: $5-50
- **CDN**: $0-100

**Total**: $60-850/month depending on scale
