'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'fr' | 'ar';

interface Translations {
  [key: string]: {
    en: string;
    fr: string;
    ar: string;
  };
}

const translations: Translations = {
  'upload_title': {
    en: 'Upload Time Series Data',
    fr: 'Télécharger les données de série temporelle',
    ar: 'تحميل بيانات السلاسل الزمنية'
  },
  'upload_description': {
    en: 'Start by uploading your CSV file with date and value columns',
    fr: 'Commencez par télécharger votre fichier CSV avec des colonnes de date et de valeur',
    ar: 'ابدأ بتحميل ملف CSV الخاص بك مع أعمدة التاريخ والقيمة'
  },
  'preview_title': {
    en: 'Data Preview',
    fr: 'Aperçu des données',
    ar: 'معاينة البيانات'
  },
  'preview_description': {
    en: 'Review the uploaded data before analysis',
    fr: 'Examinez les données téléchargées avant l\'analyse',
    ar: 'راجع البيانات المحملة قبل التحليل'
  },
  'graphs_title': {
    en: 'Time Series Data Visualizations',
    fr: 'Visualisations des données de série temporelle',
    ar: 'تصورات بيانات السلاسل الزمنية'
  },
  'trend_graph': {
    en: 'Trend Analysis - With Moving Average',
    fr: 'Analyse des tendances - Avec moyenne mobile',
    ar: 'تحليل الاتجاه - مع المتوسط المتحرك'
  },
  'forecast_title': {
    en: 'Forecast Results',
    fr: 'Résultats des prévisions',
    ar: 'نتائج التنبؤ'
  },
  'select_model': {
    en: 'Select Model:',
    fr: 'Sélectionner le modèle:',
    ar: 'اختر النموذج:'
  },
  'forecast_summary': {
    en: 'Forecast Summary',
    fr: 'Résumé des prévisions',
    ar: 'ملخص التنبؤ'
  },
  'next_month_forecast': {
    en: 'Next Month Forecast',
    fr: 'Prévision du mois prochain',
    ar: 'توقع الشهر القادم'
  },
  'avg_forecast_12m': {
    en: 'Avg Forecast (12M)',
    fr: 'Prévision moyenne (12M)',
    ar: 'متوسط التوقع (12 شهر)'
  },
  'min_forecast': {
    en: 'Min Forecast',
    fr: 'Prévision minimale',
    ar: 'أدنى توقع'
  },
  'max_forecast': {
    en: 'Max Forecast',
    fr: 'Prévision maximale',
    ar: 'أعلى توقع'
  },
  'model_moving_average': {
    en: 'Moving Average',
    fr: 'Moyenne mobile',
    ar: 'المتوسط المتحرك'
  },
  'model_linear_regression': {
    en: 'Linear Regression',
    fr: 'Régression linéaire',
    ar: 'الانحدار الخطي'
  },
  'model_holt_winters': {
    en: 'Holt-Winters',
    fr: 'Holt-Winters',
    ar: 'هولت-وينترز'
  },
  'model_arima': {
    en: 'ARIMA',
    fr: 'ARIMA',
    ar: 'ARIMA'
  },
  'model_comparison': {
    en: 'Model Comparison',
    fr: 'Comparaison des modèles',
    ar: 'مقارنة النماذج'
  },
  'eda_title': {
    en: 'Exploratory Data Analysis',
    fr: 'Analyse exploratoire des données',
    ar: 'تحليل استكشافي للبيانات'
  },
  'eda_description': {
    en: 'Analyze trends, seasonality, and statistical properties',
    fr: 'Analysez les tendances, la saisonnalité et les propriétés statistiques',
    ar: 'تحليل الاتجاهات والموسمية والخصائص الإحصائية'
  },
  'modeling_title': {
    en: 'Model Training & Selection',
    fr: 'Formation et sélection des modèles',
    ar: 'تدريب واختيار النماذج'
  },
  'modeling_description': {
    en: 'Train multiple models and compare their performance',
    fr: 'Entraînez plusieurs modèles et comparez leurs performances',
    ar: 'قم بتدريب نماذج متعددة ومقارنة أدائها'
  },
  'view_graphs': {
    en: 'View Graphs',
    fr: 'Voir les graphiques',
    ar: 'عرض الرسوم البيانية'
  },
  'continue_analysis': {
    en: 'Continue to Analysis',
    fr: 'Continuer l\'analyse',
    ar: 'متابعة التحليل'
  },
  'proceed_modeling': {
    en: 'Proceed to Model Training',
    fr: 'Procéder à la formation du modèle',
    ar: 'المتابعة إلى تدريب النموذج'
  },
  'export_results': {
    en: 'Generate Execution Log & Results',
    fr: 'Générer le journal d\'exécution et les résultats',
    ar: 'توليد سجل التنفيذ والنتائج'
  },
  'back_preview': {
    en: 'Back to Preview',
    fr: 'Retour à l\'aperçu',
    ar: 'العودة إلى المعاينة'
  },
  'back_to_graphs': {
    en: 'Back to Graphs',
    fr: 'Retour aux graphiques',
    ar: 'العودة إلى الرسوم البيانية'
  },
  'back_to_modeling': {
    en: 'Back to Modeling',
    fr: 'Retour à la modélisation',
    ar: 'العودة إلى النمذجة'
  },
  'total_rows': {
    en: 'Total Rows',
    fr: 'Nombre total de lignes',
    ar: 'إجمالي الصفوف'
  },
  'start_date': {
    en: 'Start Date',
    fr: 'Date de début',
    ar: 'تاريخ البداية'
  },
  'end_date': {
    en: 'End Date',
    fr: 'Date de fin',
    ar: 'تاريخ النهاية'
  },
  'missing_values': {
    en: 'Missing Values',
    fr: 'Valeurs manquantes',
    ar: 'القيم المفقودة'
  },
  'file_info': {
    en: 'File Information',
    fr: 'Informations sur le fichier',
    ar: 'معلومات الملف'
  },
  'regression_analysis': {
    en: 'Linear Regression Analysis',
    fr: 'Analyse de régression linéaire',
    ar: 'تحليل الانحدار الخطي'
  },
  'seasonality_analysis': {
    en: 'Seasonality Analysis',
    fr: 'Analyse de la saisonnalité',
    ar: 'تحليل الموسمية'
  },
  'moving_average_stats': {
    en: 'Moving Average Statistics',
    fr: 'Statistiques de la moyenne mobile',
    ar: 'إحصائيات المتوسط المتحرك'
  },
  'slope': {
    en: 'Slope',
    fr: 'Pente',
    ar: 'المنحدر'
  },
  'intercept': {
    en: 'Intercept',
    fr: 'Ordonnée à l\'origine',
    ar: 'الحد الثابت'
  },
  'r_squared': {
    en: 'R-Squared (%)',
    fr: 'R² (%)',
    ar: 'مربع R (%)'
  },
  'correlation': {
    en: 'Correlation',
    fr: 'Corrélation',
    ar: 'الارتباط'
  },
  'std_error': {
    en: 'Std Error',
    fr: 'Erreur Std',
    ar: 'الخطأ المعياري'
  },
  'trend': {
    en: 'Trend',
    fr: 'Tendance',
    ar: 'الاتجاه'
  },
  'upward': {
    en: 'Upward',
    fr: 'Croissant',
    ar: 'صاعد'
  },
  'downward': {
    en: 'Downward',
    fr: 'Décroissant',
    ar: 'هابط'
  },
  'seasonality_strength': {
    en: 'Seasonality Strength',
    fr: 'Force de la saisonnalité',
    ar: 'قوة الموسمية'
  },
  'month': {
    en: 'Month',
    fr: 'Mois',
    ar: 'الشهر'
  },
  'average': {
    en: 'Average',
    fr: 'Moyenne',
    ar: 'المتوسط'
  },
  'variance': {
    en: 'Variance',
    fr: 'Variance',
    ar: 'التباين'
  },
  'count': {
    en: 'Count',
    fr: 'Nombre',
    ar: 'العدد'
  },
  'skip_to_modeling': {
    en: 'Skip to Modeling',
    fr: 'Ignorer la modélisation',
    ar: 'تخطي إلى النمذجة'
  },
  'view_forecast_comparison': {
    en: 'View Forecast & Comparison',
    fr: 'Voir la prévision et la comparaison',
    ar: 'عرض التنبؤ والمقارنة'
  },
  'download_report': {
    en: 'Download Report',
    fr: 'Télécharger le rapport',
    ar: 'تنزيل التقرير'
  },
  'download_failed': {
    en: 'Download failed. Please try again.',
    fr: 'Échec du téléchargement. Veuillez réessayer.',
    ar: 'فشل التنزيل. الرجاء المحاولة مرة أخرى.'
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('app_language') as Language | null;
      if (saved) {
        setLanguageState(saved);
      }
    } catch (e) {
      // ignore localStorage errors
    }
  }, []);

  useEffect(() => {
    // update document language and direction whenever language changes
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('app_language', lang);
    } catch (e) {
      // ignore localStorage errors
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
