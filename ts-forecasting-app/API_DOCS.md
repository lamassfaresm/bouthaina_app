# API Documentation

Complete API reference for Time Series Forecasting Application.

## Base URL

```
http://localhost:8000/api
```

## Health Check

### GET /health
Check API health status.

**Response (200)**
```json
{
  "status": "healthy"
}
```

## Upload Endpoints

### POST /upload/csv
Upload and process a CSV file.

**Request**
- Content-Type: multipart/form-data
- file: CSV file (required)

**Response (200)**
```json
{
  "session_id": "uuid-string",
  "success": true,
  "file_name": "AirPassengers.csv",
  "metadata": {
    "rows": 144,
    "date_range": {
      "start": "1949-01-01T00:00:00",
      "end": "1960-12-01T00:00:00"
    },
    "date_column": "Month",
    "value_column": "#Passengers",
    "missing_values": 0,
    "duplicates": 0
  },
  "summary_statistics": {
    "count": 144,
    "mean": 280.3,
    "std": 119.97,
    "min": 104.0,
    "max": 622.0,
    "median": 265.5,
    "q25": 180.0,
    "q75": 360.5,
    "skewness": 0.85,
    "kurtosis": 0.12
  },
  "data_preview": {
    "dates": ["1949-01-01", "1949-02-01", ...],
    "values": [112, 118, 132, ...]
  }
}
```

**Error (400)**
```json
{
  "detail": "File must be a CSV"
}
```

### GET /upload/preview/{session_id}
Get full data preview.

**Parameters**
- session_id: string (path)

**Response (200)**
```json
{
  "total_rows": 144,
  "preview": {
    "dates": [...],
    "values": [...]
  }
}
```

## EDA Endpoints

### GET /eda/{session_id}
Run complete exploratory data analysis.

**Parameters**
- session_id: string (path)

**Response (200)**
```json
{
  "success": true,
  "session_id": "uuid",
  "summary_statistics": {...},
  "eda_results": {
    "adf_test": {
      "test_statistic": -2.87,
      "p_value": 0.052,
      "n_lags": 6,
      "n_obs": 138,
      "critical_values": {
        "1%": -3.48,
        "5%": -2.89,
        "10%": -2.58
      },
      "is_stationary": false,
      "interpretation": "Non-stationary"
    },
    "kpss_test": {...},
    "trend_detection": {
      "slope": 0.35,
      "direction": "Increasing",
      "strength": 0.85,
      "slope_magnitude": 0.35
    },
    "seasonal_decomposition": {
      "trend": [...],
      "seasonal": [...],
      "residual": [...],
      "observed": [...]
    },
    "acf": {
      "acf": [...],
      "lags": [0, 1, 2, ...],
      "confidence_interval": [...]
    },
    "pacf": {
      "pacf": [...],
      "lags": [0, 1, 2, ...]
    }
  }
}
```

### GET /eda/{session_id}/stationarity
Get stationarity test results.

**Response (200)**
```json
{
  "session_id": "uuid",
  "adf_test": {...},
  "kpss_test": {...}
}
```

### GET /eda/{session_id}/trend
Get trend analysis results.

**Response (200)**
```json
{
  "session_id": "uuid",
  "trend_detection": {
    "slope": 0.35,
    "direction": "Increasing",
    "strength": 0.85,
    "slope_magnitude": 0.35
  }
}
```

### GET /eda/{session_id}/decomposition?period=12
Get seasonal decomposition.

**Parameters**
- session_id: string (path)
- period: integer (query, default: 12)

**Response (200)**
```json
{
  "session_id": "uuid",
  "period": 12,
  "decomposition": {
    "trend": [...],
    "seasonal": [...],
    "residual": [...],
    "observed": [...]
  }
}
```

### GET /eda/{session_id}/acf?nlags=40
Get autocorrelation function.

**Parameters**
- session_id: string (path)
- nlags: integer (query, default: 40)

**Response (200)**
```json
{
  "session_id": "uuid",
  "acf": {
    "acf": [1.0, 0.95, 0.88, ...],
    "lags": [0, 1, 2, ...],
    "confidence_interval": [[−0.1, 0.1], ...]
  }
}
```

