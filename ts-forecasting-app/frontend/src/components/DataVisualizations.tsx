'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { AlertCircle } from 'lucide-react';

interface DataVisualizationsProps {
  data: any[];
  metadata: any;
  title?: string;
}

export default function DataVisualizations({ data, metadata, title = 'Time Series Visualizations' }: DataVisualizationsProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (data && data.length > 0) {
        const formatted = data.map((item: any) => ({
          date: typeof item.date === 'string' ? item.date.split('T')[0] : item.date,
          value: parseFloat(item.value) || 0,
          original_date: item.date
        }));
        setChartData(formatted);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [data]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-red-800">{error}</div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return <div className="text-center py-8 text-gray-600">No data available for visualization</div>;
  }

  // Calculate moving average for trend
  const calculateMovingAverage = (data: any[], window: number) => {
    return data.map((item, index) => {
      if (index < window - 1) return item;
      const avg = data.slice(index - window + 1, index + 1)
        .reduce((sum, d) => sum + d.value, 0) / window;
      return { ...item, ma: Math.round(avg * 100) / 100 };
    });
  };

  const dataWithMA = calculateMovingAverage(chartData, 12);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">Multiple visualization perspectives of your time series data</p>
      </div>

      {/* Time Series Line Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Series - Line Chart</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: any) => typeof value === 'number' ? value.toFixed(2) : value}
              labelStyle={{ color: '#000' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              dot={false}
              name="Value"
              strokeWidth={2}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Area Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Area Chart - Cumulative View</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
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
            <Area 
              type="monotone" 
              dataKey="value" 
              fill="#93c5fd" 
              stroke="#3b82f6"
              name="Value"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Time Series with Moving Average */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Analysis - With 12-Month Moving Average</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={dataWithMA}>
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
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              dot={false}
              name="Original"
              strokeWidth={1}
              opacity={0.6}
            />
            <Line 
              type="monotone" 
              dataKey="ma" 
              stroke="#ef4444" 
              dot={false}
              name="12-Month MA"
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Distribution Bar Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution - Bar Chart</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
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
            <Bar 
              dataKey="value" 
              fill="#10b981" 
              name="Value"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            label="Total Points" 
            value={chartData.length}
          />
          <StatCard 
            label="Mean Value" 
            value={(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length).toFixed(2)}
          />
          <StatCard 
            label="Min Value" 
            value={Math.min(...chartData.map(d => d.value)).toFixed(2)}
          />
          <StatCard 
            label="Max Value" 
            value={Math.max(...chartData.map(d => d.value)).toFixed(2)}
          />
          <StatCard 
            label="Range" 
            value={(Math.max(...chartData.map(d => d.value)) - Math.min(...chartData.map(d => d.value))).toFixed(2)}
          />
          <StatCard 
            label="Std Dev" 
            value={calculateStdDev(chartData).toFixed(2)}
          />
          <StatCard 
            label="Start Date" 
            value={chartData[0]?.date}
          />
          <StatCard 
            label="End Date" 
            value={chartData[chartData.length - 1]?.date}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
      <p className="text-sm text-gray-600 font-medium">{label}</p>
      <p className="text-lg font-bold text-gray-900 mt-1 truncate">{value}</p>
    </div>
  );
}

function calculateStdDev(data: any[]): number {
  const mean = data.reduce((sum, d) => sum + d.value, 0) / data.length;
  const variance = data.reduce((sum, d) => sum + Math.pow(d.value - mean, 2), 0) / data.length;
  return Math.sqrt(variance);
}
