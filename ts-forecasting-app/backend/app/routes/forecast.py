"""Forecast endpoints."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.services.session_manager import SessionManager
from app.services.evaluation_service import ResidualAnalysis
import numpy as np

router = APIRouter(prefix="/api/forecast", tags=["forecast"])

@router.get("/{session_id}/residuals")
async def get_residuals(session_id: str, model_name: str):
    """Get residual analysis for a model."""
    try:
        session = SessionManager.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # This would require storing model predictions
        # For now, returning a placeholder
        return {
            'session_id': session_id,
            'model': model_name,
            'message': 'Residual analysis available after model training'
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{session_id}/confidence-intervals")
async def get_confidence_intervals(session_id: str, model_name: str, confidence: float = 0.95):
    """Get confidence intervals for forecast."""
    try:
        session = SessionManager.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Calculate confidence intervals based on test predictions variance
        test_data = session.get('test_data')
        if test_data is None:
            raise HTTPException(status_code=404, detail="Test data not found")
        
        # Get standard error from test predictions
        test_values = test_data['value'].values
        se = np.std(test_values)
        
        # Get z-score for confidence level
        from scipy.stats import norm
        z_score = norm.ppf((1 + confidence) / 2)
        
        return {
            'session_id': session_id,
            'model': model_name,
            'confidence_level': confidence,
            'standard_error': float(se),
            'margin_of_error': float(z_score * se)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{session_id}/models-comparison")
async def compare_models(session_id: str):
    """Compare all trained models."""
    try:
        session = SessionManager.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # This would require storing all model results
        return {
            'session_id': session_id,
            'message': 'Models comparison available after training all models'
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
