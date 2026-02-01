const fs = require('fs');
const path = require('path');

// Base translation keys that need to be added to all languages
const additionalKeys = {
  "welcomeToMandi": "Welcome to Mandi",
  "indianAgriculture": "Indian Agriculture", 
  "mandiPlatform": "Mandi Platform",
  "platformDescription": "AI-powered multilingual marketplace connecting farmers and traders. Trade in 22 Indian languages.",
  "searchProducts": "Search products...",
  "searchButton": "Search",
  "viewProducts": "View Products",
  "sellProducts": "Sell",
  "digitalMandi": "Digital Mandi",
  "directConnection": "Direct connection from farmer to consumer",
  "popularCategories": "Popular Categories",
  "categoriesDescription": "Choose your favorite category and start shopping instantly",
  "grains": "Grains",
  "vegetables": "Vegetables", 
  "fruits": "Fruits",
  "dairy": "Dairy",
  "spices": "Spices",
  "pulses": "Pulses",
  "farmers": "Farmers",
  "products": "Products",
  "languages": "Languages",
  "states": "States",
  "startToday": "Start Today",
  "joinThousands": "Join thousands of farmers and traders. Trade in your language.",
  "startSelling": "Start Selling",
  "startBuying": "Start Buying"
};

// Languages that already have complete translations (skip these)
const completeLanguages = ['en', 'hi', 'bn', 'ta', 'gu', 'mr', 'te', 'pa', 'kn'];

// All supported languages
const allLanguages = [
  'as', 'brx', 'doi', 'ks', 'gom', 'mai', 'ml', 'mni', 'ne', 'or', 'sa', 'sat', 'sd', 'ur'
];

const localesDir = path.join(__dirname, '..', 'public', 'locales');

// Update incomplete translation files
allLanguages.forEach(lang => {
  if (completeLanguages.includes(lang)) {
    console.log(`Skipping ${lang} - already complete`);
    return;
  }

  const filePath = path.join(localesDir, lang, 'common.json');
  
  try {
    // Read existing translations
    const existingContent = fs.readFileSync(filePath, 'utf8');
    const existingTranslations = JSON.parse(existingContent);
    
    // Add missing keys with English fallback
    const updatedTranslations = {
      ...existingTranslations,
      ...additionalKeys
    };
    
    // Write updated translations
    fs.writeFileSync(filePath, JSON.stringify(updatedTranslations, null, 2));
    console.log(`Updated ${lang}/common.json with missing keys`);
    
  } catch (error) {
    console.error(`Error updating ${lang}:`, error.message);
  }
});

console.log('Translation update complete!');