### GET /eda/{session_id}/pacf?nlags=40
Get partial autocorrelation function.

**Parameters**
- session_id: string (path)
- nlags: integer (query, default: 40)

**Response (200)**
```json
{
  "session_id": "uuid",
  "pacf": {
    "pacf": [1.0, 0.92, 0.15, ...],
    "lags": [0, 1, 2, ...]
  }
}
```

## Modeling Endpoints

### POST /modeling/{session_id}/split
Split data into training and testing sets.

**Parameters**
- session_id: string (path)

**Request Body**
```json
{
  "test_ratio": 0.3,
  "forecast_steps": 12
}
```

**Response (200)**
```json
{
  "success": true,
  "session_id": "uuid",
  "train_size": 100,
  "test_size": 44,
  "test_ratio": 0.3,
  "train_date_range": {
    "start": "1949-01-01",
    "end": "1953-08-01"
  },
  "test_date_range": {
    "start": "1953-09-01",
    "end": "1960-12-01"
  }
}
```

### POST /modeling/{session_id}/moving-average
Train Moving Average model.

**Request Body**
```json
{
  "window": 3,
  "forecast_steps": 12
}
```

**Response (200)**
```json
{
  "success": true,
  "session_id": "uuid",
  "model": {
    "model": "Moving Average",
    "window": 3,
    "fitted": [...],
    "forecast": [...],
    "metrics": {
      "mse": 1234.5,
      "rmse": 35.14,
      "mae": 28.9,
      "mape": 10.5,
      "aic": 856.3,
      "bic": 866.2,
      "aicc": 858.4
    },
    "test_predictions": [...]
  }
}
```

### POST /modeling/{session_id}/linear-regression
Train Linear Regression model.

**Request Body**
```json
{
  "test_ratio": 0.3,
  "forecast_steps": 12
}
```

**Response (200)**
```json
{
  "success": true,
  "session_id": "uuid",
  "model": {
    "model": "Linear Regression",
    "slope": 2.35,
    "intercept": 100.5,
    "fitted": [...],
    "forecast": [...],
    "metrics": {...},
    "test_predictions": [...]
  }
}
```

### POST /modeling/{session_id}/ses
Train Simple Exponential Smoothing model.

**Request Body**
```json
{
  "alpha": 0.3,
  "forecast_steps": 12,
  "optimize": true
}
```

**Response (200)**
```json
{
  "success": true,
  "session_id": "uuid",
  "model": {
    "model": "Simple Exponential Smoothing",
    "alpha": 0.28,
    "fitted": [...],
    "forecast": [...],
    "metrics": {...},
    "test_predictions": [...]
  },
  "optimized": true
}
```

### POST /modeling/{session_id}/holt
Train Holt's Linear Trend model.

**Request Body**
```json
{
  "alpha": 0.3,
  "beta": 0.1,
  "forecast_steps": 12,
  "optimize": true
}
```

**Response (200)**
```json
{
  "success": true,
  "session_id": "uuid",
  "model": {
    "model": "Holt Linear Trend",
    "alpha": 0.25,
    "beta": 0.08,
    "fitted": [...],
    "forecast": [...],
    "metrics": {...},
    "test_predictions": [...]
  },
  "optimized": true
}
```

### POST /modeling/{session_id}/holt-winters-additive
Train Holt-Winters Additive model.

**Request Body**
```json
{
  "alpha": 0.3,
  "beta": 0.1,
  "gamma": 0.1,
  "season_length": 12,
  "forecast_steps": 12,
  "optimize": true
}
```

**Response (200)**
```json
{
  "success": true,
  "session_id": "uuid",
  "model": {
    "model": "Holt-Winters Additive",
    "alpha": 0.28,
    "beta": 0.09,
    "gamma": 0.12,
    "season_length": 12,
    "fitted": [...],
    "forecast": [...],
    "metrics": {...},
    "test_predictions": [...]
  },
  "optimized": true
}
```

### POST /modeling/{session_id}/holt-winters-multiplicative
Train Holt-Winters Multiplicative model.

