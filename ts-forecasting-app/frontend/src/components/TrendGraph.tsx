'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';

interface TrendGraphProps {
  data: any[];
  title: string;
}

export default function TrendGraph({ data, title }: TrendGraphProps) {
  // Calculate moving averages
  const calculateMovingAverage = (data: any[], window: number) => {
    return data.map((item, index) => {
      if (index < window - 1) return item;
      const avg = data.slice(index - window + 1, index + 1)
        .reduce((sum, d) => sum + d.value, 0) / window;
      return { ...item, [`ma${window}`]: Math.round(avg * 100) / 100 };
    });
  };

  const dataWithMA3 = calculateMovingAverage(data, 3);
  const dataWithMA6 = calculateMovingAverage(dataWithMA3, 6);
  const dataWithMA12 = calculateMovingAverage(dataWithMA6, 12);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={500}>
        <ComposedChart data={dataWithMA12}>
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
            name="Original Data"
            strokeWidth={1}
            opacity={0.5}
          />
          <Line 
            type="monotone" 
            dataKey="ma3" 
            stroke="#fbbf24" 
            dot={false}
            name="3-Month MA"
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="ma6" 
            stroke="#8b5cf6" 
            dot={false}
            name="6-Month MA"
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="ma12" 
            stroke="#ef4444" 
            dot={false}
            name="12-Month MA"
            strokeWidth={2.5}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
