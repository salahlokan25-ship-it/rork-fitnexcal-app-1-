# NutritionX and OpenFoodFacts API Integration

This app integrates with NutritionX and OpenFoodFacts APIs to provide comprehensive food nutrition data.

## API Setup Instructions

### 1. NutritionX API (Premium Features)

NutritionX provides detailed nutrition data for foods and branded products.

**Setup Steps:**
1. Visit [NutritionX Developer Portal](https://developer.nutritionix.com/)
2. Create an account and get your API credentials
3. Create a `.env.local` file in your project root:
   ```
   EXPO_PUBLIC_NUTRITIONX_APP_ID=your_app_id_here
   EXPO_PUBLIC_NUTRITIONX_API_KEY=your_api_key_here
   ```
4. Set `DEMO_MODE = false` in `constants/api-config.ts`

**Features:**
- Comprehensive food database search
- Detailed nutrition information
- Branded product data
- Natural language food queries

### 2. OpenFoodFacts API (Free)

OpenFoodFacts is a free, open database of food products worldwide.

**Setup Steps:**
- No API key required! OpenFoodFacts is completely free
- Works out of the box for:
  - Barcode scanning
  - Product information lookup
  - Category-based food search

**Features:**
- Barcode scanning for packaged foods
- International food product database
- Category-based food discovery
- Completely free to use

### 3. Google Cloud Vision API (Optional - for enhanced barcode scanning)

For advanced barcode scanning capabilities.

**Setup Steps:**
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Vision API
3. Create an API key
4. Add to your `.env.local`:
   ```
   EXPO_PUBLIC_GOOGLE_VISION_API_KEY=your_api_key_here
   ```

## Current Implementation

The app currently works in **DEMO MODE** with mock data. To enable real API integration:

1. Get your API credentials (see setup instructions above)
2. Add them to your environment variables
3. Set `DEMO_MODE = false` in `constants/api-config.ts`

## API Fallback Strategy

The app uses a smart fallback strategy:

1. **NutritionX API** (if configured) - Most comprehensive data
2. **OpenFoodFacts API** (always available) - Free alternative
3. **Mock Data** - Fallback for demo/offline mode

This ensures the app always works, even without API keys configured.

## Food Search Features

### Research Page
- **Text Search**: Search foods using NutritionX and OpenFoodFacts
- **Advanced Filters**: Filter by calories, protein, category
- **Country-based Discovery**: Explore foods by country
- **Category Search**: Browse foods by category (dairy, meat, etc.)

### Home Page
- **Quick Search**: Fast food lookup with autocomplete
- **Personalized Suggestions**: AI-powered food recommendations
- **Barcode Integration**: Scan packaged foods

## API Rate Limits

- **NutritionX**: Check your plan limits
- **OpenFoodFacts**: No rate limits (be respectful)
- **Google Vision**: Check your quota

## Troubleshooting

### Common Issues:

1. **"Using demo mode" in console**
   - Check your API credentials in `.env.local`
   - Ensure `DEMO_MODE = false` in config

2. **No search results**
   - Verify API keys are correct
   - Check network connectivity
   - Try different search terms

3. **Barcode scanning not working**
   - Ensure camera permissions are granted
   - Try scanning different barcodes
   - Check OpenFoodFacts has the product

### Debug Mode:
Enable detailed logging by checking the console for API responses and errors.

## Cost Considerations

- **OpenFoodFacts**: Completely free
- **NutritionX**: Paid service with different tiers
- **Google Vision**: Pay-per-use model

For development and testing, OpenFoodFacts provides excellent free functionality.