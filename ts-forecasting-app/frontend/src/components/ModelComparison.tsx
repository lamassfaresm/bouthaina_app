'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { useLanguage } from '@/context/LanguageContext';

interface ModelComparisonProps {
  sessionId: string;
}

export default function ModelComparison({ sessionId }: ModelComparisonProps) {
  const { t } = useLanguage();

  // Mock comparison data
  const comparisonData = [
    {
      model: 'Moving Average',
      mae: 15.3,
      rmse: 22.4,
      mape: 5.2,
      trainTime: 0.02
    },
    {
      model: 'Linear Regression',
      mae: 18.7,
      rmse: 28.9,
      mape: 6.8,
      trainTime: 0.05
    },
    {
      model: 'Holt-Winters',
      mae: 12.1,
      rmse: 18.6,
      mape: 4.1,
      trainTime: 0.15
    },
    {
      model: 'ARIMA',
      mae: 14.5,
      rmse: 21.2,
      mape: 4.9,
      trainTime: 0.25
    },
    {
      model: 'Exponential Smoothing',
      mae: 13.8,
      rmse: 20.1,
      mape: 4.5,
      trainTime: 0.08
    }
  ];

  const performanceData = [
    {
      model: 'Moving Average',
      accuracy: 94.8,
      stability: 92.1
    },
    {
      model: 'Linear Regression',
      accuracy: 93.2,
      stability: 95.3
    },
    {
      model: 'Holt-Winters',
      accuracy: 95.9,
      stability: 93.8
    },
    {
      model: 'ARIMA',
      accuracy: 95.1,
      stability: 94.2
    },
    {
      model: 'Exponential Smoothing',
      accuracy: 95.5,
      stability: 93.5
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('model_comparison')} - Error Metrics</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="model" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="mae" fill="#3b82f6" name="MAE (Lower is Better)" />
            <Bar dataKey="rmse" fill="#ef4444" name="RMSE (Lower is Better)" />
            <Bar dataKey="mape" fill="#10b981" name="MAPE %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('model_comparison')} - Accuracy vs Stability</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="accuracy" name="Accuracy %" />
            <YAxis dataKey="stability" name="Stability %" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Models" data={performanceData} fill="#3b82f6" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Model Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-900">Model</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-900">MAE</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-900">RMSE</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-900">MAPE</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-900">Train Time (s)</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-900">Rank</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, idx) => (
                <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">{row.model}</td>
                  <td className="px-4 py-2 text-right text-gray-600">{row.mae.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right text-gray-600">{row.rmse.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right text-gray-600">{row.mape.toFixed(2)}%</td>
                  <td className="px-4 py-2 text-right text-gray-600">{row.trainTime.toFixed(3)}</td>
                  <td className="px-4 py-2 text-right">
                    <span className={`px-3 py-1 rounded-full text-white font-semibold ${
                      idx === 2 ? 'bg-yellow-500' : 
                      idx === 0 ? 'bg-blue-500' : 
                      idx === 4 ? 'bg-gray-500' : 'bg-gray-400'
                    }`}>
                      #{idx + 1}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RecommendationCard 
          title="Best Overall"
          model="Holt-Winters"
          reason="Best MAE and RMSE"
          color="yellow"
        />
        <RecommendationCard 
          title="Most Stable"
          model="Linear Regression"
          reason="Highest stability score"
          color="blue"
        />
        <RecommendationCard 
          title="Fastest"
          model="Moving Average"
          reason="Quickest training time"
          color="green"
        />
      </div>
    </div>
  );
}

interface RecommendationCardProps {
  title: string;
  model: string;
  reason: string;
  color: string;
}

function RecommendationCard({ title, model, reason, color }: RecommendationCardProps) {
  const colorMap: { [key: string]: string } = {
    yellow: 'from-yellow-50 to-yellow-100 border-yellow-200',
    blue: 'from-blue-50 to-blue-100 border-blue-200',
    green: 'from-green-50 to-green-100 border-green-200',
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} rounded-lg p-6 border`}>
      <p className="text-sm text-gray-600 font-medium mb-2">{title}</p>
      <p className="text-lg font-bold text-gray-900 mb-2">{model}</p>
      <p className="text-sm text-gray-700">{reason}</p>
    </div>
  );
}
