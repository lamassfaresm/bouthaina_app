# Project Structure

## Complete Directory Layout

```
ts-forecasting-app/
├── README.md                      # Main documentation
├── QUICKSTART.md                  # Quick start guide
├── INSTALLATION.md                # Detailed installation guide
├── API_DOCS.md                    # Complete API documentation
├── DEPLOYMENT.md                  # Production deployment guide
├── sample_data.csv               # Sample AirPassengers data
│
├── backend/                       # FastAPI Backend
│   ├── requirements.txt          # Python dependencies
│   ├── .gitignore               # Git ignore file
│   ├── app/
│   │   ├── main.py             # FastAPI application entry point
│   │   ├── __init__.py         # Package initializer
│   │   │
│   │   ├── routes/             # API route handlers
│   │   │   ├── __init__.py
│   │   │   ├── upload.py       # File upload endpoints
│   │   │   ├── eda.py          # EDA analysis endpoints
│   │   │   ├── modeling.py     # Model training endpoints
│   │   │   ├── forecast.py     # Forecast generation endpoints
│   │   │   ├── export.py       # Export functionality endpoints
│   │   │   └── logs.py         # Logging and session endpoints
│   │   │
│   │   ├── services/           # Business logic services
│   │   │   ├── __init__.py
│   │   │   ├── data_processor.py       # Data handling & preprocessing
│   │   │   ├── eda_service.py          # EDA calculations
│   │   │   ├── modeling_service.py     # Time series models
│   │   │   ├── evaluation_service.py   # Metrics & evaluation
│   │   │   ├── export_service.py       # Export utilities
│   │   │   └── session_manager.py      # Session management
│   │   │
│   │   └── models/             # Data models
│   │       └── __init__.py
│   │
│   └── uploads/                # Directory for uploaded CSV files
│
└── frontend/                     # Next.js React Frontend
    ├── package.json            # NPM dependencies and scripts
    ├── tsconfig.json           # TypeScript configuration
    ├── tsconfig.node.json      # Node TypeScript config
    ├── next.config.js          # Next.js configuration
    ├── tailwind.config.js      # Tailwind CSS configuration
    ├── postcss.config.js       # PostCSS configuration
    ├── .gitignore              # Git ignore file
    ├── .env.local              # Environment variables (local)
    │
    ├── app/                    # Next.js App Router
    │   ├── layout.tsx          # Root layout component
    │   ├── page.tsx            # Home page component
    │   └── globals.css         # Global styles
    │
    └── src/                    # Source code
        ├── api.ts              # API client utility
        │
        └── components/         # React components
            ├── FileUpload.tsx      # File upload component
            ├── Chart.tsx           # Time series chart component
            ├── StatCard.tsx        # Statistics display component
            ├── EDAPanel.tsx        # EDA analysis panel
            └── ModelTrainer.tsx    # Model training component
```

## File Descriptions

### Backend Core

| File | Purpose |
|------|---------|
| `app/main.py` | FastAPI application setup, route registration, middleware |
| `app/routes/upload.py` | CSV upload, file processing, data preview endpoints |
| `app/routes/eda.py` | EDA endpoints (stationarity, trend, decomposition, ACF/PACF) |
| `app/routes/modeling.py` | Model training endpoints for all 6 model types |
| `app/routes/forecast.py` | Forecast generation and confidence intervals |
| `app/routes/export.py` | JSON, CSV, and PDF export endpoints |
| `app/routes/logs.py` | Session management and execution log endpoints |
| `app/services/data_processor.py` | Data loading, validation, preprocessing, train/test split |
| `app/services/eda_service.py` | Statistical tests, decomposition, ACF/PACF calculations |
| `app/services/modeling_service.py` | Implementation of all 6 forecasting models + optimization |
| `app/services/evaluation_service.py` | Metrics calculation, residual analysis, model ranking |
| `app/services/export_service.py` | PDF generation, execution log creation, data export |
| `app/services/session_manager.py` | In-memory session storage and management |

### Frontend Core

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout, global setup |
| `app/page.tsx` | Main application page with workflow steps |
| `app/globals.css` | Global styles and Tailwind directives |
| `src/api.ts` | Axios API client, endpoint functions |
| `src/components/FileUpload.tsx` | Drag-drop file upload interface |
| `src/components/Chart.tsx` | Time series data visualization |
| `src/components/StatCard.tsx` | Statistics card display |
| `src/components/EDAPanel.tsx` | EDA results display and analysis |
| `src/components/ModelTrainer.tsx` | Model selection and training UI |

