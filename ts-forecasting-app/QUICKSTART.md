# Quick Start Guide

## 5-Minute Setup

### Step 1: Backend Setup (Terminal 1)

```bash
# Navigate to backend
cd ts-forecasting-app\backend

# Create virtual environment (Windows)
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### Step 2: Frontend Setup (Terminal 2)

```bash
# Navigate to frontend
cd ts-forecasting-app\frontend

# Install dependencies
npm install

# Create environment file
echo NEXT_PUBLIC_API_URL=http://localhost:8000/api > .env.local

# Run frontend
npm run dev
```

Expected output:
```
> ts-forecasting-frontend@1.0.0 dev
> next dev

  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
```

### Step 3: Open Application

Open browser to `http://localhost:3000`

## Using the Application

### 1. Upload CSV
- Drag and drop CSV file or click to browse
- File must have date and numeric value columns
- Example: AirPassengers.csv

### 2. View Data Summary
- Check total rows, date range, missing values
- Click "Proceed to Analysis"

### 3. Exploratory Data Analysis
- View summary statistics
- Check stationarity (ADF/KPSS tests)
- Analyze trends
- Proceed to modeling

### 4. Train Models
- Select models to train
- Compare performance metrics
- Automatic parameter optimization
- View RMSE, MAE, AIC, BIC

### 5. Export Results
- Generate execution log
- Download JSON/CSV forecast
- Get PDF report (if reportlab installed)

## Example CSV Format

```csv
Date,Value
2020-01-01,100
2020-01-02,105
2020-01-03,103
...
```

Or with different column names:
```csv
Month,Sales
2020-01,1000
2020-02,1150
2020-03,1200
...
```

## Common Commands

### Backend
```bash
# Run with auto-reload
uvicorn app.main:app --reload

# View API docs
# Open http://localhost:8000/docs

# View redoc
# Open http://localhost:8000/redoc
```

### Frontend
```bash
# Development
npm run dev

# Build for production
npm run build

# Production start
npm run start

# Lint check
npm run lint
```

## Stopping Services

### Backend
Press `Ctrl+C` in terminal running uvicorn

### Frontend
Press `Ctrl+C` in terminal running next dev

## Verify Installation

### Backend Health Check
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "healthy"}
```

### Frontend Loading
- Open http://localhost:3000
- Should display file upload interface

## Troubleshooting

### Port Already in Use
```bash
# Backend on different port
uvicorn app.main:app --reload --port 8001

# Update frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:8001/api
```

### Module Not Found (Backend)
```bash
# Upgrade pip
python -m pip install --upgrade pip

# Reinstall requirements
pip install -r requirements.txt --force-reinstall
```

### Module Not Found (Frontend)
```bash
# Clear node_modules
rm -r node_modules package-lock.json

# Reinstall
npm install
```

### CORS Error
- Ensure backend is running at the correct port
- Check `NEXT_PUBLIC_API_URL` matches backend address

## Next Steps

1. Try with sample data (AirPassengers.csv)
2. Explore different models
3. Review API documentation at `/api/docs`
4. Check execution logs for detailed analysis

## Features Checklist

- [x] CSV upload with auto-detection
- [x] Data preview and statistics
- [x] EDA with stationarity tests
- [x] Trend detection
- [x] Seasonal decomposition
- [x] ACF/PACF analysis
- [x] 6 forecasting models
- [x] Parameter optimization
- [x] Model evaluation and ranking
- [x] Residual analysis
- [x] Export to JSON/CSV
- [x] PDF report generation
- [x] Execution logging

## Support

For detailed information, see README.md
