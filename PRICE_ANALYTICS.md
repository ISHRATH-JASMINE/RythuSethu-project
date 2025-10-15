# Price Analytics Feature Documentation

## Overview
The Predictive Price Analytics feature uses AI-powered market analysis to help farmers make informed decisions about when to sell their crops. It provides price predictions, recommendations, and market insights based on multiple factors.

## Features

### 1. **Price Prediction**
- Predicts future crop prices based on:
  - Historical price trends
  - Weather conditions (drought, excess rain, heatwave, optimal)
  - Seasonal patterns (Kharif, Rabi, Summer)
  - Market demand and volatility
  - Regional market conditions

### 2. **Smart Recommendations**
The system generates actionable recommendations:
- **Sell Now**: Immediate selling recommended when prices are high
- **Hold**: Wait for better prices with specific day count (e.g., "Hold for 3 days — Expected price +12%")
- **Wait**: Market conditions are unfavorable, wait for improvement

### 3. **Visual Analytics**
- **Historical Price Chart**: 30-day price history visualization
- **Price Forecast Chart**: 7-day future price predictions
- **Confidence Score**: Shows prediction reliability (0-100%)

### 4. **Multi-Factor Analysis**
Displays impact of various factors:
- Weather Impact
- Demand Trend (high/medium/low)
- Seasonal Pattern
- Market Condition (bullish/bearish/stable)

## Supported Crops
Currently supports 8 major crops:
1. Rice - ₹2,500 base price
2. Wheat - ₹2,200 base price
3. Cotton - ₹5,500 base price
4. Sugarcane - ₹3,000 base price
5. Maize - ₹1,800 base price
6. Tomato - ₹25 base price
7. Onion - ₹30 base price
8. Potato - ₹20 base price

## Backend Architecture

### Models
1. **PriceHistory.js**
   - Stores historical price data with weather and demand info
   - Fields: crop, price, market, date, quantity, quality, weatherConditions, demand
   - Indexed for efficient queries

2. **PricePrediction.js**
   - Stores prediction results and recommendations
   - Fields: user, crop, currentPrice, predictedPrice, priceChange, confidence, recommendation, factors

### Service
**pricePrediction.js** - Core ML prediction logic
- `predictPrice()`: Main prediction algorithm
- `getHistoricalPrices()`: Generate 30-day price history
- `getPriceForecast()`: 7-day future forecast
- `getMarketSentiment()`: Analyze market conditions
- `generateRecommendation()`: Create actionable advice

### API Endpoints
All endpoints are JWT-protected under `/api/price-analytics/`:

1. **POST /predict** - Get price prediction
   ```json
   {
     "crop": "Rice",
     "currentPrice": 2500,
     "location": "Hyderabad, Telangana",
     "weatherCondition": "optimal",
     "season": "kharif"
   }
   ```

2. **GET /history/:crop** - Get historical prices
3. **POST /forecast** - Get 7-day forecast
4. **GET /sentiment/:crop** - Get market sentiment
5. **GET /my-predictions** - User's prediction history
6. **GET /crops** - List available crops
7. **POST /history/bulk** - Bulk upload (admin only)

## Frontend Components

### PriceAnalytics.jsx
Main page with:
- Prediction form (crop selection, price input, weather, season)
- Prediction results card (current vs predicted price, confidence)
- Recommendation card with color-coded actions
- Historical price chart (30 days)
- Price forecast chart (7 days)
- Factors analysis panel

### Multilingual Support
Translations available in:
- English
- Telugu (తెలుగు)
- Hindi (हिंदी)

## How It Works

1. **User Input**: Farmer enters crop name, current price, location, weather, and season
2. **Data Analysis**: System analyzes:
   - 30-day historical price data
   - Weather impact factors
   - Seasonal multipliers
   - Demand trends
   - Market volatility
3. **Prediction**: ML algorithm calculates predicted price
4. **Recommendation**: Generates action plan with specific days to wait
5. **Visualization**: Displays charts and insights

## Example Recommendation
```
"Hold for 5 days — Expected price increase of +12.3%"
```

## Weather Impact
- **Drought**: +25% price impact
- **Excess Rain**: -15% price impact
- **Optimal**: +5% price impact
- **Heatwave**: +10% price impact

## Seasonal Multipliers
- **Kharif (Monsoon)**: 1.1x (High demand)
- **Rabi (Winter)**: 1.05x (Medium demand)
- **Summer**: 0.95x (Low demand)

## Confidence Score Calculation
Based on:
- Data availability (40%)
- Pattern consistency (30%)
- Weather reliability (15%)
- Market stability (15%)

## Future Enhancements (Production-Ready)
1. Replace dummy data with real ML model (TensorFlow/PyTorch)
2. Integrate with actual market data APIs
3. Add real-time weather API integration
4. Implement user feedback loop for model improvement
5. Add crop variety-specific predictions
6. Include transport cost analysis
7. Add mandi-specific price recommendations
8. Implement price alerts and notifications

## Usage Example

### Step 1: Navigate to Price Analytics
Click "Price Analytics" in the navigation menu (requires login)

### Step 2: Enter Crop Details
- Select crop: Rice
- Current price: 2500
- Location: Hyderabad, Telangana
- Weather: Optimal
- Season: Kharif

### Step 3: View Results
- Predicted Price: ₹2,780.50 (+11.22%)
- Confidence: 87%
- Recommendation: "Hold for 3 days — Expected price increase of +11.2%"
- View historical data and forecast charts

## Technical Stack
- **Backend**: Node.js, Express, MongoDB
- **Frontend**: React, Recharts, Tailwind CSS
- **ML Service**: Custom prediction algorithm (placeholder for production ML)
- **Authentication**: JWT-based auth

## Testing
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Login as farmer
4. Navigate to Price Analytics
5. Submit prediction request
6. Verify results display correctly

---

**Note**: Current implementation uses simulated ML predictions for demonstration. For production, integrate real ML models trained on historical market data.
