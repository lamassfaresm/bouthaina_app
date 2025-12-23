# Time Series Forecasting Application - Complete Package

## 📚 Documentation Index

### Getting Started
1. **[README.md](./README.md)** - Main documentation with full feature overview
2. **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute setup and basic usage
3. **[INSTALLATION.md](./INSTALLATION.md)** - Detailed installation instructions

### Technical Reference
4. **[API_DOCS.md](./API_DOCS.md)** - Complete API endpoint documentation
5. **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Directory structure and architecture
6. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guides

## 🚀 Quick Start

### In 3 Steps:

```bash
# 1. Backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload

# 2. Frontend (new terminal)
cd frontend
npm install
echo NEXT_PUBLIC_API_URL=http://localhost:8000/api > .env.local
npm run dev

# 3. Open http://localhost:3000
```

## 📦 What's Included

### Backend (FastAPI + Python)
- ✅ 6 forecasting models (MA, LR, SES, Holt, HW-Add, HW-Mult)
- ✅ Automatic parameter optimization
- ✅ 7 statistical tests (ADF, KPSS, Shapiro-Wilk, Ljung-Box, etc.)
- ✅ Seasonal decomposition & trend detection
- ✅ 7 evaluation metrics (MSE, RMSE, MAE, MAPE, AIC, BIC, AICc)
- ✅ Automatic model ranking and selection
- ✅ JSON, CSV, PDF export
- ✅ Structured execution logs
- ✅ RESTful API with Swagger documentation

### Frontend (Next.js + React + TailwindCSS)
- ✅ Beautiful, responsive UI
- ✅ Drag-drop file upload
- ✅ Interactive data visualization
- ✅ Multi-step workflow
- ✅ Real-time feedback
- ✅ Export functionality
- ✅ Mobile-friendly design

## 🎯 Features Overview

### Data Upload & Preview
- Automatic date/value column detection
- CSV validation
- Data summary statistics
- Missing value detection

### Exploratory Data Analysis
- Summary statistics (mean, std, min, max, quartiles)
- Stationarity tests (ADF, KPSS)
- Trend analysis
- Seasonal decomposition (additive)
- Autocorrelation (ACF)
- Partial autocorrelation (PACF)

### Time Series Models
| Model | Type | Seasons | Parameters |
|-------|------|---------|-----------|
| Moving Average | Simple | No | window |
| Linear Regression | Trend | No | slope, intercept |
| SES | Smoothing | No | α |
| Holt | Trend | No | α, β |
| HW Additive | Seasonal | Yes | α, β, γ |
| HW Multiplicative | Seasonal | Yes | α, β, γ |

### Evaluation & Selection
- Train/test split (configurable)
- 7 performance metrics
- Residual analysis
- Automatic best model selection
- Ranking system

### Export Options
- JSON export
- CSV export
- PDF report (with statistics)
- Execution log (JSON)

## 📊 Sample Data

The application includes `sample_data.csv` (AirPassengers dataset):
- 144 monthly records (1949-1960)
- Perfect for testing seasonal models
- Try it first to explore all features

## 🔧 Technology Stack

### Backend
- Python 3.8+
- FastAPI 0.104
- Pandas 2.1
- NumPy 1.26
- SciPy 1.11
- Statsmodels 0.14
- Scikit-learn 1.3

### Frontend
- Node.js 16+
- Next.js 14
- React 18
- Tailwind CSS 3.3
- Recharts 2.10
- Axios 1.6

## 📖 Documentation Files

### Core Files
```
ts-forecasting-app/
├── README.md               # Full feature documentation
├── QUICKSTART.md          # Quick setup guide
├── INSTALLATION.md        # Detailed installation
├── API_DOCS.md           # API reference
├── PROJECT_STRUCTURE.md  # Architecture & structure
├── DEPLOYMENT.md         # Production deployment
└── INDEX.md              # This file
```

### Sample Data
```
├── sample_data.csv       # AirPassengers (144 records)
```

### Backend
```
backend/
├── requirements.txt      # Python dependencies
├── app/
│   ├── main.py          # FastAPI app
│   ├── routes/          # 6 endpoint modules
│   └── services/        # 6 service modules
└── uploads/             # Upload directory
```

### Frontend
```
frontend/
├── package.json         # NPM configuration
├── app/                # Next.js app router
├── src/
│   ├── api.ts          # API client
│   └── components/     # 5 React components
└── tailwind.config.js  # CSS config
```

## 🎓 Typical Workflow

