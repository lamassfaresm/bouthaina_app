"""Global storage for session data."""
from typing import Dict, Any, Optional

class SessionManager:
    """Manage session data across requests."""
    
    _sessions: Dict[str, Dict[str, Any]] = {}
    
    @classmethod
    def create_session(cls, session_id: str) -> None:
        """Create a new session."""
        cls._sessions[session_id] = {
            'data': None,
            'metadata': None,
            'eda_results': None,
            'models_results': None,
            'best_model': None,
            'forecast_results': None,
            'execution_log': None
        }
    
    @classmethod
    def get_session(cls, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session data."""
        return cls._sessions.get(session_id)
    
    @classmethod
    def update_session(cls, session_id: str, key: str, value: Any) -> None:
        """Update session data."""
        if session_id not in cls._sessions:
            cls.create_session(session_id)
        cls._sessions[session_id][key] = value
    
    @classmethod
    def delete_session(cls, session_id: str) -> None:
        """Delete session."""
        if session_id in cls._sessions:
            del cls._sessions[session_id]
    
    @classmethod
    def list_sessions(cls) -> Dict[str, str]:
        """List all sessions."""
        return {sid: 'active' for sid in cls._sessions.keys()}
