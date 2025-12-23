'use client';

import React, { useState } from 'react';
import { Download, TrendingUp, Settings, BarChart3 } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import EDAPanel from '@/components/EDAPanel';
import ModelTrainer from '@/components/ModelTrainer';
import DataVisualizations from '@/components/DataVisualizations';
import TrendGraph from '@/components/TrendGraph';
import ForecastResults from '@/components/ForecastResults';
import ModelComparison from '@/components/ModelComparison';
import RegressionAnalysis from '@/components/RegressionAnalysis';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { splitData, createExecutionLog, getDataForVisualization, exportReportPDF } from '@/api';
import { useLanguage } from '@/context/LanguageContext';

type Step = 'upload' | 'preview' | 'graphs' | 'eda' | 'modeling' | 'forecast' | 'results';

export default function Home() {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [uploadData, setUploadData] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [trainSize, setTrainSize] = useState(0);
  const [testSize, setTestSize] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [visualizationData, setVisualizationData] = useState<any>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [executionLogCreated, setExecutionLogCreated] = useState(false);

  const handleUploadSuccess = (data: any) => {
    setUploadError(null);
    setSessionId(data.session_id);
    setUploadData(data);
    setCurrentStep('preview');
  };

  const handleProceedToGraphs = async () => {
    if (!sessionId) return;
    
    setIsProcessing(true);
    try {
      const data = await getDataForVisualization(sessionId);
      setVisualizationData(data);
      setCurrentStep('graphs');
    } catch (error) {
      console.error('Error loading visualization data:', error);
      alert('Failed to load data for visualization');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceedToEDA = async () => {
    if (!sessionId) return;
    
    setIsProcessing(true);
    try {
      // Split data before EDA
      await splitData(sessionId, 0.3);
      setTrainSize(Math.floor((uploadData.metadata.rows * 0.7)));
      setTestSize(Math.floor((uploadData.metadata.rows * 0.3)));
      setCurrentStep('eda');
    } catch (error) {
      console.error('Error splitting data:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceedToModeling = () => {
    setCurrentStep('modeling');
  };

  const handleExportResults = async () => {
    if (!sessionId) return;
    
    try {
      const log = await createExecutionLog(sessionId, trainSize, testSize);
      console.log('Execution log created:', log);
      setExecutionLogCreated(true);
      setCurrentStep('results');
    } catch (error) {
      console.error('Error creating execution log:', error);
    }
  };

  const handleDownloadReport = async () => {
    if (!sessionId) {
      alert('No session available to export.');
      return;
    }
    setDownloadLoading(true);
    try {
      if (!executionLogCreated) {
        await createExecutionLog(sessionId, trainSize, testSize);
        setExecutionLogCreated(true);
      }
      const blob = await exportReportPDF(sessionId);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'time_series_forecast_report.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
      alert(t('download_failed'));
    } finally {
      setDownloadLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('upload_title')}</h2>
              <p className="text-gray-600">{t('upload_description')}</p>
            </div>
            <FileUpload onSuccess={handleUploadSuccess} onError={(e) => setUploadError(e)} />
            {uploadError && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg p-3">
                {uploadError}
              </div>
            )}
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('preview_title')}</h2>
              <p className="text-gray-600">{t('preview_description')}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('file_info')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">{t('total_rows')}</p>
                  <p className="text-2xl font-bold text-gray-900">{uploadData?.metadata?.rows}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('start_date')}</p>
                  <p className="text-lg font-semibold text-gray-900">{uploadData?.metadata?.date_range?.start?.split('T')[0]}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('end_date')}</p>
                  <p className="text-lg font-semibold text-gray-900">{uploadData?.metadata?.date_range?.end?.split('T')[0]}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('missing_values')}</p>
                  <p className="text-2xl font-bold text-gray-900">{uploadData?.metadata?.missing_values}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleProceedToGraphs}
              disabled={isProcessing}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                isProcessing
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isProcessing ? 'Processing...' : t('view_graphs')}
            </button>
          </div>
        );

      case 'graphs':
        return (
          <div className="space-y-6">
            {visualizationData ? (
              <>
                <DataVisualizations 
                  data={visualizationData.preview || []} 
                  metadata={uploadData?.metadata}
                  title={t('graphs_title')}
                />
                <TrendGraph 
                  data={visualizationData.preview || []} 
                  title={t('trend_graph')}
                />
              </>
            ) : (
              <div className="text-center py-8"><div className="animate-spin inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div></div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setCurrentStep('preview')}
                className="py-3 rounded-lg font-semibold bg-gray-600 text-white hover:bg-gray-700 transition-all"
              >
                {t('back_preview')}
              </button>
              <button
                onClick={handleProceedToEDA}
                className="py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all"
              >
                {t('continue_analysis')}
              </button>
            </div>
          </div>
        );

      case 'eda':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('eda_title')}</h2>
              <p className="text-gray-600">{t('eda_description')}</p>
            </div>
            
            {sessionId && <EDAPanel sessionId={sessionId} />}
            
            {visualizationData && (
              <RegressionAnalysis data={visualizationData.preview || []} />
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setCurrentStep('modeling')}
                className="py-3 rounded-lg font-semibold bg-gray-600 text-white hover:bg-gray-700 transition-all"
              >
                {t('skip_to_modeling')}
              </button>
              <button
                onClick={handleProceedToModeling}
                className="w-full py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all"
              >
                {t('proceed_modeling')}
              </button>
            </div>
          </div>
        );      case 'modeling':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('modeling_title')}</h2>
              <p className="text-gray-600">{t('modeling_description')}</p>
            </div>
            
            {sessionId && (
              <ModelTrainer 
                sessionId={sessionId}
                onModelTrained={() => {
                  // Update models list
                }}
              />
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setCurrentStep('forecast')}
                className="py-3 rounded-lg font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-all"
              >
                {t('view_forecast_comparison')}
              </button>
              <button
                onClick={handleExportResults}
                className="py-3 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-all flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                {t('export_results')}
              </button>
            </div>
          </div>
        );

      case 'forecast':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('forecast_title')} & {t('model_comparison')}</h2>
              <p className="text-gray-600">View forecast results and compare model performance</p>
            </div>

            {sessionId && visualizationData && (
              <>
                <ForecastResults sessionId={sessionId} data={visualizationData.preview || []} />
                <ModelComparison sessionId={sessionId} />
              </>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setCurrentStep('graphs')}
                className="py-3 rounded-lg font-semibold bg-gray-600 text-white hover:bg-gray-700 transition-all"
              >
                {t('back_to_graphs')}
              </button>
              <button
                onClick={() => setCurrentStep('modeling')}
                className="py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all"
              >
                {t('back_to_modeling')}
              </button>
              <button
                onClick={handleExportResults}
                className="py-3 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-all"
              >
                {t('export_results')}
              </button>
            </div>
          </div>
        );


      case 'results':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Complete</h2>
              <p className="text-gray-600">Your time series analysis has been completed successfully</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Results Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Training Set Size</span>
                  <span className="font-semibold text-gray-900">{trainSize} records</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Test Set Size</span>
                  <span className="font-semibold text-gray-900">{testSize} records</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Session ID</span>
                  <span className="font-mono text-sm text-gray-600 truncate">{sessionId}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setCurrentStep('upload')}
                className="py-3 rounded-lg font-semibold bg-gray-600 text-white hover:bg-gray-700 transition-all"
              >
                Analyze New File
              </button>
              <button
                className="py-3 rounded-lg font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                onClick={handleDownloadReport}
                disabled={downloadLoading}
              >
                <Download className="h-4 w-4" />
                {downloadLoading ? 'Preparing...' : t('download_report')}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Language Switcher */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">Time Series Forecasting</h1>
            </div>
            <LanguageSwitcher />
          </div>
          <p className="text-gray-600">Professional forecasting tool with automatic model selection</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {['upload', 'preview', 'graphs', 'eda', 'modeling', 'forecast', 'results'].map((step, index) => (
            <div key={step} className="flex items-center flex-shrink-0">
              <button
                onClick={() => setCurrentStep(step as Step)}
                className={`w-10 h-10 rounded-full font-semibold flex items-center justify-center transition-all text-xs ${
                  step === currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                {index + 1}
              </button>
              {index < 4 && <div className="h-1 w-4 bg-gray-300 mx-1"></div>}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
