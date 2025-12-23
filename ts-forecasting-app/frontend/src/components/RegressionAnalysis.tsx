'use client';

import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { useLanguage } from '@/context/LanguageContext';

interface RegressionAnalysisProps {
  data: any[];
}

export default function RegressionAnalysis({ data }: RegressionAnalysisProps) {
  const { t } = useLanguage();

  const regressionMetrics = useMemo(() => {
    if (!data || data.length < 2) return null;

    const n = data.length;
    const values = data.map(d => d.value);
    
    // Calculate mean
    const mean = values.reduce((sum, v) => sum + v, 0) / n;
    
    // Linear regression (y = a + bx)
    const xValues = Array.from({ length: n }, (_, i) => i);
    const xySum = xValues.reduce((sum, x, i) => sum + x * values[i], 0);
    const x2Sum = xValues.reduce((sum, x) => sum + x * x, 0);
    const xSum = xValues.reduce((sum, x) => sum + x, 0);
    const ySum = values.reduce((sum, y) => sum + y, 0);
    
    const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);
    const intercept = (ySum - slope * xSum) / n;
    
    // R-squared
    const yPredicted = xValues.map(x => intercept + slope * x);
    const ssRes = values.reduce((sum, y, i) => sum + Math.pow(y - yPredicted[i], 2), 0);
    const ssTot = values.reduce((sum, y) => sum + Math.pow(y - mean, 2), 0);
    const rSquared = 1 - (ssRes / ssTot);
    
    // Correlation coefficient
    const correlation = Math.sqrt(Math.abs(rSquared));
    
    // Standard error
    const stdError = Math.sqrt(ssRes / (n - 2));
    
    // P-value approximation (simplified)
    const tStat = Math.abs(slope) / stdError;
    
    return {
      slope: slope.toFixed(4),
      intercept: intercept.toFixed(2),
      rSquared: (rSquared * 100).toFixed(2),
      correlation: correlation.toFixed(4),
      stdError: stdError.toFixed(2),
      tStat: tStat.toFixed(4),
      mean: mean.toFixed(2),
      yPredicted
    };
  }, [data]);

  const seasonalityStats = useMemo(() => {
    if (!data || data.length < 12) return null;

    const values = data.map(d => d.value);
    const monthlyGroups: { [key: number]: number[] } = {};
    
    // Group by position in year (assuming 12 periods per year)
    for (let i = 0; i < values.length; i++) {
      const monthIndex = i % 12;
      if (!monthlyGroups[monthIndex]) monthlyGroups[monthIndex] = [];
      monthlyGroups[monthIndex].push(values[i]);
    }
    
    const seasonalPattern = Object.entries(monthlyGroups).map(([month, vals]) => {
      const avg = vals.reduce((sum, v) => sum + v, 0) / vals.length;
      const variance = vals.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / vals.length;
      return {
        month: parseInt(month) + 1,
        average: avg.toFixed(2),
        variance: variance.toFixed(2),
        count: vals.length
      };
    });

    // Calculate seasonality strength
    const overallMean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const seasonalVar = seasonalPattern.reduce((sum, p) => sum + Math.pow(parseFloat(p.average) - overallMean, 2), 0) / seasonalPattern.length;
    const residualVar = values.reduce((sum, v) => sum + Math.pow(v - overallMean, 2), 0) / values.length;
    const seasonalityStrength = (seasonalVar / residualVar * 100).toFixed(2);

    return {
      pattern: seasonalPattern,
      strength: seasonalityStrength
    };
  }, [data]);

  const movingAverageStats = useMemo(() => {
    if (!data || data.length < 12) return null;

    const values = data.map(d => d.value);
    const ma3 = [];
    const ma6 = [];
    const ma12 = [];

    for (let i = 0; i < values.length; i++) {
      if (i >= 2) {
        const avg3 = (values[i] + values[i-1] + values[i-2]) / 3;
        ma3.push(avg3);
      }
      if (i >= 5) {
        const avg6 = values.slice(i - 5, i + 1).reduce((sum, v) => sum + v, 0) / 6;
        ma6.push(avg6);
      }
      if (i >= 11) {
        const avg12 = values.slice(i - 11, i + 1).reduce((sum, v) => sum + v, 0) / 12;
        ma12.push(avg12);
      }
    }

    return {
      ma3: {
        avg: (ma3.reduce((sum, v) => sum + v, 0) / ma3.length).toFixed(2),
        std: (Math.sqrt(ma3.reduce((sum, v, i) => {
          const mean = ma3.reduce((s, x) => s + x, 0) / ma3.length;
          return sum + Math.pow(v - mean, 2);
        }, 0) / ma3.length)).toFixed(2)
      },
      ma6: {
        avg: (ma6.reduce((sum, v) => sum + v, 0) / ma6.length).toFixed(2),
        std: (Math.sqrt(ma6.reduce((sum, v, i) => {
          const mean = ma6.reduce((s, x) => s + x, 0) / ma6.length;
          return sum + Math.pow(v - mean, 2);
        }, 0) / ma6.length)).toFixed(2)
      },
      ma12: {
        avg: (ma12.reduce((sum, v) => sum + v, 0) / ma12.length).toFixed(2),
        std: (Math.sqrt(ma12.reduce((sum, v, i) => {
          const mean = ma12.reduce((s, x) => s + x, 0) / ma12.length;
          return sum + Math.pow(v - mean, 2);
        }, 0) / ma12.length)).toFixed(2)
      }
    };
  }, [data]);

  if (!regressionMetrics || !seasonalityStats || !movingAverageStats) {
    return <div className="text-center py-4 text-gray-600">Insufficient data for analysis</div>;
  }

  return (
    <div className="space-y-6">
      {/* Regression Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Linear Regression Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricCard label="Slope" value={regressionMetrics.slope} />
          <MetricCard label="Intercept" value={regressionMetrics.intercept} />
          <MetricCard label="R² (%)" value={regressionMetrics.rSquared} />
          <MetricCard label="Correlation" value={regressionMetrics.correlation} />
          <MetricCard label="Std Error" value={regressionMetrics.stdError} />
          <MetricCard label="T-Statistic" value={regressionMetrics.tStat} />
          <MetricCard label="Mean" value={regressionMetrics.mean} />
          <MetricCard label="Trend" value={parseFloat(regressionMetrics.slope) > 0 ? 'Upward' : 'Downward'} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-900">Metric</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-900">Description</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-900">Value</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-900">Interpretation</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">Slope (β1)</td>
                <td className="px-4 py-2 text-gray-600">Rate of change per period</td>
                <td className="px-4 py-2 text-right font-semibold text-blue-600">{regressionMetrics.slope}</td>
                <td className="px-4 py-2 text-gray-600">{parseFloat(regressionMetrics.slope) > 0 ? 'Increasing trend' : 'Decreasing trend'}</td>
              </tr>
              <tr className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">Intercept (β0)</td>
                <td className="px-4 py-2 text-gray-600">Starting value at time 0</td>
                <td className="px-4 py-2 text-right font-semibold text-blue-600">{regressionMetrics.intercept}</td>
                <td className="px-4 py-2 text-gray-600">Baseline value</td>
              </tr>
              <tr className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">R-Squared</td>
                <td className="px-4 py-2 text-gray-600">Model fit quality</td>
                <td className="px-4 py-2 text-right font-semibold text-blue-600">{regressionMetrics.rSquared}%</td>
                <td className="px-4 py-2 text-gray-600">{parseFloat(regressionMetrics.rSquared) > 70 ? 'Good fit' : parseFloat(regressionMetrics.rSquared) > 50 ? 'Moderate fit' : 'Poor fit'}</td>
              </tr>
              <tr className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">Correlation</td>
                <td className="px-4 py-2 text-gray-600">Linear relationship strength</td>
                <td className="px-4 py-2 text-right font-semibold text-blue-600">{regressionMetrics.correlation}</td>
                <td className="px-4 py-2 text-gray-600">{parseFloat(regressionMetrics.correlation) > 0.7 ? 'Strong' : parseFloat(regressionMetrics.correlation) > 0.5 ? 'Moderate' : 'Weak'}</td>
              </tr>
              <tr className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">Std Error</td>
                <td className="px-4 py-2 text-gray-600">Estimation error</td>
                <td className="px-4 py-2 text-right font-semibold text-blue-600">{regressionMetrics.stdError}</td>
                <td className="px-4 py-2 text-gray-600">Lower is better</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Seasonality Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Seasonality Analysis</h3>
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Seasonality Strength:</span> {seasonalityStats.strength}%
            <span className="ml-4 text-xs text-gray-600">
              {parseFloat(seasonalityStats.strength) > 50 ? 'Strong seasonality detected' : 
               parseFloat(seasonalityStats.strength) > 30 ? 'Moderate seasonality' : 
               'Weak seasonality'}
            </span>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-900">Month</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-900">Average</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-900">Variance</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-900">Count</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-900">Pattern</th>
              </tr>
            </thead>
            <tbody>
              {seasonalityStats.pattern.map((p, idx) => (
                <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">Month {p.month}</td>
                  <td className="px-4 py-2 text-right text-blue-600 font-semibold">{p.average}</td>
                  <td className="px-4 py-2 text-right text-gray-600">{p.variance}</td>
                  <td className="px-4 py-2 text-right text-gray-600">{p.count}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${(parseFloat(p.average) / 622) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moving Average Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Moving Average Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">3-Month MA</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Average:</span>
                <span className="font-semibold text-blue-600">{movingAverageStats.ma3.avg}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Std Dev:</span>
                <span className="font-semibold text-blue-600">{movingAverageStats.ma3.std}</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">6-Month MA</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Average:</span>
                <span className="font-semibold text-blue-600">{movingAverageStats.ma6.avg}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Std Dev:</span>
                <span className="font-semibold text-blue-600">{movingAverageStats.ma6.std}</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">12-Month MA</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Average:</span>
                <span className="font-semibold text-blue-600">{movingAverageStats.ma12.avg}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Std Dev:</span>
                <span className="font-semibold text-blue-600">{movingAverageStats.ma12.std}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
      <p className="text-xs font-medium text-gray-600 uppercase">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
