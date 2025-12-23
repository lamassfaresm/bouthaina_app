# Time Series Forecasting Application

A complete, production-quality web application for time series forecasting with automatic model selection, EDA, and comprehensive reporting.

## Features

### 📊 Exploratory Data Analysis
- Automatic date and value column detection
- Summary statistics (mean, std, min, max, median, quartiles)
- Stationarity testing (ADF, KPSS)
- Trend detection with linear regression
- Seasonal decomposition
- Autocorrelation (ACF) and Partial Autocorrelation (PACF)

### 🤖 Forecasting Models
- **Moving Average (MA)**: Simple sliding window averaging
- **Linear Regression**: Polynomial trend fitting
- **Simple Exponential Smoothing (SES)**: α parameter optimization
- **Holt's Linear Trend**: α, β parameter optimization
- **Holt-Winters Additive**: α, β, γ parameter optimization (seasonal)
- **Holt-Winters Multiplicative**: α, β, γ parameter optimization (seasonal)

### 📈 Model Evaluation
- **Metrics**: MSE, RMSE, MAE, MAPE
- **Information Criteria**: AIC, BIC, AICc
- **Residual Analysis**: Shapiro-Wilk test, Ljung-Box test
- **Model Ranking**: Automatic best model selection based on multiple criteria

### 📁 Export Options
- JSON forecast export
- CSV forecast export
- Comprehensive PDF report
- Structured execution logs with timestamps and analysis details

## Architecture

### Backend (FastAPI)
```
backend/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── routes/
│   │   ├── upload.py       # CSV upload and processing
│   │   ├── eda.py          # EDA endpoints
│   │   ├── modeling.py     # Model training endpoints
│   │   ├── forecast.py     # Forecast generation
│   │   ├── export.py       # Export functionality
│   │   └── logs.py         # Logging endpoints
│   └── services/
│       ├── data_processor.py       # Data handling
│       ├── eda_service.py          # EDA calculations
│       ├── modeling_service.py     # Model implementations
│       ├── evaluation_service.py   # Metrics and evaluation
│       ├── export_service.py       # Export utilities
│       └── session_manager.py      # Session management
├── uploads/                 # Uploaded files directory
└── requirements.txt        # Python dependencies
```

### Frontend (Next.js + React)
```
frontend/
├── app/
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── src/
│   ├── api.ts            # API client
│   └── components/
│       ├── FileUpload.tsx     # File upload component
│       ├── Chart.tsx          # Chart visualization
│       ├── StatCard.tsx       # Statistic cards
│       ├── EDAPanel.tsx       # EDA display
│       └── ModelTrainer.tsx   # Model training UI
├── package.json
├── tailwind.config.js
└── next.config.js
```

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # macOS/Linux
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run FastAPI server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   Server will be available at `http://localhost:8000`
   API documentation at `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env.local**
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

   Application will be available at `http://localhost:3000`

## API Endpoints

### Upload
- `POST /api/upload/csv` - Upload CSV file
- `GET /api/upload/preview/{session_id}` - Get data preview

### EDA
- `GET /api/eda/{session_id}` - Run complete EDA
- `GET /api/eda/{session_id}/stationarity` - Stationarity tests
- `GET /api/eda/{session_id}/trend` - Trend analysis
- `GET /api/eda/{session_id}/decomposition` - Seasonal decomposition
- `GET /api/eda/{session_id}/acf` - ACF analysis
- `GET /api/eda/{session_id}/pacf` - PACF analysis

### Modeling
- `POST /api/modeling/{session_id}/split` - Train/test split
- `POST /api/modeling/{session_id}/moving-average` - MA model
- `POST /api/modeling/{session_id}/linear-regression` - Linear regression
- `POST /api/modeling/{session_id}/ses` - SES model
- `POST /api/modeling/{session_id}/holt` - Holt's method
- `POST /api/modeling/{session_id}/holt-winters-additive` - HW additive
- `POST /api/modeling/{session_id}/holt-winters-multiplicative` - HW multiplicative

### Export
- `POST /api/export/{session_id}/execution-log` - Get execution log
- `POST /api/export/{session_id}/forecast-csv` - Export as CSV
- `POST /api/export/{session_id}/forecast-json` - Export as JSON
- `POST /api/export/{session_id}/report-pdf` - Generate PDF report

### Logs
- `POST /api/logs/{session_id}/create-execution-log` - Create execution log
- `GET /api/logs/{session_id}/execution-log` - Get execution log
- `GET /api/logs/sessions/list` - List all sessions
- `DELETE /api/logs/{session_id}` - Delete session

## Usage Workflow

### 1. Upload Data
- Drop or select CSV file with date and value columns
- Automatic column detection
- Data validation and preprocessing

