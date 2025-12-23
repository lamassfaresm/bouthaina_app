"""Data processing service for time series data."""
import pandas as pd
import numpy as np
from datetime import datetime
import os
from typing import Tuple, Dict, Any, Optional
import json

class DataProcessor:
    """Handle data upload, validation, and preprocessing."""
    
    def __init__(self, upload_dir: str = "uploads"):
        self.upload_dir = upload_dir
        os.makedirs(upload_dir, exist_ok=True)
    
    def detect_date_column(self, df: pd.DataFrame) -> Optional[str]:
        """Detect the date column in the dataframe."""
        # Try common date column names first
        for col in ['date', 'Date', 'DATE', 'time', 'Time', 'datetime', 'Datetime', 'month', 'Month', 'MONTH', 'timestamp', 'Timestamp']:
            if col in df.columns:
                try:
                    pd.to_datetime(df[col])
                    return col
                except:
                    pass
        
        # Try parsing each column
        for col in df.columns:
            try:
                pd.to_datetime(df[col])
                return col
            except:
                continue
        return None
    
    def detect_value_column(self, df: pd.DataFrame, date_col: str) -> str:
        """Detect the value column (numeric column that's not the date column)."""
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        if numeric_cols:
            return numeric_cols[0]
        
        # Try to convert non-numeric columns
        for col in df.columns:
            if col != date_col:
                try:
                    pd.to_numeric(df[col])
                    return col
                except:
                    pass
        
        return ""  # type: ignore
    
    def process_csv(self, file_path: str) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Process CSV file, detect date and value columns.
        
        Returns:
            Tuple of (processed_df, metadata)
        """
        # Read CSV
        df = pd.read_csv(file_path)
        
        # Detect columns
        date_col = self.detect_date_column(df)
        if date_col is None:
            raise ValueError("No valid date column detected in CSV")
        
        value_col = self.detect_value_column(df, date_col)
        if value_col is None:
            raise ValueError("No numeric value column found")
        
        # Process data
        df[date_col] = pd.to_datetime(df[date_col])
        df = df.sort_values(by=date_col).reset_index(drop=True)
        df = df[[date_col, value_col]].rename(columns={date_col: 'date', value_col: 'value'})  # type: ignore
        
        # Remove duplicates and NaNs
        df = df.dropna()
        df = df[~df.duplicated(subset=['date'])]
        
        # Metadata
        metadata = {
            'rows': len(df),
            'date_range': {
                'start': df['date'].min().isoformat(),
                'end': df['date'].max().isoformat()
            },
            'date_column': date_col,
            'value_column': value_col,
            'missing_values': int(df['value'].isna().sum()),
            'duplicates': int(df.duplicated(subset=['date']).sum())
        }
        
        return df, metadata
    
    def split_data(self, df: pd.DataFrame, test_ratio: float = 0.3) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Split data into train and test sets."""
        split_idx = int(len(df) * (1 - test_ratio))
        train = df.iloc[:split_idx].reset_index(drop=True)
        test = df.iloc[split_idx:].reset_index(drop=True)
        return train, test
    
    def get_summary_statistics(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Get summary statistics for the time series."""
        values = np.asarray(df['value'].values, dtype=float)
        series = pd.Series(values)
        
        return {
            'count': int(df.shape[0]),
            'mean': float(np.mean(values)),
            'std': float(np.std(values)),
            'min': float(np.min(values)),
            'max': float(np.max(values)),
            'median': float(np.median(values)),
            'q25': float(np.percentile(values, 25)),
            'q75': float(np.percentile(values, 75)),
            'skewness': float(series.skew()),
            'kurtosis': float(series.kurtosis())
        }
