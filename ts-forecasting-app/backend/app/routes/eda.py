"""EDA endpoints."""
from fastapi import APIRouter, HTTPException
from app.services.session_manager import SessionManager
from app.services.eda_service import EDAService
from app.services.data_processor import DataProcessor
import numpy as np

router = APIRouter(prefix="/api/eda", tags=["eda"])
data_processor = DataProcessor()

@router.get("/{session_id}")
async def run_eda(session_id: str):
    """Run complete EDA analysis."""
    try:
        session = SessionManager.get_session(session_id)
        if not session or session['data'] is None:
            raise HTTPException(status_code=404, detail="Session not found")
        
        df = session['data']
        
        # Run full EDA
        eda_results = EDAService.full_eda(df)
        
        # Get summary statistics
        stats = data_processor.get_summary_statistics(df)
        
        # Store results
        SessionManager.update_session(session_id, 'eda_results', eda_results)
        
        return {
            'success': True,
            'session_id': session_id,
            'summary_statistics': stats,
            'eda_results': eda_results
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{session_id}/stationarity")
async def stationarity_tests(session_id: str):
    """Get stationarity test results."""
    try:
        session = SessionManager.get_session(session_id)
        if not session or session['data'] is None:
            raise HTTPException(status_code=404, detail="Session not found")
        
        df = session['data']
        values = df['value'].values
        
        return {
            'session_id': session_id,
            'adf_test': EDAService.adf_test(values),
            'kpss_test': EDAService.kpss_test(values)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{session_id}/trend")
async def trend_analysis(session_id: str):
    """Get trend analysis."""
    try:
        session = SessionManager.get_session(session_id)
        if not session or session['data'] is None:
            raise HTTPException(status_code=404, detail="Session not found")
        
        df = session['data']
        values = df['value'].values
        
        return {
            'session_id': session_id,
            'trend_detection': EDAService.detect_trend(values)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{session_id}/decomposition")
async def seasonal_decomposition(session_id: str, period: int = 12):
    """Get seasonal decomposition."""
    try:
        session = SessionManager.get_session(session_id)
        if not session or session['data'] is None:
            raise HTTPException(status_code=404, detail="Session not found")
        
        df = session['data']
        
        return {
            'session_id': session_id,
            'period': period,
            'decomposition': EDAService.seasonal_decomposition(df, period=period)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{session_id}/acf")
async def acf_analysis(session_id: str, nlags: int = 40):
    """Get ACF analysis."""
    try:
        session = SessionManager.get_session(session_id)
        if not session or session['data'] is None:
            raise HTTPException(status_code=404, detail="Session not found")
        
        df = session['data']
        values = df['value'].values
        
        return {
            'session_id': session_id,
            'acf': EDAService.calculate_acf(values, nlags=nlags)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{session_id}/pacf")
async def pacf_analysis(session_id: str, nlags: int = 40):
    """Get PACF analysis."""
    try:
        session = SessionManager.get_session(session_id)
        if not session or session['data'] is None:
            raise HTTPException(status_code=404, detail="Session not found")
        
        df = session['data']
        values = df['value'].values
        
        return {
            'session_id': session_id,
            'pacf': EDAService.calculate_pacf(values, nlags=nlags)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
