const fs = require('fs');
const path = require('path');

// Language mappings with native names
const languages = {
  'as': { name: 'Assamese', nativeName: 'অসমীয়া' },
  'bn': { name: 'Bengali', nativeName: 'বাংলা' },
  'brx': { name: 'Bodo', nativeName: 'बर\'' },
  'doi': { name: 'Dogri', nativeName: 'डोगरी' },
  'gu': { name: 'Gujarati', nativeName: 'ગુજરાતી' },
  'hi': { name: 'Hindi', nativeName: 'हिन्दी' },
  'kn': { name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  'ks': { name: 'Kashmiri', nativeName: 'کٲشُر' },
  'gom': { name: 'Konkani', nativeName: 'कोंकणी' },
  'mai': { name: 'Maithili', nativeName: 'मैथिली' },
  'ml': { name: 'Malayalam', nativeName: 'മലയാളം' },
  'mni': { name: 'Manipuri', nativeName: 'মৈতৈলোন্' },
  'mr': { name: 'Marathi', nativeName: 'मराठी' },
  'ne': { name: 'Nepali', nativeName: 'नेपाली' },
  'or': { name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  'pa': { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  'sa': { name: 'Sanskrit', nativeName: 'संस्कृतम्' },
  'sat': { name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  'sd': { name: 'Sindhi', nativeName: 'سنڌي' },
  'ta': { name: 'Tamil', nativeName: 'தமிழ்' },
  'te': { name: 'Telugu', nativeName: 'తెలుగు' },
  'ur': { name: 'Urdu', nativeName: 'اردو' }
};

// Base translation template (English)
const baseTranslations = {
  common: {
    "appName": "Marketplace Mandi",
    "welcome": "Welcome",
    "loading": "Loading...",
    "error": "Error",
    "success": "Success",
    "cancel": "Cancel",
    "save": "Save",
    "edit": "Edit",
    "delete": "Delete",
    "confirm": "Confirm",
    "yes": "Yes",
    "no": "No",
    "search": "Search",
    "filter": "Filter",
    "sort": "Sort",
    "next": "Next",
    "previous": "Previous",
    "close": "Close",
    "open": "Open",
    "select": "Select",
    "selectLanguage": "Select Language",
    "language": "Language",
    "location": "Location",
    "price": "Price",
    "quantity": "Quantity",
    "category": "Category",
    "description": "Description",
    "name": "Name",
    "phoneNumber": "Phone Number",
    "email": "Email",
    "address": "Address",
    "state": "State",
    "district": "District",
    "pincode": "PIN Code",
    "submit": "Submit",
    "reset": "Reset",
    "back": "Back",
    "continue": "Continue",
    "finish": "Finish",
    "home": "Home",
    "profile": "Profile",
    "settings": "Settings",
    "logout": "Logout",
    "login": "Login",
    "register": "Register",
    "dashboard": "Dashboard",
    "notifications": "Notifications",
    "messages": "Messages",
    "help": "Help",
    "about": "About",
    "contact": "Contact",
    "terms": "Terms",
    "privacy": "Privacy",
    "currency": "₹",
    "perKg": "per kg",
    "perPiece": "per piece",
    "perQuintal": "per quintal",
    "kg": "kg",
    "gram": "gram",
    "quintal": "quintal",
    "ton": "ton",
    "piece": "piece",
    "dozen": "dozen",
    "liter": "liter",
    "meter": "meter"
  },
  auth: {
    "login": "Login",
    "register": "Register",
    "logout": "Logout",
    "phoneNumber": "Phone Number",
    "enterPhoneNumber": "Enter your phone number",
    "sendOTP": "Send OTP",
    "enterOTP": "Enter OTP",
    "verifyOTP": "Verify OTP",
    "resendOTP": "Resend OTP",
    "otpSent": "OTP Sent",
    "otpVerified": "OTP Verified",
    "invalidOTP": "Invalid OTP",
    "otpExpired": "OTP Expired",
    "loginSuccess": "Login Successful",
    "loginFailed": "Login Failed",
    "registrationSuccess": "Registration Successful",
    "registrationFailed": "Registration Failed",
    "name": "Name",
    "enterName": "Enter your name",
    "selectUserType": "Select User Type",
    "buyer": "Buyer",
    "seller": "Seller",
    "both": "Both",
    "selectLanguage": "Select Language",
    "selectLocation": "Select Location",
    "state": "State",
    "district": "District",
    "pincode": "PIN Code",
    "createAccount": "Create Account",
    "alreadyHaveAccount": "Already have an account?",
    "dontHaveAccount": "Don't have an account?",
    "welcomeBack": "Welcome Back",
    "welcomeToMarketplace": "Welcome to Marketplace Mandi",
    "getStarted": "Get Started",
    "continueWithPhone": "Continue with Phone",
    "or": "or",
    "sessionExpired": "Session Expired",
    "pleaseLoginAgain": "Please login again",
    "accountCreated": "Account Created",
    "profileUpdated": "Profile Updated",
    "phoneNumberRequired": "Phone number is required",
    "nameRequired": "Name is required",
    "locationRequired": "Location is required",
    "languageRequired": "Language is required",
    "userTypeRequired": "User type is required",
    "invalidPhoneNumber": "Invalid phone number",
    "phoneNumberTooShort": "Phone number is too short",
    "phoneNumberTooLong": "Phone number is too long"
  },
  listings: {
    "listings": "Listings",
    "myListings": "My Listings",
    "createListing": "Create Listing",
    "editListing": "Edit Listing",
    "deleteListing": "Delete Listing",
    "viewListing": "View Listing",
    "listingDetails": "Listing Details",
    "productName": "Product Name",
    "productCategory": "Product Category",
    "productDescription": "Product Description",
    "quantity": "Quantity",
    "unit": "Unit",
    "askingPrice": "Asking Price",
    "pricePerUnit": "Price per Unit",
    "location": "Location",
    "images": "Images",
    "uploadImages": "Upload Images",
    "addImages": "Add Images",
    "removeImage": "Remove Image",
    "listingStatus": "Listing Status",
    "active": "Active",
    "sold": "Sold",
    "expired": "Expired",
    "draft": "Draft",
    "publishListing": "Publish Listing",
    "saveDraft": "Save Draft",
    "listingCreated": "Listing Created",
    "listingUpdated": "Listing Updated",
    "listingDeleted": "Listing Deleted",
    "listingPublished": "Listing Published",
    "noListings": "No Listings",
    "noListingsFound": "No Listings Found",
    "searchListings": "Search Listings",
    "filterListings": "Filter Listings",
    "sortListings": "Sort Listings",
    "sortByPrice": "Sort by Price",
    "sortByDate": "Sort by Date",
    "sortByDistance": "Sort by Distance",
    "sortByRating": "Sort by Rating",
    "priceRange": "Price Range",
    "minPrice": "Min Price",
    "maxPrice": "Max Price",
    "nearMe": "Near Me",
    "withinKm": "Within km",
    "categories": "Categories",
    "allCategories": "All Categories",
    "vegetables": "Vegetables",
    "fruits": "Fruits",
    "grains": "Grains",
    "pulses": "Pulses",
    "spices": "Spices",
    "dairy": "Dairy",
    "meat": "Meat",
    "fish": "Fish",
    "others": "Others",
    "contactSeller": "Contact Seller",
    "sendMessage": "Send Message",
    "makeOffer": "Make Offer",
    "buyNow": "Buy Now",
    "addToWishlist": "Add to Wishlist",
    "removeFromWishlist": "Remove from Wishlist",
    "share": "Share",
    "report": "Report",
    "sellerInfo": "Seller Info",
    "sellerRating": "Seller Rating",
    "sellerReviews": "Seller Reviews",
    "verified": "Verified",
    "unverified": "Unverified",
    "priceInsights": "Price Insights",
    "marketPrice": "Market Price",
    "suggestedPrice": "Suggested Price",
    "priceHistory": "Price History",
    "priceTrend": "Price Trend",
    "rising": "Rising",
    "falling": "Falling",
    "stable": "Stable",
    "dataFreshness": "Data Freshness",
    "fresh": "Fresh",
    "stale": "Stale",
    "outdated": "Outdated",
    "confidence": "Confidence",
    "high": "High",
    "medium": "Medium",
    "low": "Low",
    "lastUpdated": "Last Updated",
    "dataSource": "Data Source",
    "government": "Government",
    "marketplace": "Marketplace",
    "userListings": "User Listings",
    "historical": "Historical"
  }
};

// Create directories and files for all languages
function generateTranslationFiles() {
  const localesDir = path.join(__dirname, '..', 'public', 'locales');
  
  // Ensure locales directory exists
  if (!fs.existsSync(localesDir)) {
    fs.mkdirSync(localesDir, { recursive: true });
  }

  Object.keys(languages).forEach(langCode => {
    const langDir = path.join(localesDir, langCode);
    
    // Create language directory
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
    }

    // Create translation files for each namespace
    Object.keys(baseTranslations).forEach(namespace => {
      const filePath = path.join(langDir, `${namespace}.json`);
      
      // Only create if file doesn't exist (to preserve existing translations)
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(
          filePath,
          JSON.stringify(baseTranslations[namespace], null, 2),
          'utf8'
        );
        console.log(`Created: ${langCode}/${namespace}.json`);
      } else {
        console.log(`Skipped: ${langCode}/${namespace}.json (already exists)`);
      }
    });
  });

  console.log('\nTranslation file generation complete!');
  console.log(`Generated files for ${Object.keys(languages).length} languages`);
  console.log('Note: Files marked as "already exists" were skipped to preserve existing translations.');
}

// Run the generation
generateTranslationFiles();