**Request Body**
```json
{
  "alpha": 0.3,
  "beta": 0.1,
  "gamma": 0.1,
  "season_length": 12,
  "forecast_steps": 12,
  "optimize": true
}
```

**Response (200)**
```json
{
  "success": true,
  "session_id": "uuid",
  "model": {
    "model": "Holt-Winters Multiplicative",
    "alpha": 0.27,
    "beta": 0.08,
    "gamma": 0.11,
    "season_length": 12,
    "fitted": [...],
    "forecast": [...],
    "metrics": {...},
    "test_predictions": [...]
  },
  "optimized": true
}
```

## Forecast Endpoints

### GET /forecast/{session_id}/residuals?model_name=Moving%20Average
Get residual analysis for a model.

**Parameters**
- session_id: string (path)
- model_name: string (query)

**Response (200)**
```json
{
  "session_id": "uuid",
  "model": "Moving Average",
  "message": "Residual analysis available after model training"
}
```

### GET /forecast/{session_id}/confidence-intervals?model_name=MA&confidence=0.95
Get confidence intervals for forecast.

**Parameters**
- session_id: string (path)
- model_name: string (query)
- confidence: float (query, default: 0.95)

**Response (200)**
```json
{
  "session_id": "uuid",
  "model": "Moving Average",
  "confidence_level": 0.95,
  "standard_error": 28.5,
  "margin_of_error": 55.8
}
```

## Export Endpoints

### POST /export/{session_id}/execution-log
Get execution log.

**Response (200)**
```json
{
  "execution_timestamp": "2024-01-01T12:00:00.123456",
  "data_preprocessing": {...},
  "train_test_split": {...},
  "eda_results": {...},
  "models_tested": [...],
  "best_model": {...},
  "summary": {...}
}
```

### POST /export/{session_id}/forecast-csv?model_name=Moving%20Average
Export forecast as CSV.

**Response (200)**
CSV file download with columns: date, actual, predicted

### POST /export/{session_id}/forecast-json?model_name=Moving%20Average
Export forecast as JSON.

**Response (200)**
```json
{
  "session_id": "uuid",
  "model": "Moving Average",
  "forecast": [...],
  "format": "json"
}
```

### POST /export/{session_id}/report-pdf
Generate comprehensive PDF report.

**Response (200)**
PDF file download with complete analysis report

## Logs Endpoints

### POST /logs/{session_id}/create-execution-log
Create structured execution log.

**Request Body**
```json
{
  "train_size": 100,
  "test_size": 44
}
```

**Response (200)**
```json
{
  "success": true,
  "session_id": "uuid",
  "log": {
    "execution_timestamp": "2024-01-01T12:00:00.123456",
    "data_preprocessing": {...},
    "train_test_split": {...},
    "eda_results": {...},
    "models_tested": [...],
    "best_model": {...},
    "summary": {
      "total_models": 6,
      "best_model_name": "Holt-Winters Multiplicative",
      "best_model_rank": 1,
      "best_rmse": 24.3,
      "best_mae": 19.2
    }
  }
}
```

### GET /logs/{session_id}/execution-log
Get execution log.

**Response (200)**
Same as create-execution-log response body

### GET /logs/sessions/list
List all active sessions.

**Response (200)**
```json
{
  "sessions": {
    "uuid1": "active",
    "uuid2": "active"
  },
  "total": 2
}
```

### DELETE /logs/{session_id}
Delete a session.

**Response (200)**
```json
{
  "success": true,
  "message": "Session {session_id} deleted"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Error message describing what went wrong"
}
```

### 404 Not Found
```json
{
  "detail": "Session not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## Rate Limiting

No rate limiting applied. Requests should be throttled by client for large operations.

## Timeout

Default request timeout: 60 seconds

## Content Types

- Request: application/json (except file uploads: multipart/form-data)
- Response: application/json (except file downloads: application/octet-stream, application/pdf)

## Authentication

Currently no authentication. For production, implement JWT or API key authentication.

## CORS

CORS enabled for all origins. For production, restrict to specific domains.

## Versioning

Current version: 1.0.0

## Interactive API Explorer

Access at `http://localhost:8000/docs` (Swagger UI)
Or `http://localhost:8000/redoc` (ReDoc)
