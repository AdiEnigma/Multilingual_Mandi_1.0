import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SupportedLanguage } from '@shared/types';
import { logger } from '@/utils/logger';

interface UseLanguagePreferenceReturn {
  isLoading: boolean;
  error: string | null;
  syncLanguagePreference: () => Promise<void>;
  updateLanguagePreference: (language: SupportedLanguage) => Promise<void>;
}

/**
 * Hook for managing user language preferences
 * Handles synchronization between user profile, localStorage, and router locale
 */
export function useLanguagePreference(): UseLanguagePreferenceReturn {
  const router = useRouter();
  const { user, updateUserProfile } = useAuth();
  const { currentLanguage, setLanguage } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync language preference on user login/profile change
  useEffect(() => {
    if (user && user.preferredLanguage !== currentLanguage) {
      syncLanguagePreference();
    }
  }, [user?.preferredLanguage]);

  const syncLanguagePreference = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // If user's preferred language differs from current, update current language
      if (user.preferredLanguage !== currentLanguage) {
        await setLanguage(user.preferredLanguage);
        logger.info('Language synced with user preference:', user.preferredLanguage);
      }
    } catch (err) {
      const errorMessage = 'Failed to sync language preference';
      setError(errorMessage);
      logger.error(errorMessage, err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateLanguagePreference = async (language: SupportedLanguage) => {
    try {
      setIsLoading(true);
      setError(null);

      // Update language in context (this also updates localStorage and router)
      await setLanguage(language);

      // Update user profile if logged in
      if (user) {
        await updateUserProfile({
          preferredLanguage: language
        });
        logger.info('User language preference updated:', language);
      }

      logger.info('Language preference updated successfully:', language);
    } catch (err) {
      const errorMessage = 'Failed to update language preference';
      setError(errorMessage);
      logger.error(errorMessage, err);
      throw err; // Re-throw to allow caller to handle
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    syncLanguagePreference,
    updateLanguagePreference,
  };
}

export default useLanguagePreference;