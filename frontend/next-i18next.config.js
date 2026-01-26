module.exports = {
  i18n: {
    defaultLocale: 'hi',
    locales: [
      'en', // English
      'as', // Assamese
      'bn', // Bengali
      'brx', // Bodo
      'doi', // Dogri
      'gu', // Gujarati
      'hi', // Hindi
      'kn', // Kannada
      'ks', // Kashmiri
      'gom', // Konkani
      'mai', // Maithili
      'ml', // Malayalam
      'mni', // Manipuri
      'mr', // Marathi
      'ne', // Nepali
      'or', // Odia
      'pa', // Punjabi
      'sa', // Sanskrit
      'sat', // Santali
      'sd', // Sindhi
      'ta', // Tamil
      'te', // Telugu
      'ur', // Urdu
    ],
    localeDetection: false,
  },
  fallbackLng: 'hi',
  debug: process.env.NODE_ENV === 'development',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  
  // Namespace configuration
  ns: ['common', 'auth', 'listings', 'chat', 'search', 'profile'],
  defaultNS: 'common',
  
  // Interpolation
  interpolation: {
    escapeValue: false,
  },
  
  // React configuration
  react: {
    useSuspense: false,
  },
};