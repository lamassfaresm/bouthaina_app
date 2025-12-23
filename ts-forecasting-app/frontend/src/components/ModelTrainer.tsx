'use client';

import React, { useState } from 'react';
import { AlertCircle, Play } from 'lucide-react';
import {
  trainMovingAverage,
  trainLinearRegression,
  trainSES,
  trainHolt,
  trainHoltWintersAdd,
  trainHoltWintersMult,
} from '@/api';

interface ModelTrainerProps {
  sessionId: string;
  onModelTrained?: (modelResult: any) => void;
}

export default function ModelTrainer({ sessionId, onModelTrained }: ModelTrainerProps) {
  const [selectedModel, setSelectedModel] = useState('ma');
  const [isTraining, setIsTraining] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const models = [
    { id: 'ma', name: 'Moving Average', hasParams: true },
    { id: 'lr', name: 'Linear Regression', hasParams: false },
    { id: 'ses', name: 'Simple Exponential Smoothing', hasParams: true },
    { id: 'holt', name: "Holt's Linear Trend", hasParams: true },
    { id: 'hwa', name: 'Holt-Winters Additive', hasParams: true },
    { id: 'hwm', name: 'Holt-Winters Multiplicative', hasParams: true },
  ];

  const trainModel = async () => {
    setIsTraining(true);
    setError(null);
    setResult(null);

    try {
      let modelResult;
      
      switch (selectedModel) {
        case 'ma':
          modelResult = await trainMovingAverage(sessionId, 3);
          break;
        case 'lr':
          modelResult = await trainLinearRegression(sessionId);
          break;
        case 'ses':
          modelResult = await trainSES(sessionId, true);
          break;
        case 'holt':
          modelResult = await trainHolt(sessionId, true);
          break;
        case 'hwa':
          modelResult = await trainHoltWintersAdd(sessionId, true);
          break;
        case 'hwm':
          modelResult = await trainHoltWintersMult(sessionId, true);
          break;
        default:
          throw new Error('Unknown model');
      }

      setResult(modelResult);
      onModelTrained?.(modelResult);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Model Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Model</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => setSelectedModel(model.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedModel === model.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <p className="font-medium text-gray-900">{model.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Train Button */}
      <button
        onClick={trainModel}
        disabled={isTraining}
        className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
          isTraining
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        <Play className="h-4 w-4" />
        {isTraining ? 'Training...' : 'Train Model'}
      </button>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {result.model?.metrics && (
              <>
                <MetricItem label="MSE" value={result.model.metrics.mse} />
                <MetricItem label="RMSE" value={result.model.metrics.rmse} />
                <MetricItem label="MAE" value={result.model.metrics.mae} />
                <MetricItem label="AIC" value={result.model.metrics.aic} />
                <MetricItem label="BIC" value={result.model.metrics.bic} />
                <MetricItem label="AICc" value={result.model.metrics.aicc} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricItem({ label, value }: any) {
  return (
    <div className="text-center p-3 bg-gray-50 rounded">
      <p className="text-xs text-gray-600 font-medium">{label}</p>
      <p className="text-lg font-semibold text-gray-900">
        {typeof value === 'number' ? value.toFixed(2) : 'N/A'}
      </p>
    </div>
  );
}
