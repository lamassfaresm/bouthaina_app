"""Export endpoints."""
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from pydantic import BaseModel
from typing import Optional
import json
from app.services.session_manager import SessionManager
from app.services.export_service import ExportService
import pandas as pd

router = APIRouter(prefix="/api/export", tags=["export"])

class ExportConfig(BaseModel):
    format: str  # json, csv, pdf
    model_name: Optional[str] = None

@router.post("/{session_id}/execution-log")
async def export_execution_log(session_id: str):
    """Export execution log."""
    try:
        session = SessionManager.get_session(session_id)
        if not session or session.get('execution_log') is None:
            raise HTTPException(status_code=404, detail="Execution log not found")
        
        log = session['execution_log']
        
        return JSONResponse(content=log)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{session_id}/forecast-csv")
async def export_forecast_csv(session_id: str, model_name: str):
    """Export forecast as CSV."""
    try:
        session = SessionManager.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Create forecast dataframe from session data
        # This is a placeholder - actual implementation would use stored forecasts
        
        return {
            'message': 'Forecast CSV export available after model training',
            'format': 'csv'
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{session_id}/forecast-json")
async def export_forecast_json(session_id: str, model_name: str):
    """Export forecast as JSON."""
    try:
        session = SessionManager.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {
            'message': 'Forecast JSON export available after model training',
            'format': 'json'
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{session_id}/report-pdf")
async def export_report_pdf(session_id: str):
    """Export comprehensive PDF report."""
    try:
        session = SessionManager.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        # If execution_log is missing, build a minimal one so the report still works
        analysis_log = session.get('execution_log')
        if analysis_log is None:
            metadata = session.get('metadata', {})
            analysis_log = {
                "execution_timestamp": None,
                "data_preprocessing": {
                    "rows": metadata.get("rows"),
                    "date_range": metadata.get("date_range", {}),
                    "missing_values": metadata.get("missing_values"),
                    "duplicates": metadata.get("duplicates"),
                },
                "eda_results": session.get("eda_results", {}),
                "models_tested": session.get("models_tested", []),
                "best_model": session.get("best_model", {}),
            }

        pdf_buffer = ExportService.create_pdf_report(analysis_log)

        pdf_bytes = pdf_buffer.getvalue()

        return StreamingResponse(
            iter([pdf_bytes]),
            media_type="application/pdf",
            headers={"Content-Disposition": 'attachment; filename="time_series_forecast_report.pdf"'},
        )
    except ImportError:
        raise HTTPException(
            status_code=400,
            detail="PDF export requires reportlab. Install with: pip install reportlab",
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{session_id}/all-models-json")
async def export_all_models(session_id: str):
    """Export all model results as JSON."""
    try:
        session = SessionManager.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        models_results = session.get('models_results', {})
        
        return {
            'session_id': session_id,
            'models': models_results,
            'format': 'json'
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
