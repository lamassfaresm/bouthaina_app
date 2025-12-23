"""Export service for various output formats."""
import json
import pandas as pd
import numpy as np
from typing import Dict, Any, List
from datetime import datetime
from io import BytesIO
import base64

try:
    from reportlab.lib.pagesizes import letter, A4  # type: ignore
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle  # type: ignore
    from reportlab.lib.units import inch  # type: ignore
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak  # type: ignore
    from reportlab.lib import colors  # type: ignore
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT  # type: ignore
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False
    SimpleDocTemplate = None  # type: ignore
    letter = None  # type: ignore
    getSampleStyleSheet = None  # type: ignore
    ParagraphStyle = None  # type: ignore
    colors = None  # type: ignore
    TA_CENTER = None  # type: ignore
    Paragraph = None  # type: ignore
    Spacer = None  # type: ignore
    Table = None  # type: ignore
    TableStyle = None  # type: ignore
    PageBreak = None  # type: ignore
    inch = None  # type: ignore
    A4 = None  # type: ignore


class ExportService:
    """Export analysis results in various formats."""
    
    @staticmethod
    def to_json(data: Dict[str, Any]) -> str:
        """Export data as JSON."""
        return json.dumps(data, indent=2, default=str)
    
    @staticmethod
    def to_csv(forecast_df: pd.DataFrame, filename: str = "forecast.csv") -> bytes:
        """Export forecast as CSV."""
        csv_data = forecast_df.to_csv(index=False)
        return csv_data.encode('utf-8')
    
    @staticmethod
    def create_pdf_report(analysis_log: Dict[str, Any]) -> BytesIO:
        """Create comprehensive PDF report."""
        if not HAS_REPORTLAB:
            raise ImportError("reportlab is required for PDF export")
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)  # type: ignore
        story = []
        styles = getSampleStyleSheet()  # type: ignore
        
        # Custom styles
        title_style = ParagraphStyle(  # type: ignore
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a1a1a'),  # type: ignore
            spaceAfter=30,
            alignment=TA_CENTER  # type: ignore
        )
        
        heading_style = ParagraphStyle(  # type: ignore
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#333333'),  # type: ignore
            spaceAfter=12,
            spaceBefore=12
        )
        
        # Title
        story.append(Paragraph("Time Series Forecasting Report", title_style))  # type: ignore
        story.append(Spacer(1, 12))  # type: ignore
        
        # Metadata
        story.append(Paragraph("Report Information", heading_style))  # type: ignore
        timestamp = analysis_log.get('execution_timestamp', 'N/A')
        story.append(Paragraph(f"<b>Generated:</b> {timestamp}", styles['Normal']))  # type: ignore
        story.append(Spacer(1, 12))  # type: ignore
        
        # Data Summary
        if 'data_preprocessing' in analysis_log:
            story.append(Paragraph("Data Preprocessing", heading_style))  # type: ignore
            prep = analysis_log['data_preprocessing']
            story.append(Paragraph(f"<b>Rows Processed:</b> {prep.get('rows', 'N/A')}", styles['Normal']))  # type: ignore
            story.append(Paragraph(f"<b>Date Range:</b> {prep.get('date_range', {}).get('start', 'N/A')} to {prep.get('date_range', {}).get('end', 'N/A')}", styles['Normal']))  # type: ignore
            story.append(Spacer(1, 12))  # type: ignore
        
        # EDA Results
        if 'eda_results' in analysis_log:
            story.append(Paragraph("Exploratory Data Analysis", heading_style))  # type: ignore
            eda = analysis_log['eda_results']
            
            if 'adf_test' in eda:
                adf = eda['adf_test']
                story.append(Paragraph(f"<b>ADF Test:</b> {adf.get('interpretation', 'N/A')} (p-value: {adf.get('p_value', 'N/A'):.4f})", styles['Normal']))  # type: ignore
            
            if 'trend_detection' in eda:
                trend = eda['trend_detection']
                story.append(Paragraph(f"<b>Trend:</b> {trend.get('direction', 'N/A')} (slope: {trend.get('slope', 'N/A'):.4f})", styles['Normal']))  # type: ignore
            
            story.append(Spacer(1, 12))  # type: ignore
        
        # Models Tested
        if 'models_tested' in analysis_log:
            story.append(Paragraph("Models Tested", heading_style))  # type: ignore
            models = analysis_log['models_tested']
            for model in models:
                model_name = model.get('model', 'N/A')
                rank = model.get('rank', 'N/A')
                rmse = model.get('metrics', {}).get('rmse', 'N/A')
                story.append(Paragraph(f"<b>{model_name}</b> (Rank: {rank}, RMSE: {rmse:.4f})", styles['Normal']))  # type: ignore
            story.append(Spacer(1, 12))  # type: ignore
        
        # Best Model
        if 'best_model' in analysis_log:
            story.append(Paragraph("Best Model Selected", heading_style))  # type: ignore
            best = analysis_log['best_model']
            story.append(Paragraph(f"<b>Model:</b> {best.get('model', 'N/A')}", styles['Normal']))  # type: ignore
            story.append(Paragraph(f"<b>RMSE:</b> {best.get('metrics', {}).get('rmse', 'N/A'):.4f}", styles['Normal']))  # type: ignore
            story.append(Paragraph(f"<b>MAE:</b> {best.get('metrics', {}).get('mae', 'N/A'):.4f}", styles['Normal']))  # type: ignore
        
        doc.build(story)  # type: ignore
        buffer.seek(0)
        return buffer
    
    @staticmethod
    def create_execution_log(
        data_prep: Dict[str, Any],
        eda_results: Dict[str, Any],
        models_tested: List[Dict[str, Any]],
        best_model: Dict[str, Any],
        train_size: int,
        test_size: int
    ) -> Dict[str, Any]:
        """Create structured execution log."""
        
        return {
            'execution_timestamp': datetime.now().isoformat(),
            'data_preprocessing': {
                'rows': data_prep.get('rows'),
                'date_range': data_prep.get('date_range'),
                'missing_values': data_prep.get('missing_values'),
                'duplicates': data_prep.get('duplicates')
            },
            'train_test_split': {
                'train_size': train_size,
                'test_size': test_size,
                'train_ratio': train_size / (train_size + test_size)
            },
            'eda_results': {
                'adf_test': eda_results.get('adf_test'),
                'kpss_test': eda_results.get('kpss_test'),
                'trend_detection': eda_results.get('trend_detection'),
                'seasonal_decomposition': {
                    'components': 'Trend, Seasonal, Residual'
                }
            },
            'models_tested': models_tested,
            'best_model': best_model,
            'summary': {
                'total_models': len(models_tested),
                'best_model_name': best_model.get('model'),
                'best_model_rank': best_model.get('rank'),
                'best_rmse': best_model.get('metrics', {}).get('rmse'),
                'best_mae': best_model.get('metrics', {}).get('mae')
            }
        }
