"""Modeling endpoints."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.session_manager import SessionManager
from app.services.data_processor import DataProcessor
from app.services.modeling_service import TimeSeriesModels, ModelOptimizer
from app.services.evaluation_service import MetricsCalculator, ResidualAnalysis
import numpy as np

router = APIRouter(prefix="/api/modeling", tags=["modeling"])
data_processor = DataProcessor()

class ModelConfig(BaseModel):
    test_ratio: float = 0.3
    forecast_steps: int = 12

class MAConfig(BaseModel):
    window: int = 3
    forecast_steps: int = 12

class SESConfig(BaseModel):
    alpha: Optional[float] = None
    forecast_steps: int = 12
    optimize: bool = False

class HoltConfig(BaseModel):
    alpha: Optional[float] = None
    beta: Optional[float] = None
    forecast_steps: int = 12
    optimize: bool = False

class HWConfig(BaseModel):
    alpha: Optional[float] = None
    beta: Optional[float] = None
    gamma: Optional[float] = None
    season_length: int = 12
    forecast_steps: int = 12
    optimize: bool = False

@router.post("/{session_id}/split")
async def split_data(session_id: str, config: ModelConfig):
    """Split data for training and testing."""
    try:
        session = SessionManager.get_session(session_id)
        if not session or session['data'] is None:
            raise HTTPException(status_code=404, detail="Session not found")
        
        df = session['data']
        train, test = data_processor.split_data(df, test_ratio=config.test_ratio)
        
        SessionManager.update_session(session_id, 'train_data', train)
        SessionManager.update_session(session_id, 'test_data', test)
        
        return {
            'success': True,
            'session_id': session_id,
            'train_size': len(train),
            'test_size': len(test),
            'test_ratio': config.test_ratio,
            'train_date_range': {
                'start': train['date'].min().isoformat(),
                'end': train['date'].max().isoformat()
            },
            'test_date_range': {
                'start': test['date'].min().isoformat(),
                'end': test['date'].max().isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{session_id}/moving-average")
async def moving_average(session_id: str, config: MAConfig):
    """Train Moving Average model."""
    try:
        session = SessionManager.get_session(session_id)
        if not session or session['train_data'] is None:
            raise HTTPException(status_code=404, detail="Session or training data not found")
        
        train = session['train_data']
        test = session['test_data']
        
        # Train
        result = TimeSeriesModels.moving_average(
            train['value'].values,
            window=config.window,
            forecast_steps=config.forecast_steps
        )
        
        # Evaluate on test set
        fitted_test = train['value'].values[-config.window:]
        test_fitted = np.full(len(test), np.mean(fitted_test))
        metrics = MetricsCalculator.get_all_metrics(test['value'].values, test_fitted, model_params=1)
        
        result['metrics'] = metrics
        result['test_predictions'] = test_fitted.tolist()
        
        return {
            'success': True,
            'session_id': session_id,
            'model': result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{session_id}/linear-regression")
async def linear_regression(session_id: str, config: ModelConfig):
    """Train Linear Regression model."""
    try:
        session = SessionManager.get_session(session_id)
        if not session or session['train_data'] is None:
            raise HTTPException(status_code=404, detail="Session or training data not found")
        
        train = session['train_data']
        test = session['test_data']
        
        # Train
        result = TimeSeriesModels.linear_regression(
            train['value'].values,
            forecast_steps=config.forecast_steps
        )
        
        # Evaluate on test set
        x_test = np.arange(len(train), len(train) + len(test))
        p = np.poly1d([result['slope'], result['intercept']])
        test_fitted = p(x_test)
        
        metrics = MetricsCalculator.get_all_metrics(test['value'].values, test_fitted, model_params=2)
        
        result['metrics'] = metrics
        result['test_predictions'] = test_fitted.tolist()
        
        return {
            'success': True,
            'session_id': session_id,
            'model': result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{session_id}/ses")
async def simple_exponential_smoothing(session_id: str, config: SESConfig):
    """Train Simple Exponential Smoothing model."""
    try:
        session = SessionManager.get_session(session_id)
        if not session or session['train_data'] is None:
            raise HTTPException(status_code=404, detail="Session or training data not found")
        
        train = session['train_data']
        test = session['test_data']
        
        # Optimize if requested
        if config.optimize:
            opt_result = ModelOptimizer.optimize_ses(train['value'].values)
            alpha = opt_result['optimal_alpha']
        else:
            alpha = config.alpha or 0.3
        
        # Train
        result = TimeSeriesModels.simple_exponential_smoothing(
            train['value'].values,
            alpha=alpha,
            forecast_steps=config.forecast_steps
        )
        
        # Evaluate on test set
        fitted = [train['value'].values[0]]
        for t in range(1, len(train)):
            fitted.append(alpha * train['value'].values[t-1] + (1 - alpha) * fitted[t-1])
        
        last_fitted = fitted[-1]
        test_fitted = np.full(len(test), last_fitted)
        
        metrics = MetricsCalculator.get_all_metrics(test['value'].values, test_fitted, model_params=1)
        
        result['metrics'] = metrics
        result['test_predictions'] = test_fitted.tolist()
        
        return {
            'success': True,
            'session_id': session_id,
            'model': result,
            'optimized': config.optimize
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{session_id}/holt")
async def holt_method(session_id: str, config: HoltConfig):
    """Train Holt's linear trend model."""
    try:
        session = SessionManager.get_session(session_id)
        if not session or session['train_data'] is None:
            raise HTTPException(status_code=404, detail="Session or training data not found")
        
        train = session['train_data']
        test = session['test_data']
        
        # Optimize if requested
        if config.optimize:
            opt_result = ModelOptimizer.optimize_holt(train['value'].values)
            alpha = opt_result['optimal_alpha']
            beta = opt_result['optimal_beta']
        else:
            alpha = config.alpha or 0.3
            beta = config.beta or 0.1
        
        # Train
        result = TimeSeriesModels.holt_linear_trend(
            train['value'].values,
            alpha=alpha,
            beta=beta,
            forecast_steps=config.forecast_steps
        )
        
        # Evaluate on test set
        level = [train['value'].values[0]]
        trend = [train['value'].values[1] - train['value'].values[0]]
        test_fitted = []
        
        for t in range(1, len(train)):
            new_level = alpha * train['value'].values[t] + (1 - alpha) * (level[-1] + trend[-1])
            new_trend = beta * (new_level - level[-1]) + (1 - beta) * trend[-1]
            level.append(new_level)
            trend.append(new_trend)
        
        for i in range(len(test)):
            test_fitted.append(level[-1] + (i + 1) * trend[-1])
        
        test_fitted = np.array(test_fitted)
        metrics = MetricsCalculator.get_all_metrics(test['value'].values, test_fitted, model_params=2)
        
        result['metrics'] = metrics
        result['test_predictions'] = test_fitted.tolist()
        
        return {
            'success': True,
            'session_id': session_id,
            'model': result,
            'optimized': config.optimize
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{session_id}/holt-winters-additive")
async def holt_winters_add(session_id: str, config: HWConfig):
    """Train Holt-Winters additive model."""
    try:
        session = SessionManager.get_session(session_id)
        if not session or session['train_data'] is None:
            raise HTTPException(status_code=404, detail="Session or training data not found")
        
        train = session['train_data']
        test = session['test_data']
        
        # Optimize if requested
        if config.optimize:
            opt_result = ModelOptimizer.optimize_holt_winters(train['value'].values, config.season_length)
            if 'error' in opt_result:
                raise HTTPException(status_code=400, detail=opt_result['error'])
            alpha = opt_result['optimal_alpha']
            beta = opt_result['optimal_beta']
            gamma = opt_result['optimal_gamma']
        else:
            alpha = config.alpha or 0.3
            beta = config.beta or 0.1
            gamma = config.gamma or 0.1
        
        # Train
        result = TimeSeriesModels.holt_winters_additive(
            train['value'].values,
            alpha=alpha,
            beta=beta,
            gamma=gamma,
            season_length=config.season_length,
            forecast_steps=config.forecast_steps
        )
        
        if 'error' in result:
            raise HTTPException(status_code=400, detail=result['error'])
        
        # Evaluate on test set
        level = [np.mean(train['value'].values[:config.season_length])]
        trend = [(np.mean(train['value'].values[config.season_length:2*config.season_length]) - 
                  np.mean(train['value'].values[:config.season_length])) / config.season_length]
        seasonal = [train['value'].values[i] - level[0] for i in range(config.season_length)]
        
        test_fitted = []
        for t in range(len(train)):
            if t > 0:
                new_level = alpha * (train['value'].values[t] - seasonal[t % config.season_length]) + \
                           (1 - alpha) * (level[-1] + trend[-1])
                new_trend = beta * (new_level - level[-1]) + (1 - beta) * trend[-1]
                new_seasonal = gamma * (train['value'].values[t] - new_level) + \
                              (1 - gamma) * seasonal[t % config.season_length]
                level.append(new_level)
                trend.append(new_trend)
                seasonal.append(new_seasonal)
        
        n = len(train)
        for i in range(len(test)):
            test_fitted.append(level[-1] + (i + 1) * trend[-1] + seasonal[(n + i) % config.season_length])
        
        test_fitted = np.array(test_fitted)
        metrics = MetricsCalculator.get_all_metrics(test['value'].values, test_fitted, model_params=3)
        
        result['metrics'] = metrics
        result['test_predictions'] = test_fitted.tolist()
        
        return {
            'success': True,
            'session_id': session_id,
            'model': result,
            'optimized': config.optimize
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{session_id}/holt-winters-multiplicative")
async def holt_winters_mult(session_id: str, config: HWConfig):
    """Train Holt-Winters multiplicative model."""
    try:
        session = SessionManager.get_session(session_id)
        if not session or session['train_data'] is None:
            raise HTTPException(status_code=404, detail="Session or training data not found")
        
        train = session['train_data']
        test = session['test_data']
        
        # Optimize if requested
        if config.optimize:
            opt_result = ModelOptimizer.optimize_holt_winters(train['value'].values, config.season_length)
            if 'error' in opt_result:
                raise HTTPException(status_code=400, detail=opt_result['error'])
            alpha = opt_result['optimal_alpha']
            beta = opt_result['optimal_beta']
            gamma = opt_result['optimal_gamma']
        else:
            alpha = config.alpha or 0.3
            beta = config.beta or 0.1
            gamma = config.gamma or 0.1
        
        # Train
        result = TimeSeriesModels.holt_winters_multiplicative(
            train['value'].values,
            alpha=alpha,
            beta=beta,
            gamma=gamma,
            season_length=config.season_length,
            forecast_steps=config.forecast_steps
        )
        
        if 'error' in result:
            raise HTTPException(status_code=400, detail=result['error'])
        
        # Evaluate on test set
        level = [np.mean(train['value'].values[:config.season_length])]
        trend = [(np.mean(train['value'].values[config.season_length:2*config.season_length]) - 
                  np.mean(train['value'].values[:config.season_length])) / config.season_length]
        seasonal = [train['value'].values[i] / level[0] if level[0] != 0 else 1.0 
                   for i in range(config.season_length)]
        
        test_fitted = []
        for t in range(len(train)):
            if t > 0:
                s_idx = t % config.season_length
                new_level = alpha * (train['value'].values[t] / seasonal[s_idx]) + \
                           (1 - alpha) * (level[-1] + trend[-1])
                new_trend = beta * (new_level - level[-1]) + (1 - beta) * trend[-1]
                new_seasonal = gamma * (train['value'].values[t] / new_level) + \
                              (1 - gamma) * seasonal[s_idx]
                level.append(new_level)
                trend.append(new_trend)
                seasonal.append(new_seasonal)
        
        n = len(train)
        for i in range(len(test)):
            test_fitted.append((level[-1] + (i + 1) * trend[-1]) * seasonal[(n + i) % config.season_length])
        
        test_fitted = np.array(test_fitted)
        metrics = MetricsCalculator.get_all_metrics(test['value'].values, test_fitted, model_params=3)
        
        result['metrics'] = metrics
        result['test_predictions'] = test_fitted.tolist()
        
        return {
            'success': True,
            'session_id': session_id,
            'model': result,
            'optimized': config.optimize
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
