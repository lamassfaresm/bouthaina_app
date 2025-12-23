"""Model evaluation and ranking service."""
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from scipy.stats import shapiro, norm
import warnings
warnings.filterwarnings('ignore')

try:
    from statsmodels.stats.diagnostic import acorr_ljungbox
except ImportError:
    acorr_ljungbox = None  # type: ignore


class MetricsCalculator:
    """Calculate evaluation metrics for time series forecasts."""
    
    @staticmethod
    def mse(actual: np.ndarray, predicted: np.ndarray) -> float:
        """Mean Squared Error."""
        return float(np.mean((actual - predicted) ** 2))
    
    @staticmethod
    def rmse(actual: np.ndarray, predicted: np.ndarray) -> float:
        """Root Mean Squared Error."""
        return float(np.sqrt(np.mean((actual - predicted) ** 2)))
    
    @staticmethod
    def mae(actual: np.ndarray, predicted: np.ndarray) -> float:
        """Mean Absolute Error."""
        return float(np.mean(np.abs(actual - predicted)))
    
    @staticmethod
    def mape(actual: np.ndarray, predicted: np.ndarray) -> float:
        """Mean Absolute Percentage Error."""
        if np.any(actual == 0):
            return float('inf')
        return float(100 * np.mean(np.abs((actual - predicted) / actual)))
    
    @staticmethod
    def calculate_aic(n: int, rss: float, k: int) -> float:
        """Akaike Information Criterion."""
        if rss <= 0:
            return float('inf')
        return n * np.log(rss / n) + 2 * k
    
    @staticmethod
    def calculate_bic(n: int, rss: float, k: int) -> float:
        """Bayesian Information Criterion."""
        if rss <= 0:
            return float('inf')
        return n * np.log(rss / n) + k * np.log(n)
    
    @staticmethod
    def calculate_aicc(n: int, rss: float, k: int) -> float:
        """Corrected AIC for small sample sizes."""
        if rss <= 0 or n - k - 1 <= 0:
            return float('inf')
        aic = MetricsCalculator.calculate_aic(n, rss, k)
        return aic + (2 * k * (k + 1)) / (n - k - 1)
    
    @staticmethod
    def get_all_metrics(actual: np.ndarray, predicted: np.ndarray, 
                       model_params: int = 1) -> Dict[str, float]:
        """Calculate all evaluation metrics."""
        mse_val = MetricsCalculator.mse(actual, predicted)
        rmse_val = MetricsCalculator.rmse(actual, predicted)
        mae_val = MetricsCalculator.mae(actual, predicted)
        mape_val = MetricsCalculator.mape(actual, predicted)
        
        rss = np.sum((actual - predicted) ** 2)
        aic = MetricsCalculator.calculate_aic(len(actual), rss, model_params)
        bic = MetricsCalculator.calculate_bic(len(actual), rss, model_params)
        aicc = MetricsCalculator.calculate_aicc(len(actual), rss, model_params)
        
        return {
            'mse': mse_val,
            'rmse': rmse_val,
            'mae': mae_val,
            'mape': mape_val if not np.isinf(mape_val) else 0.0,
            'aic': aic,
            'bic': bic,
            'aicc': aicc
        }


class ResidualAnalysis:
    """Analyze residuals for model diagnostics."""
    
    @staticmethod
    def shapiro_wilk_test(residuals: np.ndarray) -> Dict[str, Any]:
        """Shapiro-Wilk test for normality of residuals."""
        try:
            statistic, p_value = shapiro(residuals)
            
            return {
                'test_statistic': float(statistic),
                'p_value': float(p_value),
                'is_normal': bool(p_value > 0.05),
                'interpretation': 'Normal distribution' if p_value > 0.05 else 'Not normally distributed'
            }
        except Exception as e:
            return {'error': str(e)}
    
    @staticmethod
    def ljung_box_test(residuals: np.ndarray, lags: int = 10) -> Dict[str, Any]:
        """Ljung-Box test for autocorrelation in residuals."""
        try:
            if acorr_ljungbox is None:
                return {'error': 'statsmodels not available', 'no_autocorrelation': True}
            
            lb_test = acorr_ljungbox(residuals, lags=min(lags, len(residuals)//2), return_df=True)
            
            return {
                'test_statistic': lb_test['lb_stat'].tolist(),
                'p_values': lb_test['lb_pvalue'].tolist(),
                'lags': list(range(1, min(lags, len(residuals)//2) + 1)),
                'no_autocorrelation': all(lb_test['lb_pvalue'] > 0.05)
            }
        except Exception as e:
            return {'error': str(e)}
    
    @staticmethod
    def full_residual_analysis(actual: np.ndarray, predicted: np.ndarray) -> Dict[str, Any]:
        """Perform full residual analysis."""
        residuals = actual - predicted
        
        analysis = {
            'residual_statistics': {
                'mean': float(np.mean(residuals)),
                'std': float(np.std(residuals)),
                'min': float(np.min(residuals)),
                'max': float(np.max(residuals)),
                'median': float(np.median(residuals))
            },
            'shapiro_wilk': ResidualAnalysis.shapiro_wilk_test(residuals),
            'ljung_box': ResidualAnalysis.ljung_box_test(residuals)
        }
        
        return analysis


class ModelRanker:
    """Rank models based on evaluation metrics."""
    
    @staticmethod
    def rank_models(models_evaluation: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Rank models based on multiple criteria."""
        # Normalize metrics for ranking
        metric_keys = ['rmse', 'mae', 'aic', 'bic']
        
        ranked = []
        for model in models_evaluation:
            if 'metrics' not in model:
                continue
            
            metrics = model['metrics']
            
            # Calculate weighted score (lower is better)
            score = 0
            weights = {'rmse': 0.3, 'mae': 0.2, 'aic': 0.25, 'bic': 0.25}
            
            for key, weight in weights.items():
                if key in metrics and metrics[key] is not None:
                    # Normalize by dividing by median of that metric across models
                    all_values = [m['metrics'].get(key, 0) for m in models_evaluation if m.get('metrics', {}).get(key)]
                    if all_values:
                        median_val = np.median([v for v in all_values if v and not np.isinf(v)])
                        if median_val > 0:
                            normalized = metrics[key] / median_val
                            score += weight * normalized
            
            model['overall_score'] = score
            ranked.append(model)
        
        # Sort by score (ascending)
        ranked.sort(key=lambda x: x.get('overall_score', float('inf')))
        
        # Add rank
        for i, model in enumerate(ranked):
            model['rank'] = i + 1
        
        return ranked
