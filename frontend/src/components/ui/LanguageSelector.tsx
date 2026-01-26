import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { ChevronDownIcon, CheckIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/LanguageContext';
import useLanguagePreference from '@/hooks/useLanguagePreference';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

interface LanguageSelectorProps {
  variant?: 'default' | 'compact' | 'icon-only';
  className?: string;
  showLabel?: boolean;
}

export function LanguageSelector({ 
  variant = 'default', 
  className = '',
  showLabel = true 
}: LanguageSelectorProps) {
  const { t } = useTranslation('common');
  const { currentLanguage, getSupportedLanguages } = useLanguage();
  const { updateLanguagePreference, isLoading } = useLanguagePreference();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const supportedLanguages = getSupportedLanguages();
  const currentLangInfo = supportedLanguages.find(lang => lang.code === currentLanguage);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode === currentLanguage) {
      setIsOpen(false);
      return;
    }

    try {
      await updateLanguagePreference(languageCode as any);
      setIsOpen(false);
      toast.success(t('success'));
    } catch (error) {
      console.error('Failed to change language:', error);
      toast.error(t('error'));
    }
  };

  const renderTrigger = () => {
    const baseClasses = "flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors";
    
    if (variant === 'icon-only') {
      return (
        <button
          type="button"
          className={clsx(
            "p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors",
            className
          )}
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          title={t('selectLanguage')}
        >
          <GlobeAltIcon className="h-5 w-5" />
        </button>
      );
    }

    if (variant === 'compact') {
      return (
        <button
          type="button"
          className={clsx(
            "flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors",
            className
          )}
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
        >
          <span className="font-semibold">{currentLangInfo?.code.toUpperCase()}</span>
          <ChevronDownIcon className={clsx(
            "h-3 w-3 transition-transform",
            isOpen && "rotate-180"
          )} />
        </button>
      );
    }

    return (
      <button
        type="button"
        className={clsx(baseClasses, className)}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
      >
        <GlobeAltIcon className="h-4 w-4" />
        {showLabel && (
          <>
            <span>{currentLangInfo?.nativeName || currentLangInfo?.name}</span>
            <ChevronDownIcon className={clsx(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )} />
          </>
        )}
      </button>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {renderTrigger()}

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="py-1 max-h-64 overflow-y-auto">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
              {t('selectLanguage')}
            </div>
            
            {supportedLanguages.map((language) => (
              <button
                key={language.code}
                type="button"
                className={clsx(
                  "w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors",
                  currentLanguage === language.code && "bg-indigo-50 text-indigo-700"
                )}
                onClick={() => handleLanguageChange(language.code)}
                disabled={isLoading}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{language.nativeName}</span>
                  <span className="text-xs text-gray-500">{language.name}</span>
                </div>
                
                {currentLanguage === language.code && (
                  <CheckIcon className="h-4 w-4 text-indigo-600" />
                )}
              </button>
            ))}
          </div>
          
          <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-100">
            {supportedLanguages.length} languages supported
          </div>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-md">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;