1. **Upload** - Drop CSV file with date + value columns
2. **Preview** - Review data statistics and date range
3. **Analyze** - Explore EDA results (trends, seasonality, stationarity)
4. **Train** - Select and train forecasting models
5. **Evaluate** - Compare model performance on test set
6. **Export** - Download results (JSON, CSV, PDF)
7. **Review** - Check execution log with complete analysis

## 🔌 API Endpoints

Quick reference:

```
Upload:      POST   /api/upload/csv
             GET    /api/upload/preview/{id}

EDA:         GET    /api/eda/{id}
             GET    /api/eda/{id}/stationarity
             GET    /api/eda/{id}/trend
             GET    /api/eda/{id}/decomposition
             GET    /api/eda/{id}/acf
             GET    /api/eda/{id}/pacf

Modeling:    POST   /api/modeling/{id}/split
             POST   /api/modeling/{id}/moving-average
             POST   /api/modeling/{id}/linear-regression
             POST   /api/modeling/{id}/ses
             POST   /api/modeling/{id}/holt
             POST   /api/modeling/{id}/holt-winters-additive
             POST   /api/modeling/{id}/holt-winters-multiplicative

Export:      POST   /api/export/{id}/execution-log
             POST   /api/export/{id}/forecast-json
             POST   /api/export/{id}/forecast-csv
             POST   /api/export/{id}/report-pdf

Logs:        POST   /api/logs/{id}/create-execution-log
             GET    /api/logs/{id}/execution-log
             GET    /api/logs/sessions/list
             DELETE /api/logs/{id}
```

Full details in [API_DOCS.md](./API_DOCS.md)

## 🐛 Troubleshooting

### Common Issues

**Backend won't start**
- Check Python version (need 3.8+)
- Verify all dependencies: `pip install -r requirements.txt`
- Check port 8000 is free

**Frontend won't load**
- Check Node.js version (need 16+)
- Clear node_modules: `rm -rf node_modules && npm install`
- Verify .env.local has correct API URL

**API connection error**
- Ensure backend running on port 8000
- Check .env.local NEXT_PUBLIC_API_URL
- Look for CORS errors in browser console

**CSV upload fails**
- File must have date column (recognizable format)
- File must have numeric value column
- No duplicate dates allowed

See [INSTALLATION.md](./INSTALLATION.md) for more troubleshooting

## 📚 Learning Path

1. **Start**: Read [README.md](./README.md) for overview
2. **Setup**: Follow [QUICKSTART.md](./QUICKSTART.md)
3. **API**: Explore [API_DOCS.md](./API_DOCS.md)
4. **Architecture**: Review [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
5. **Production**: Study [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🎨 Key Features Highlights

### Smart Features
- ✨ Automatic column detection
- 🤖 Parameter optimization for smoothing models
- 🏆 Automatic model ranking
- 📊 Multiple visualization types
- 📁 Multiple export formats

### Statistical Rigor
- Stationarity testing (ADF, KPSS)
- Residual diagnostics (normality, autocorrelation)
- Information criteria (AIC, BIC, AICc)
- Confidence intervals for forecasts

### User Experience
- Intuitive multi-step workflow
- Real-time feedback
- Mobile responsive design
- Detailed analysis reports
- Export everything

## 🔐 Security Notes

Current implementation:
- CORS open to all origins (development)
- No authentication required
- Files stored on server

For production:
- Implement JWT authentication
- Restrict CORS to specific domains
- Use secure file storage
- Add rate limiting
- Enable HTTPS only

See [DEPLOYMENT.md](./DEPLOYMENT.md) for security recommendations

## 📈 Scaling Recommendations

**Current capacity**: Single instance, ~100 concurrent users

**For production**:
- Load balancer (Nginx)
- Multiple backend workers
- Redis for session storage
- Database for persistence
- CDN for static files
- Cloud storage for uploads

## 📝 License

MIT License - Free to use and modify

## 🤝 Contributing

Contributions welcome! Areas for enhancement:
- Additional forecasting models (ARIMA, Prophet, LSTM)
- Database backend
- User authentication
- Advanced visualization
- Mobile app
- Real-time forecast updates

## 📞 Support

For help:
1. Check relevant documentation file
2. Review API docs at `http://localhost:8000/docs`
3. Check browser console (F12) for errors
4. Review application logs in terminal

## ✅ Verification Checklist

- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] Virtual environment created
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend running on 8000
- [ ] Frontend running on 3000
- [ ] Can access http://localhost:3000
- [ ] Can upload CSV file
- [ ] Can run EDA analysis
- [ ] Can train models
- [ ] Can export results

## 🎉 You're All Set!

Everything is ready to go. Start with [QUICKSTART.md](./QUICKSTART.md) and enjoy forecasting!

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Status**: Production Ready
