"""Upload endpoint for CSV files."""
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, Response
import os
import uuid
from app.services.data_processor import DataProcessor
from app.services.session_manager import SessionManager

router = APIRouter(prefix="/api/upload", tags=["upload"])

data_processor = DataProcessor(upload_dir="uploads")

@router.options("/csv")
async def upload_csv_options():
    """Handle CORS preflight for upload."""
    return Response(status_code=204)


@router.get("/csv")
async def upload_csv_get():
    """Graceful response for accidental GET requests."""
    return {"detail": "Use POST /api/upload/csv with multipart/form-data"}


@router.post("/csv")
async def upload_csv(file: UploadFile = File(...)):
    """Upload and process a CSV file."""
    try:
        # Validate file
        if not file.filename or not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV")
        
        # Create session
        session_id = str(uuid.uuid4())
        SessionManager.create_session(session_id)
        
        # Save file
        os.makedirs("uploads", exist_ok=True)
        file_path = os.path.join("uploads", f"{session_id}.csv")
        with open(file_path, 'wb') as f:
            f.write(await file.read())
        
        # Process file
        df, metadata = data_processor.process_csv(file_path)
        
        # Get summary statistics
        stats = data_processor.get_summary_statistics(df)
        
        # Store in session
        SessionManager.update_session(session_id, 'data', df)
        SessionManager.update_session(session_id, 'metadata', metadata)
        SessionManager.update_session(session_id, 'file_path', file_path)
        
        return {
            'session_id': session_id,
            'success': True,
            'file_name': file.filename,
            'metadata': metadata,
            'summary_statistics': stats,
            'data_preview': {
                'dates': df['date'].astype(str).head(10).tolist(),
                'values': df['value'].head(10).tolist()
            }
        }
    except Exception as e:
        print(f"Upload error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Upload failed: {str(e)}")

@router.get("/preview/{session_id}")
async def preview_data(session_id: str):
    """Get data preview."""
    try:
        session = SessionManager.get_session(session_id)
        if not session or session['data'] is None:
            raise HTTPException(status_code=404, detail="Session not found")
        
        df = session['data']
        # Format data as array of objects with date and value
        data_list = []
        for _, row in df.iterrows():
            data_list.append({
                'date': row['date'].isoformat() if hasattr(row['date'], 'isoformat') else str(row['date']),
                'value': float(row['value'])
            })
        
        return {
            'total_rows': len(df),
            'preview': data_list
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
