import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useState } from 'react';
import { CheckIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

import Layout from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export default function LanguageSettingsPage() {
  const { t } = useTranslation('common');
  const { currentLanguage, setLanguage, getSupportedLanguages } = useLanguage();
  const { user, updateUserProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const supportedLanguages = getSupportedLanguages();

  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode === currentLanguage || isUpdating) {
      return;
    }

    setIsUpdating(true);
    try {
      // Update language in context
      await setLanguage(languageCode as any);

      // Update user profile if logged in
      if (user) {
        await updateUserProfile({
          preferredLanguage: languageCode as any
        });
      }

      toast.success(t('success'));
    } catch (error) {
      console.error('Failed to change language:', error);
      toast.error(t('error'));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Head>
        <title>{t('language')} {t('settings')} - {t('appName')}</title>
        <meta name="description" content="Change your language preferences" />
      </Head>
      
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <GlobeAltIcon className="h-8 w-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                {t('language')} {t('settings')}
              </h1>
            </div>
            <p className="text-gray-600">
              Choose your preferred language for the interface. This will change all text and content to your selected language.
            </p>
          </div>

          {/* Current Language */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Current Language
            </h2>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <GlobeAltIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {supportedLanguages.find(lang => lang.code === currentLanguage)?.nativeName}
                </p>
                <p className="text-sm text-gray-500">
                  {supportedLanguages.find(lang => lang.code === currentLanguage)?.name}
                </p>
              </div>
            </div>
          </div>

          {/* Language Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Available Languages
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Select from {supportedLanguages.length} supported Indian languages
              </p>
            </div>

            <div className="divide-y divide-gray-200">
              {supportedLanguages.map((language) => (
                <button
                  key={language.code}
                  type="button"
                  className={clsx(
                    'w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors',
                    currentLanguage === language.code && 'bg-indigo-50',
                    isUpdating && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => handleLanguageChange(language.code)}
                  disabled={isUpdating}
                >
                  <div className="flex items-center space-x-4">
                    <div className={clsx(
                      'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold',
                      currentLanguage === language.code
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    )}>
                      {language.code.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {language.nativeName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {language.name}
                      </p>
                    </div>
                  </div>

                  {currentLanguage === language.code && (
                    <CheckIcon className="h-5 w-5 text-indigo-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              About Multilingual Support
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>
                • All 22 official Indian languages are supported
              </p>
              <p>
                • Your language preference is saved to your profile
              </p>
              <p>
                • Real-time translation is available in chat conversations
              </p>
              <p>
                • Product listings can be viewed in your preferred language
              </p>
            </div>
          </div>

          {/* RTL Support Notice */}
          {['ur', 'ks', 'sd'].includes(currentLanguage) && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Right-to-left (RTL) text direction is enabled for this language.
              </p>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'hi', [
        'common',
        'auth',
      ])),
    },
  };
};