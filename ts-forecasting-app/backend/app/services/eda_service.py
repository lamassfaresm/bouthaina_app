"""EDA (Exploratory Data Analysis) service."""
import pandas as pd
import numpy as np
from typing import Dict, Any, List
import warnings
warnings.filterwarnings('ignore')

try:
    from statsmodels.tsa.stattools import adfuller, kpss, seasonal_decompose
    from statsmodels.graphics.tsaplots import plot_acf, plot_pacf
except ImportError:
    pass  # type: ignore


class EDAService:
    """Perform exploratory data analysis on time series."""
    
    @staticmethod
    def adf_test(data: np.ndarray) -> Dict[str, Any]:
        """
        Augmented Dickey-Fuller test for stationarity.
        
        Returns:
            Dict with test statistic, p-value, and interpretation
        """
        try:
            result = adfuller(data, autolag='AIC')
            
            return {
                'test_statistic': float(result[0]),
                'p_value': float(result[1]),
                'n_lags': int(result[2]),
                'n_obs': int(result[3]),
                'critical_values': {str(k): float(v) for k, v in result[4].items()},
                'is_stationary': bool(result[1] < 0.05),
                'interpretation': 'Stationary' if result[1] < 0.05 else 'Non-stationary'
            }
        except Exception as e:
            return {'error': str(e)}
    
    @staticmethod
    def kpss_test(data: np.ndarray) -> Dict[str, Any]:
        """
        KPSS test for stationarity.
        
        Returns:
            Dict with test statistic, p-value, and interpretation
        """
        try:
            result = kpss(data, regression='c', nlags='auto')
            
            return {
                'test_statistic': float(result[0]),
                'p_value': float(result[1]),
                'n_lags': int(result[2]),
                'critical_values': {str(k): float(v) for k, v in result[3].items()},
                'is_stationary': bool(result[1] > 0.05),
                'interpretation': 'Stationary' if result[1] > 0.05 else 'Non-stationary'
            }
        except Exception as e:
            return {'error': str(e)}
    
    @staticmethod
    def detect_trend(data: np.ndarray) -> Dict[str, Any]:
        """Detect trend in the time series using linear regression."""
        x = np.arange(len(data))
        z = np.polyfit(x, data, 1)
        slope = float(z[0])
        
        # Calculate trend strength (R-squared)
        p = np.poly1d(z)
        y_pred = p(x)
        ss_res = np.sum((data - y_pred) ** 2)
        ss_tot = np.sum((data - np.mean(data)) ** 2)
        r_squared = float(1 - (ss_res / ss_tot)) if ss_tot != 0 else 0.0
        
        return {
            'slope': slope,
            'direction': 'Increasing' if slope > 0 else 'Decreasing',
            'strength': r_squared,
            'slope_magnitude': abs(slope)
        }
    
    @staticmethod
    def seasonal_decomposition(df: pd.DataFrame, period: int = 12) -> Dict[str, Any]:
        """
        Perform seasonal decomposition.
        
        Returns:
            Dict with trend, seasonal, and residual components
        """
        try:
            # Ensure enough data points
            if len(df) < 2 * period:
                return {'error': f'Not enough data points for period {period}'}
            
            result = seasonal_decompose(df['value'], model='additive', period=period)
            
            return {
                'trend': [float(x) if not np.isnan(x) else None for x in result.trend],
                'seasonal': [float(x) if not np.isnan(x) else None for x in result.seasonal],
                'residual': [float(x) if not np.isnan(x) else None for x in result.resid],
                'observed': [float(x) for x in result.observed]
            }
        except Exception as e:
            return {'error': str(e)}
    
    @staticmethod
    def calculate_acf(data: np.ndarray, nlags: int = 40) -> Dict[str, Any]:
        """Calculate autocorrelation function."""
        try:
            acf_values = plot_acf(data, lags=min(nlags, len(data)//2), plot=False)
            
            return {
                'acf': [float(x) for x in acf_values.acf],
                'lags': list(range(len(acf_values.acf))),
                'confidence_interval': [
                    [float(ci[0]), float(ci[1])] 
                    for ci in acf_values.conf_int
                ]
            }
        except Exception as e:
            return {'error': str(e)}
    
    @staticmethod
    def calculate_pacf(data: np.ndarray, nlags: int = 40) -> Dict[str, Any]:
        """Calculate partial autocorrelation function."""
        try:
            pacf_values = plot_pacf(data, lags=min(nlags, len(data)//2), plot=False)
            
            return {
                'pacf': [float(x) for x in pacf_values],
                'lags': list(range(len(pacf_values)))
            }
        except Exception as e:
            return {'error': str(e)}
    
    @staticmethod
    def full_eda(df: pd.DataFrame) -> Dict[str, Any]:
        """Run full EDA analysis."""
        values = np.asarray(df['value'].values, dtype=float)
        
        eda_results = {
            'adf_test': EDAService.adf_test(values),
            'kpss_test': EDAService.kpss_test(values),
            'trend_detection': EDAService.detect_trend(values),
            'seasonal_decomposition': EDAService.seasonal_decomposition(df, period=12),
            'acf': EDAService.calculate_acf(values),
            'pacf': EDAService.calculate_pacf(values)
        }
        
        return eda_results
