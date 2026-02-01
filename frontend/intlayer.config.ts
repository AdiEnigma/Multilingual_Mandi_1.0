import { Locales, type IntlayerConfig } from 'intlayer';

const config: IntlayerConfig = {
  internationalization: {
    locales: [
      Locales.ENGLISH,
      Locales.HINDI,
      Locales.BENGALI,
      Locales.TAMIL,
      Locales.TELUGU,
      Locales.GUJARATI,
      Locales.MARATHI,
      Locales.KANNADA,
      Locales.MALAYALAM,
      Locales.PUNJABI,
      Locales.URDU,
    ] as const,
    defaultLocale: Locales.HINDI,
  },
};

export default config;