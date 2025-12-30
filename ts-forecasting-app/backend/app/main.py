from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.routes import upload, eda, modeling, forecast, export, logs

# Initialize FastAPI app
app = FastAPI(
    title="Time Series Forecasting API",
    description="Complete time series forecasting with EDA, modeling, and export",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["bouthaina-app-p6yy-3ahik82nv-bouthainas-projects-0629f098.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload.router)
app.include_router(eda.router)
app.include_router(modeling.router)
app.include_router(forecast.router)
app.include_router(export.router)
app.include_router(logs.router)

@app.get("/")
async def root():
    return {"message": "Time Series Forecasting API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
