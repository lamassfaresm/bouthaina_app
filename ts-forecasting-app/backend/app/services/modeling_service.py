"""Time series modeling service with multiple forecasting methods."""
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, List
from scipy.optimize import minimize
import warnings
warnings.filterwarnings('ignore')


class TimeSeriesModels:
    """Collection of time series forecasting models."""
    
    @staticmethod
    def moving_average(data: np.ndarray, window: int = 3, forecast_steps: int = 12) -> Dict[str, Any]:
        """Simple Moving Average model."""
        if len(data) < window:
            return {'error': f'Not enough data for window size {window}'}
        
        # Fit model
        fitted = []
        for i in range(window - 1, len(data)):
            fitted.append(np.mean(data[i - window + 1:i + 1]))
        
        # Forecast
        last_window = data[-window:]
        forecast = np.full(forecast_steps, np.mean(last_window))
        
        return {
            'model': 'Moving Average',
            'window': window,
            'fitted': [float(x) for x in fitted],
            'forecast': [float(x) for x in forecast]
        }
    
    @staticmethod
    def linear_regression(data: np.ndarray, forecast_steps: int = 12) -> Dict[str, Any]:
        """Linear Regression model."""
        x = np.arange(len(data))
        coeffs = np.polyfit(x, data, 1)
        p = np.poly1d(coeffs)
        
        # Fit
        fitted = p(x)
        
        # Forecast
        future_x = np.arange(len(data), len(data) + forecast_steps)
        forecast = p(future_x)
        
        return {
            'model': 'Linear Regression',
            'slope': float(coeffs[0]),
            'intercept': float(coeffs[1]),
            'fitted': [float(x) for x in fitted],
            'forecast': [float(x) for x in forecast]
        }
    
    @staticmethod
    def simple_exponential_smoothing(data: np.ndarray, alpha: float = 0.3, 
                                     forecast_steps: int = 12) -> Dict[str, Any]:
        """Simple Exponential Smoothing (SES)."""
        fitted = [data[0]]
        
        for t in range(1, len(data)):
            fitted.append(alpha * data[t - 1] + (1 - alpha) * fitted[t - 1])
        
        # Forecast
        last_fitted = fitted[-1]
        forecast = np.full(forecast_steps, last_fitted)
        
        return {
            'model': 'Simple Exponential Smoothing',
            'alpha': alpha,
            'fitted': [float(x) for x in fitted],
            'forecast': [float(x) for x in forecast]
        }
    
    @staticmethod
    def holt_linear_trend(data: np.ndarray, alpha: float = 0.3, beta: float = 0.1,
                          forecast_steps: int = 12) -> Dict[str, Any]:
        """Holt's linear trend method."""
        level = [data[0]]
        trend = [data[1] - data[0]]
        fitted = [level[0] + trend[0]]
        
        for t in range(1, len(data)):
            last_level = level[-1]
            last_trend = trend[-1]
            
            new_level = alpha * data[t] + (1 - alpha) * (last_level + last_trend)
            new_trend = beta * (new_level - last_level) + (1 - beta) * last_trend
            
            level.append(new_level)
            trend.append(new_trend)
            fitted.append(new_level + new_trend)
        
        # Forecast
        forecast = [level[-1] + (i + 1) * trend[-1] for i in range(forecast_steps)]
        
        return {
            'model': 'Holt Linear Trend',
            'alpha': alpha,
            'beta': beta,
            'fitted': [float(x) for x in fitted],
            'forecast': [float(x) for x in forecast]
        }
    
    @staticmethod
    def holt_winters_additive(data: np.ndarray, alpha: float = 0.3, beta: float = 0.1,
                              gamma: float = 0.1, season_length: int = 12,
                              forecast_steps: int = 12) -> Dict[str, Any]:
        """Holt-Winters additive seasonal method."""
        if len(data) < 2 * season_length:
            return {'error': f'Not enough data for season length {season_length}'}
        
        # Initialize
        n = len(data)
        level = [np.mean(data[:season_length])]
        trend = [(np.mean(data[season_length:2*season_length]) - np.mean(data[:season_length])) / season_length]
        seasonal = [data[i] - level[0] for i in range(season_length)]
        
        fitted = []
        for t in range(n):
            if t == 0:
                fitted.append(level[0] + trend[0] + seasonal[0])
            else:
                last_level = level[-1]
                last_trend = trend[-1]
                
                new_level = alpha * (data[t] - seasonal[t % season_length]) + (1 - alpha) * (last_level + last_trend)
                new_trend = beta * (new_level - last_level) + (1 - beta) * last_trend
                new_seasonal = gamma * (data[t] - new_level) + (1 - gamma) * seasonal[t % season_length]
                
                level.append(new_level)
                trend.append(new_trend)
                seasonal.append(new_seasonal)
                fitted.append(new_level + new_trend + seasonal[t % season_length])
        
        # Forecast
        forecast = [level[-1] + (i + 1) * trend[-1] + seasonal[(n + i) % season_length] 
                   for i in range(forecast_steps)]
        
        return {
            'model': 'Holt-Winters Additive',
            'alpha': alpha,
            'beta': beta,
            'gamma': gamma,
            'season_length': season_length,
            'fitted': [float(x) for x in fitted],
            'forecast': [float(x) for x in forecast]
        }
    
    @staticmethod
    def holt_winters_multiplicative(data: np.ndarray, alpha: float = 0.3, beta: float = 0.1,
                                    gamma: float = 0.1, season_length: int = 12,
                                    forecast_steps: int = 12) -> Dict[str, Any]:
        """Holt-Winters multiplicative seasonal method."""
        if len(data) < 2 * season_length:
            return {'error': f'Not enough data for season length {season_length}'}
        
        # Initialize
        n = len(data)
        level = [np.mean(data[:season_length])]
        trend = [(np.mean(data[season_length:2*season_length]) - np.mean(data[:season_length])) / season_length]
        seasonal = [data[i] / level[0] if level[0] != 0 else 1.0 for i in range(season_length)]
        
        fitted = []
        for t in range(n):
            if t == 0:
                fitted.append((level[0] + trend[0]) * seasonal[0])
            else:
                last_level = level[-1]
                last_trend = trend[-1]
                s_idx = t % season_length
                
                new_level = alpha * (data[t] / seasonal[s_idx]) + (1 - alpha) * (last_level + last_trend)
                new_trend = beta * (new_level - last_level) + (1 - beta) * last_trend
                new_seasonal = gamma * (data[t] / new_level) + (1 - gamma) * seasonal[s_idx]
                
                level.append(new_level)
                trend.append(new_trend)
                seasonal.append(new_seasonal)
                fitted.append((new_level + new_trend) * new_seasonal)
        
        # Forecast
        forecast = [(level[-1] + (i + 1) * trend[-1]) * seasonal[(n + i) % season_length] 
                   for i in range(forecast_steps)]
        
        return {
            'model': 'Holt-Winters Multiplicative',
            'alpha': alpha,
            'beta': beta,
            'gamma': gamma,
            'season_length': season_length,
            'fitted': [float(x) for x in fitted],
            'forecast': [float(x) for x in forecast]
        }


