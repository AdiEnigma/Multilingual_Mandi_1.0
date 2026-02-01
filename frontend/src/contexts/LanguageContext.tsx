import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { logger } from '@/utils/logger';

export type SupportedLanguage = 
  | 'en' | 'as' | 'bn' | 'brx' | 'doi' | 'gu' | 'hi' | 'kn' | 'ks' | 'gom' | 'mai' 
  | 'ml' | 'mni' | 'mr' | 'ne' | 'or' | 'pa' | 'sa' | 'sat' | 'sd' | 'ta' | 'te' | 'ur';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  isRTL: boolean;
  getLanguageName: (code: SupportedLanguage) => string;
  getSupportedLanguages: () => { code: SupportedLanguage; name: string; nativeName: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const languageMap: Record<SupportedLanguage, { name: string; nativeName: string; rtl: boolean }> = {
  en: { name: 'English', nativeName: 'English', rtl: false },
  as: { name: 'Assamese', nativeName: 'অসমীয়া', rtl: false },
  bn: { name: 'Bengali', nativeName: 'বাংলা', rtl: false },
  brx: { name: 'Bodo', nativeName: 'बर\u0027', rtl: false },
  doi: { name: 'Dogri', nativeName: 'डोगरी', rtl: false },
  gu: { name: 'Gujarati', nativeName: 'ગુજરાતી', rtl: false },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', rtl: false },
  kn: { name: 'Kannada', nativeName: 'ಕನ್ನಡ', rtl: false },
  ks: { name: 'Kashmiri', nativeName: 'کٲشُر', rtl: true },
  gom: { name: 'Konkani', nativeName: 'कोंकणी', rtl: false },
  mai: { name: 'Maithili', nativeName: 'मैथिली', rtl: false },
  ml: { name: 'Malayalam', nativeName: 'മലയാളം', rtl: false },
  mni: { name: 'Manipuri', nativeName: 'মৈতৈলোন্', rtl: false },
  mr: { name: 'Marathi', nativeName: 'मराठी', rtl: false },
  ne: { name: 'Nepali', nativeName: 'नेपाली', rtl: false },
  or: { name: 'Odia', nativeName: 'ଓଡ଼ିଆ', rtl: false },
  pa: { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', rtl: false },
  sa: { name: 'Sanskrit', nativeName: 'संस्कृतम्', rtl: false },
  sat: { name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', rtl: false },
  sd: { name: 'Sindhi', nativeName: 'سنڌي', rtl: true },
  ta: { name: 'Tamil', nativeName: 'தமிழ்', rtl: false },
  te: { name: 'Telugu', nativeName: 'తెలుగు', rtl: false },
  ur: { name: 'Urdu', nativeName: 'اردو', rtl: true },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const router = useRouter();
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(() => {
    // Initialize from router locale first, then fallback to stored preference
    const routerLocale = router.locale as SupportedLanguage;
    if (routerLocale && languageMap[routerLocale]) {
      return routerLocale;
    }
    return 'hi'; // Default fallback
  });

  useEffect(() => {
    // Update current language when router locale changes
    const routerLocale = router.locale as SupportedLanguage;
    if (routerLocale && languageMap[routerLocale] && routerLocale !== currentLanguage) {
      setCurrentLanguage(routerLocale);
      // Store the preference
      if (typeof window !== 'undefined') {
        localStorage.setItem('preferred_language', routerLocale);
      }
    }
  }, [router.locale, currentLanguage]);

  const setLanguage = async (language: SupportedLanguage) => {
    try {
      // Store preference
      if (typeof window !== 'undefined') {
        localStorage.setItem('preferred_language', language);
      }
      
      // Update Next.js locale - this will trigger a page reload with new locale
      await router.push(router.asPath, router.asPath, { locale: language });
      
      logger.info('Language changed to:', language);
    } catch (error) {
      logger.error('Failed to change language:', error);
    }
  };

  const isRTL = languageMap[currentLanguage]?.rtl || false;

  const getLanguageName = (code: SupportedLanguage): string => {
    return languageMap[code]?.name || code;
  };

  const getSupportedLanguages = () => {
    return Object.entries(languageMap).map(([code, info]) => ({
      code: code as SupportedLanguage,
      name: info.name,
      nativeName: info.nativeName,
    }));
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    isRTL,
    getLanguageName,
    getSupportedLanguages,
  };

  return (
    <LanguageContext.Provider value={value}>
      <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}