'use client';

import React, { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { uploadCSV } from '@/api';

interface FileUploadProps {
  onSuccess: (data: any) => void;
  onError: (error: string) => void;
}

export default function FileUpload({ onSuccess, onError }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      onError('Please upload a CSV file');
      return;
    }

    setIsLoading(true);
    try {
      const data = await uploadCSV(file);
      onSuccess(data);
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message;
      onError(backendMessage ? String(backendMessage) : 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 bg-gray-50 hover:border-gray-400'
      }`}
    >
      <input
        type="file"
        accept=".csv"
        onChange={handleFileInput}
        disabled={isLoading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      
      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      
      <p className="text-lg font-semibold text-gray-900 mb-2">
        Drop your CSV file here
      </p>
      <p className="text-sm text-gray-600 mb-4">
        or click to browse
      </p>
      
      <p className="text-xs text-gray-500">
        Supported format: CSV with date and value columns
      </p>

      {isLoading && (
        <div className="mt-4">
          <div className="animate-spin inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="text-sm text-gray-600 mt-2">Uploading and processing...</p>
        </div>
      )}
    </div>
  );
}