## Data Flow

```
User Browser
    ↓
Next.js Frontend (React)
    ↓ (HTTP)
FastAPI Backend (Python)
    ├── Data Processing
    ├── EDA Analysis
    ├── Model Training
    ├── Evaluation
    ├── Export
    └── Session Management
    ↓
Response
    ↓
Frontend Display
```

## Key Technologies

### Backend
- **FastAPI**: Modern Python web framework
- **Pandas**: Data manipulation and analysis
- **NumPy**: Numerical computing
- **SciPy**: Statistical functions
- **Statsmodels**: Time series analysis
- **Scikit-learn**: Machine learning utilities
- **ReportLab**: PDF generation

### Frontend
- **Next.js**: React framework
- **React**: UI library
- **Axios**: HTTP client
- **Recharts**: Chart library
- **Tailwind CSS**: Styling
- **Lucide React**: Icons

## API Response Format

All API responses follow standard JSON format:

**Success Response**
```json
{
  "success": true,
  "session_id": "uuid",
  "data": {...}
}
```

**Error Response**
```json
{
  "detail": "Error message"
}
```

## Session Management

Sessions are stored in-memory with structure:
```python
{
  'session_id': {
    'data': DataFrame,
    'metadata': dict,
    'train_data': DataFrame,
    'test_data': DataFrame,
    'eda_results': dict,
    'models_results': dict,
    'best_model': dict,
    'execution_log': dict,
    'file_path': str
  }
}
```

## Model Implementation Details

### Moving Average
- Window size configurable
- Simple sliding average

### Linear Regression
- Uses numpy polyfit
- First-order polynomial (slope + intercept)

### Simple Exponential Smoothing
- Parameter: α (alpha)
- Optimization via MSE minimization

### Holt's Linear Trend
- Parameters: α (level), β (trend)
- Handles trend but not seasonality
- Optimization via MSE minimization

### Holt-Winters Additive
- Parameters: α, β, γ
- Seasonal component added
- season_length: 12 months default
- Optimization via MSE minimization

### Holt-Winters Multiplicative
- Parameters: α, β, γ
- Seasonal component multiplied
- season_length: 12 months default
- Optimization via MSE minimization

## Configuration Files

### Backend Configuration
- `requirements.txt`: All Python packages
- `.env`: Environment variables (optional)
- Upload directory: `backend/uploads/`

### Frontend Configuration
- `package.json`: NPM packages and scripts
- `.env.local`: Local environment variables
- `tsconfig.json`: TypeScript configuration
- `tailwind.config.js`: CSS framework config

## Build Artifacts

### Backend
No build step required. Code runs directly with Python.

### Frontend
```bash
# Build directory
.next/                      # Next.js build output
.next/static/              # Static assets
.next/server/              # Server-side code
```

## Testing Approach

### Manual Testing
1. Start backend server
2. Start frontend dev server
3. Use browser and Swagger UI at `/api/docs`
4. Test with sample_data.csv

### API Testing
Access Swagger UI at `http://localhost:8000/docs`

## Environment Variables

### Backend (.env)
```
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=52428800
HOST=0.0.0.0
PORT=8000
DEBUG=False
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_DEBUG=false
```

## Performance Optimization

### Backend
- NumPy vectorization for calculations
- Efficient pandas operations
- MSE optimization using scipy.minimize
- In-memory session caching

### Frontend
- Code splitting with Next.js
- Lazy loading of components
- TailwindCSS purging
- Recharts lazy rendering

## Security Considerations

### Current Implementation
- CORS enabled for all origins (development)
- No authentication
- File uploads to server directory

### Production Recommendations
- Implement JWT authentication
- Restrict CORS to specific domains
- Validate file uploads
- Sanitize file names
- Set upload size limits
- Use HTTPS only
- Implement rate limiting
- Add request validation

## Scalability

### Limitations
- In-memory session storage (not persistent)
- Single process execution
- No database backend

### Scaling Recommendations
- Use Redis for session storage
- Deploy with multiple workers (Gunicorn)
- Use database (PostgreSQL) for persistence
- Implement caching layer
- Use cloud storage for uploads
- Containerize with Docker
- Deploy on Kubernetes
