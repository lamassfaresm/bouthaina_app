'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/context/LanguageContext';

interface ForecastResultsProps {
  sessionId: string;
  data: any[];
}

export default function ForecastResults({ sessionId, data }: ForecastResultsProps) {
  const { t } = useLanguage();
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('moving-average');

  // Create mock forecast data (in production, this would come from the backend)
  useEffect(() => {
    if (!data || data.length === 0) return;

    const lastValue = data[data.length - 1].value;
    const trend = calculateTrend(data);
    
    const forecast = [];
    let value = lastValue;

    for (let i = 1; i <= 12; i++) {
      value = value + (trend * 0.8) + (Math.random() - 0.5) * 10;
      forecast.push({
        date: `Forecast +${i}`,
        value: Math.round(value * 100) / 100,
        isForecast: true
      });
    }

    // Combine actual and forecast data
    const combined = [
      ...data.slice(-12),
      ...forecast
    ];

    setForecastData(combined);
  }, [data, selectedModel]);

  const calculateTrend = (data: any[]) => {
    if (data.length < 2) return 0;
    const recent = data.slice(-12);
    const firstAvg = recent.slice(0, 6).reduce((sum, d) => sum + d.value, 0) / 6;
    const lastAvg = recent.slice(-6).reduce((sum, d) => sum + d.value, 0) / 6;
    return (lastAvg - firstAvg) / 6;
  };

  const models = [
    { id: 'moving-average', name: t('model_moving_average') },
    { id: 'linear-regression', name: t('model_linear_regression') },
    { id: 'holt-winters', name: t('model_holt_winters') },
    { id: 'arima', name: t('model_arima') }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('forecast_title')}</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('select_model')}</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {models.map(model => (
              <option key={model.id} value={model.id}>{model.name}</option>
            ))}
          </select>
        </div>

            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip formatter={(value: any) => typeof value === 'number' ? value.toFixed(2) : value} />
                <Legend />
                {/* Draw actual values as a solid line and forecast as a dashed line by giving each Line its own data array */}
                <Line
                  type="monotone"
                  data={forecastData.map((d) => d.isForecast ? { ...d, value: null } : d)}
                  dataKey="value"
                  stroke="#3b82f6"
                  dot={false}
                  name={t('forecast_title') + ' - ' + t('view_graphs')}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  data={forecastData.map((d) => d.isForecast ? d : { ...d, value: null })}
                  dataKey="value"
                  stroke="#f97316"
                  dot={false}
                  name={t('forecast_title') + ' - Forecast'}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('forecast_summary')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(() => {
            const forecasts = forecastData.filter((d: any) => d.isForecast);
            const nextVal = forecastData[forecastData.length - 1]?.value;
            const nextMonth = nextVal !== undefined && nextVal !== null ? nextVal.toFixed(2) : '-';
            const avg = forecasts.length ? (forecasts.reduce((sum: number, d: any) => sum + d.value, 0) / forecasts.length) : null;
            const min = forecasts.length ? Math.min(...forecasts.map((d: any) => d.value)) : null;
            const max = forecasts.length ? Math.max(...forecasts.map((d: any) => d.value)) : null;

            return (
              <>
                <StatCard label={t('next_month_forecast')} value={nextMonth} />
                <StatCard label={t('avg_forecast_12m')} value={avg !== null ? avg.toFixed(2) : '-'} />
                <StatCard label={t('min_forecast')} value={min !== null ? min.toFixed(2) : '-'} />
                <StatCard label={t('max_forecast')} value={max !== null ? max.toFixed(2) : '-'} />
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
      <p className="text-sm text-gray-600 font-medium">{label}</p>
      <p className="text-lg font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