class ModelOptimizer:
    """Optimize model parameters using MSE minimization."""
    
    @staticmethod
    def calculate_mse(actual: np.ndarray, predicted: np.ndarray) -> float:
        """Calculate Mean Squared Error."""
        return float(np.mean((actual - predicted) ** 2))
    
    @staticmethod
    def optimize_ses(data: np.ndarray) -> Dict[str, Any]:
        """Optimize alpha for Simple Exponential Smoothing."""
        def objective(alpha_val):
            alpha = alpha_val[0]
            if alpha < 0 or alpha > 1:
                return 1e10
            fitted = [data[0]]
            for t in range(1, len(data)):
                fitted.append(alpha * data[t - 1] + (1 - alpha) * fitted[t - 1])
            return ModelOptimizer.calculate_mse(data[1:], np.array(fitted[1:]))
        
        result = minimize(objective, [0.3], bounds=[(0, 1)], method='L-BFGS-B')
        
        return {
            'optimal_alpha': float(result.x[0]),
            'mse': float(result.fun)
        }
    
    @staticmethod
    def optimize_holt(data: np.ndarray) -> Dict[str, Any]:
        """Optimize alpha and beta for Holt's method."""
        def objective(params):
            alpha, beta = params[0], params[1]
            if alpha < 0 or alpha > 1 or beta < 0 or beta > 1:
                return 1e10
            
            level = [data[0]]
            trend = [data[1] - data[0]]
            fitted = [level[0] + trend[0]]
            
            for t in range(1, len(data)):
                new_level = alpha * data[t] + (1 - alpha) * (level[-1] + trend[-1])
                new_trend = beta * (new_level - level[-1]) + (1 - beta) * trend[-1]
                level.append(new_level)
                trend.append(new_trend)
                fitted.append(new_level + new_trend)
            
            return ModelOptimizer.calculate_mse(data[1:], np.array(fitted[1:]))
        
        result = minimize(objective, [0.3, 0.1], bounds=[(0, 1), (0, 1)], method='L-BFGS-B')
        
        return {
            'optimal_alpha': float(result.x[0]),
            'optimal_beta': float(result.x[1]),
            'mse': float(result.fun)
        }
    
    @staticmethod
    def optimize_holt_winters(data: np.ndarray, season_length: int = 12) -> Dict[str, Any]:
        """Optimize alpha, beta, and gamma for Holt-Winters."""
        if len(data) < 2 * season_length:
            return {'error': 'Not enough data for optimization'}
        
        def objective(params):
            alpha, beta, gamma = params[0], params[1], params[2]
            if alpha < 0 or alpha > 1 or beta < 0 or beta > 1 or gamma < 0 or gamma > 1:
                return 1e10
            
            try:
                level = [np.mean(data[:season_length])]
                trend = [(np.mean(data[season_length:2*season_length]) - np.mean(data[:season_length])) / season_length]
                seasonal = [data[i] - level[0] for i in range(season_length)]
                
                fitted = []
                for t in range(len(data)):
                    if t == 0:
                        fitted.append(level[0] + trend[0] + seasonal[0])
                    else:
                        new_level = alpha * (data[t] - seasonal[t % season_length]) + (1 - alpha) * (level[-1] + trend[-1])
                        new_trend = beta * (new_level - level[-1]) + (1 - beta) * trend[-1]
                        new_seasonal = gamma * (data[t] - new_level) + (1 - gamma) * seasonal[t % season_length]
                        
                        level.append(new_level)
                        trend.append(new_trend)
                        seasonal.append(new_seasonal)
                        fitted.append(new_level + new_trend + seasonal[t % season_length])
                
                return ModelOptimizer.calculate_mse(data, np.array(fitted))
            except:
                return 1e10
        
        result = minimize(objective, [0.3, 0.1, 0.1], bounds=[(0, 1), (0, 1), (0, 1)], method='L-BFGS-B')
        
        return {
            'optimal_alpha': float(result.x[0]),
            'optimal_beta': float(result.x[1]),
            'optimal_gamma': float(result.x[2]),
            'mse': float(result.fun)
        }
