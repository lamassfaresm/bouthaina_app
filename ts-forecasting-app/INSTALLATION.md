# Installation Guide

## System Requirements

- **Python**: 3.8 or higher
- **Node.js**: 16.x or higher
- **npm**: 7.x or higher
- **RAM**: Minimum 2GB (4GB recommended)
- **Disk Space**: 500MB minimum

## Operating System Support

- Windows 10/11
- macOS 10.15+
- Ubuntu 18.04+

## Step-by-Step Installation

### 1. Clone or Download Project

```bash
# If using git
git clone <repository-url>
cd ts-forecasting-app

# Or extract from zip file
```

### 2. Backend Installation

#### Windows

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Verify installation
python -c "import fastapi; import pandas; import numpy; print('All dependencies installed')"
```

#### macOS/Linux

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Verify installation
python -c "import fastapi; import pandas; import numpy; print('All dependencies installed')"
```

### 3. Frontend Installation

```bash
# Navigate to frontend
cd frontend

# Install Node dependencies
npm install

# Create environment file
# Windows
echo NEXT_PUBLIC_API_URL=http://localhost:8000/api > .env.local

# macOS/Linux
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# Verify installation
npm list react next
```

### 4. Start Services

#### Terminal 1: Backend

```bash
# Navigate to backend
cd backend

# Activate virtual environment (if not already active)
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Start FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started server process [12345]
INFO:     Application startup complete
```

#### Terminal 2: Frontend

```bash
# Navigate to frontend
cd frontend

# Start Next.js development server
npm run dev
```

Expected output:
```
> ts-forecasting-frontend@1.0.0 dev
> next dev

  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local

Ready in 2.5s
```

### 5. Verify Installation

1. **Check Backend Health**
   - Open browser: `http://localhost:8000/health`
   - Should show: `{"status": "healthy"}`

2. **Check API Documentation**
   - Open browser: `http://localhost:8000/docs`
   - Should show Swagger UI

3. **Open Frontend Application**
   - Open browser: `http://localhost:3000`
   - Should show file upload interface

## Troubleshooting Installation

### Python Virtual Environment Issues

**Problem**: `python: command not found` (macOS/Linux)

**Solution**:
```bash
# Use python3
python3 -m venv venv
source venv/bin/activate
python3 -m pip install -r requirements.txt
```

**Problem**: `venv\Scripts\activate` not found (Windows)

**Solution**:
```bash
# Use alternative activation
venv\Scripts\activate.bat  # For Command Prompt
. venv\Scripts\Activate.ps1  # For PowerShell
```

### Dependencies Installation Issues

**Problem**: `pip: command not found`

**Solution**:
```bash
# Update pip
python -m pip install --upgrade pip

# Then reinstall
pip install -r requirements.txt
```

**Problem**: `ModuleNotFoundError` after installation

**Solution**:
```bash
# Force reinstall all dependencies
pip install -r requirements.txt --force-reinstall --no-cache-dir
```

### Port Already in Use

**Problem**: `Address already in use` when starting backend

**Solution**:
```bash
# Windows: Find process using port 8000
netstat -ano | findstr :8000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or start on different port
uvicorn app.main:app --reload --port 8001

# Update .env.local in frontend
NEXT_PUBLIC_API_URL=http://localhost:8001/api
```

**Problem**: Port 3000 already in use (Frontend)

**Solution**:
```bash
# Use different port
npm run dev -- -p 3001

# Update browser to http://localhost:3001
```

### Node.js Issues

**Problem**: `npm: command not found`

**Solution**: Install Node.js from https://nodejs.org/

**Problem**: `Next.js requires Node.js version 14.0 or higher`

**Solution**:
```bash
# Check version
node --version

# If outdated, download from nodejs.org or use nvm:
# macOS/Linux
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### CORS Issues

**Problem**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution**:
- Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Ensure backend is running at correct address
- CORS is enabled in backend for all origins

### Database/File Issues

**Problem**: `Permission denied` when creating uploads folder

**Solution**:
```bash
# Create uploads folder manually
# Windows
mkdir backend\uploads

# macOS/Linux
mkdir backend/uploads

# Set permissions
chmod 755 backend/uploads
```

## Advanced Installation

### Using Poetry (Backend)

```bash
# Install Poetry
pip install poetry

# Navigate to backend
cd backend

# Install dependencies with Poetry
poetry install

# Run with Poetry
poetry run uvicorn app.main:app --reload
```

### Using Docker

**Dockerfile for Backend**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app app/

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Run Backend in Docker**:
```bash
# Build image
docker build -t ts-forecasting-backend .

# Run container
docker run -p 8000:8000 ts-forecasting-backend
```

### Production Installation

#### Backend Production Setup

```bash
# Install production dependencies
pip install gunicorn

# Run with Gunicorn
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

#### Frontend Production Build

```bash
# Build optimized bundle
npm run build

# Start production server
npm run start
```

## Environment Variables

### Backend (.env file)

Create `.env` in backend directory:

```bash
# Upload settings
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=52428800  # 50MB in bytes

# Server settings
HOST=0.0.0.0
PORT=8000
DEBUG=False

# CORS settings (for production)
ALLOWED_ORIGINS=["http://localhost:3000", "https://yourdomain.com"]
```

### Frontend (.env.local file)

Create `.env.local` in frontend directory:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Development settings
NEXT_PUBLIC_DEBUG=false
```

## Verification Checklist

- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] Virtual environment created and activated
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Able to access http://localhost:3000
- [ ] API health check passing
- [ ] No CORS errors in browser console

## Upgrading Dependencies

### Backend
```bash
# Update all packages
pip install -r requirements.txt --upgrade

# Or update specific package
pip install pandas --upgrade
```

### Frontend
```bash
# Update all packages
npm update

# Update specific package
npm update react
```

## Uninstalling

### Backend
```bash
# Deactivate virtual environment
deactivate

# Windows: Remove venv folder
rmdir /s backend\venv

# macOS/Linux: Remove venv folder
rm -rf backend/venv
```

### Frontend
```bash
# Remove node_modules
rm -rf node_modules

# Remove package-lock.json
rm package-lock.json

# Or on Windows
del package-lock.json
```

## Getting Help

1. Check the README.md for general information
2. Review QUICKSTART.md for common tasks
3. Check API_DOCS.md for API details
4. Review error messages in terminal/console
5. Check browser console (F12) for client-side errors

## Next Steps

After successful installation:
1. Review the QUICKSTART.md guide
2. Try uploading sample data
3. Explore the API documentation at `/api/docs`
4. Review the README.md for feature details

## Support

For issues:
- Check troubleshooting section above
- Review log messages carefully
- Ensure all system requirements are met
- Verify file paths are correct
- Check port availability
