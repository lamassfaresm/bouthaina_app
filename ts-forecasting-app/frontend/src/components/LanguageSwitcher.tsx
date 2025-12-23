'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`flex items-center gap-2 bg-white rounded-lg shadow px-4 py-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
      <Globe className="h-5 w-5 text-gray-600" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'fr' | 'ar')}
        className={`bg-transparent font-medium text-gray-700 focus:outline-none cursor-pointer ${language === 'ar' ? 'text-right' : ''}`}
      >
        <option value="en">English</option>
        <option value="fr">Français</option>
        <option value="ar">العربية</option>
      </select>
    </div>
  );
}
