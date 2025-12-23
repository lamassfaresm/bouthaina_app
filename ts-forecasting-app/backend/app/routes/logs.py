"""Logs endpoints."""
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from app.services.session_manager import SessionManager
from app.services.export_service import ExportService

router = APIRouter(prefix="/api/logs", tags=["logs"])

@router.post("/{session_id}/create-execution-log")
async def create_execution_log(
    session_id: str,
    train_size: int,
    test_size: int
):
    """Create execution log after all analysis and modeling."""
    try:
        session = SessionManager.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Compile execution log
        execution_log = ExportService.create_execution_log(
            data_prep=session.get('metadata', {}),
            eda_results=session.get('eda_results', {}),
            models_tested=session.get('models_tested', []),
            best_model=session.get('best_model', {}),
            train_size=train_size,
            test_size=test_size
        )
        
        # Store in session
        SessionManager.update_session(session_id, 'execution_log', execution_log)
        
        return {
            'success': True,
            'session_id': session_id,
            'log': execution_log
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{session_id}/execution-log")
async def get_execution_log(session_id: str):
    """Get execution log."""
    try:
        session = SessionManager.get_session(session_id)
        if not session or session.get('execution_log') is None:
            raise HTTPException(status_code=404, detail="Execution log not found")
        
        return JSONResponse(content=session['execution_log'])
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/sessions/list")
async def list_sessions():
    """List all active sessions."""
    try:
        sessions = SessionManager.list_sessions()
        return {
            'sessions': sessions,
            'total': len(sessions)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{session_id}")
async def delete_session(session_id: str):
    """Delete a session."""
    try:
        SessionManager.delete_session(session_id)
        return {
            'success': True,
            'message': f'Session {session_id} deleted'
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