### 2. Exploratory Data Analysis
- View summary statistics
- Check stationarity (ADF, KPSS tests)
- Analyze trends
- Seasonal decomposition
- ACF/PACF analysis

### 3. Model Training
- Select train/test split ratio (default 70/30)
- Train multiple models
- Automatic parameter optimization for exponential smoothing models
- View performance metrics for each model

### 4. Model Evaluation
- Compare models on test set
- View MSE, RMSE, MAE, MAPE, AIC, BIC
- Residual analysis
- Automatic best model selection

### 5. Forecasting & Export
- Generate forecasts with selected model
- Export results as JSON/CSV
- Generate comprehensive PDF report
- Download execution log

## Data Format

CSV file should contain at least two columns:
- **Date Column**: Recognizable date format (YYYY-MM-DD, MM/DD/YYYY, etc.)
- **Value Column**: Numeric values to forecast

Example:
```csv
Month,#Passengers
1949-01,112
1949-02,118
1949-03,132
...
```

## Parameter Optimization

### Exponential Smoothing Methods
Parameters are automatically optimized using MSE minimization:
- **α (alpha)**: Level smoothing (0-1)
- **β (beta)**: Trend smoothing (0-1)
- **γ (gamma)**: Seasonal smoothing (0-1)

Use `optimize=true` in request body to enable automatic optimization.

## Model Selection Criteria

Models are ranked using weighted metrics:
- RMSE: 30% weight
- MAE: 20% weight
- AIC: 25% weight
- BIC: 25% weight

Lower overall score indicates better model.

## Execution Log Structure

```json
{
  "execution_timestamp": "2024-01-01T12:00:00",
  "data_preprocessing": {
    "rows": 144,
    "date_range": {"start": "1949-01", "end": "1960-12"},
    "missing_values": 0,
    "duplicates": 0
  },
  "train_test_split": {
    "train_size": 100,
    "test_size": 44,
    "train_ratio": 0.694
  },
  "eda_results": {
    "adf_test": {...},
    "kpss_test": {...},
    "trend_detection": {...}
  },
  "models_tested": [
    {
      "model": "Moving Average",
      "rank": 1,
      "metrics": {
        "mse": 123.45,
        "rmse": 11.11,
        "mae": 8.90,
        "aic": 456.78
      }
    }
  ],
  "best_model": {...},
  "summary": {...}
}
```

## Performance Metrics Explained

- **MSE (Mean Squared Error)**: Average of squared errors, penalizes larger errors
- **RMSE (Root Mean Squared Error)**: Square root of MSE, same units as values
- **MAE (Mean Absolute Error)**: Average absolute error
- **MAPE (Mean Absolute Percentage Error)**: Percentage error
- **AIC**: Akaike Information Criterion (lower is better)
- **BIC**: Bayesian Information Criterion (lower is better)
- **AICc**: Corrected AIC for small sample sizes

## Troubleshooting

### Backend Connection Error
- Ensure FastAPI server is running on port 8000
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Check CORS settings if accessing from different domain

### File Upload Issues
- Verify CSV format is correct
- Ensure columns can be automatically detected as date and numeric value
- Check file size (no specific limit, but reasonable size recommended)

### Model Training Fails
- Ensure train/test split has adequate data (minimum 10 points)
- For seasonal models (HW), data should have at least 2 seasons
- Check for NaN or infinite values

### PDF Export Not Working
- Install reportlab: `pip install reportlab`
- Ensure execution log was created before exporting

## Dependencies

### Python (Backend)
- fastapi==0.104.1
- uvicorn==0.24.0
- pandas==2.1.3
- numpy==1.26.2
- scipy==1.11.4
- statsmodels==0.14.0
- scikit-learn==1.3.2
- reportlab==4.0.7

### JavaScript (Frontend)
- next==14.0.0
- react==18.2.0
- axios==1.6.0
- recharts==2.10.0
- tailwindcss==3.3.0

## Configuration

### Environment Variables

**Backend (.env)**
```bash
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=52428800  # 50MB
```

**Frontend (.env.local)**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Development

### Adding New Models

1. Implement model in `services/modeling_service.py`
2. Add training endpoint in `routes/modeling.py`
3. Add UI component in `frontend/src/components/`
4. Update `frontend/src/api.ts` with API call

### Adding New Metrics

1. Implement in `services/evaluation_service.py`
2. Update model evaluation in training endpoints
3. Display in UI components

## Production Deployment

### Backend (Heroku/Railway/AWS)
```bash
pip freeze > requirements.txt
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

### Frontend (Vercel/Netlify)
```bash
npm run build
npm run start
```

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation at `/api/docs`
3. Check browser console for frontend errors
4. Check terminal for backend errors

## Version

Version 1.0.0

## Author

Time Series Forecasting Team
