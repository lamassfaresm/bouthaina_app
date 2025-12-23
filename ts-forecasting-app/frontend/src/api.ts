import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadCSV = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload/csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
  return response.data;
};

export const getDataForVisualization = async (sessionId: string) => {
  const response = await api.get(`/upload/preview/${sessionId}`);
  return response.data;
};

export const runEDA = async (sessionId: string) => {
  const response = await api.get(`/eda/${sessionId}`);
  return response.data;
};

export const splitData = async (sessionId: string, testRatio: number) => {
  const response = await api.post(`/modeling/${sessionId}/split`, { test_ratio: testRatio, forecast_steps: 12 });
  return response.data;
};

export const trainMovingAverage = async (sessionId: string, window: number) => {
  const response = await api.post(`/modeling/${sessionId}/moving-average`, { window, forecast_steps: 12 });
  return response.data;
};

export const trainLinearRegression = async (sessionId: string) => {
  const response = await api.post(`/modeling/${sessionId}/linear-regression`, { test_ratio: 0.3, forecast_steps: 12 });
  return response.data;
};

export const trainSES = async (sessionId: string, optimize: boolean = true, alpha?: number) => {
  const response = await api.post(`/modeling/${sessionId}/ses`, { alpha: alpha || 0.3, forecast_steps: 12, optimize });
  return response.data;
};

export const trainHolt = async (sessionId: string, optimize: boolean = true, alpha?: number, beta?: number) => {
  const response = await api.post(`/modeling/${sessionId}/holt`, { alpha: alpha || 0.3, beta: beta || 0.1, forecast_steps: 12, optimize });
  return response.data;
};

export const trainHoltWintersAdd = async (sessionId: string, optimize: boolean = true, alpha?: number, beta?: number, gamma?: number) => {
  const response = await api.post(`/modeling/${sessionId}/holt-winters-additive`, { alpha: alpha || 0.3, beta: beta || 0.1, gamma: gamma || 0.1, season_length: 12, forecast_steps: 12, optimize });
  return response.data;
};

export const trainHoltWintersMult = async (sessionId: string, optimize: boolean = true, alpha?: number, beta?: number, gamma?: number) => {
  const response = await api.post(`/modeling/${sessionId}/holt-winters-multiplicative`, { alpha: alpha || 0.3, beta: beta || 0.1, gamma: gamma || 0.1, season_length: 12, forecast_steps: 12, optimize });
  return response.data;
};

export const createExecutionLog = async (sessionId: string, trainSize: number, testSize: number) => {
  const response = await api.post(`/logs/${sessionId}/create-execution-log`, { train_size: trainSize, test_size: testSize });
  return response.data;
};

export const exportForecastJSON = async (sessionId: string, modelName: string) => {
  const response = await api.post(`/export/${sessionId}/forecast-json`, { model_name: modelName });
  return response.data;
};

export const exportReportPDF = async (sessionId: string) => {
  const response = await api.post(`/export/${sessionId}/report-pdf`, {}, { responseType: 'blob' });
  return response.data;
};

export const getExecutionLog = async (sessionId: string) => {
  const response = await api.get(`/logs/${sessionId}/execution-log`);
  return response.data;
};
