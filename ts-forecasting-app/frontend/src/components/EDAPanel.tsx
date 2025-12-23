'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { runEDA } from '@/api';

interface EDAAnalysisProps {
  sessionId: string;
}

export default function EDAAnalysis({ sessionId }: EDAAnalysisProps) {
  const [edaData, setEdaData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEDA = async () => {
      try {
        setIsLoading(true);
        const data = await runEDA(sessionId);
        setEdaData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchEDA();
    }
  }, [sessionId]);

  if (isLoading) {
    return <div className="text-center py-8"><div className="animate-spin inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div></div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-red-800">{error}</div>
      </div>
    );
  }

  if (!edaData) {
    return null;
  }

  const { summary_statistics, eda_results } = edaData;
  const adf = eda_results?.adf_test;
  const trend = eda_results?.trend_detection;

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatItem label="Mean" value={summary_statistics?.mean} />
          <StatItem label="Std Dev" value={summary_statistics?.std} />
          <StatItem label="Min" value={summary_statistics?.min} />
          <StatItem label="Max" value={summary_statistics?.max} />
          <StatItem label="Median" value={summary_statistics?.median} />
          <StatItem label="Q1" value={summary_statistics?.q25} />
          <StatItem label="Q3" value={summary_statistics?.q75} />
          <StatItem label="Count" value={summary_statistics?.count} />
        </div>
      </div>

      {/* Stationarity Tests */}
      {adf && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stationarity Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TestResult 
              title="Augmented Dickey-Fuller Test"
              interpretation={adf.interpretation}
              pValue={adf.p_value}
              isStationary={adf.is_stationary}
            />
            {eda_results?.kpss_test && (
              <TestResult 
                title="KPSS Test"
                interpretation={eda_results.kpss_test.interpretation}
                pValue={eda_results.kpss_test.p_value}
                isStationary={eda_results.kpss_test.is_stationary}
              />
            )}
          </div>
        </div>
      )}

      {/* Trend Analysis */}
      {trend && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trend Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatItem label="Direction" value={trend.direction} />
            <StatItem label="Slope" value={trend.slope} />
            <StatItem label="Strength (R²)" value={trend.strength} />
          </div>
        </div>
      )}
    </div>
  );
}

function StatItem({ label, value }: any) {
  return (
    <div>
      <p className="text-xs text-gray-600 font-medium">{label}</p>
      <p className="text-lg font-semibold text-gray-900">
        {typeof value === 'number' ? value.toFixed(4) : value}
      </p>
    </div>
  );
}

function TestResult({ title, interpretation, pValue, isStationary }: any) {
  const statusColor = isStationary ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  
  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
      <div className={`rounded p-3 ${statusColor}`}>
        <p className="font-semibold">{interpretation}</p>
        <p className="text-sm">p-value: {pValue?.toFixed(6)}</p>
      </div>
    </div>
  );
}
