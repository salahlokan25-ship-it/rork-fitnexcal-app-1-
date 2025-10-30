// API Configuration
// Use environment variables in development and production.
// For local preview, fallback to demo (no external calls) when not provided.

const NUTRITIONIX_APP_ID = process.env.EXPO_PUBLIC_NUTRITIONIX_APP_ID || 'demo_app_id';
const NUTRITIONIX_API_KEY = process.env.EXPO_PUBLIC_NUTRITIONIX_API_KEY || 'demo_api_key';

export const API_CONFIG = {
  // NutritionX API Configuration
  // Get your API credentials from: https://developer.nutritionix.com/
  NUTRITIONX: {
    APP_ID: NUTRITIONIX_APP_ID,
    API_KEY: NUTRITIONIX_API_KEY,
    BASE_URL: 'https://trackapi.nutritionix.com/v2',
  },
  
  // OpenFoodFacts API Configuration
  // OpenFoodFacts is free and doesn't require API keys
  OPENFOODFACTS: {
    BASE_URL: 'https://world.openfoodfacts.org/api/v0',
  },
  
  // Google Cloud Vision API (for barcode scanning)
  // Get your API key from: https://cloud.google.com/vision/docs/setup
  GOOGLE_VISION: {
    API_KEY: process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY || 'demo_api_key',
    BASE_URL: 'https://vision.googleapis.com/v1',
  },
};

// Demo mode is enabled automatically when Nutritionix keys are not set.
export const DEMO_MODE = NUTRITIONIX_APP_ID === 'demo_app_id' || NUTRITIONIX_API_KEY === 'demo_api_key';