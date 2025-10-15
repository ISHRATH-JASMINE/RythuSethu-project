# Testing the Price Analytics Feature

## Quick Start

### 1. Start the Backend Server
```powershell
cd backend
npm start
```
Backend will run on: http://localhost:5000

### 2. Start the Frontend Development Server
```powershell
cd frontend
npm run dev
```
Frontend will run on: http://localhost:5173

### 3. Login to the Application
- Open browser: http://localhost:5173
- Login with your farmer account
- If you don't have an account, register as a "Farmer"

### 4. Navigate to Price Analytics
- Click "Price Analytics" in the navigation menu
- You should see the prediction form

### 5. Test Price Prediction

#### Example Test Case 1: Rice (Kharif Season)
- **Crop**: Rice
- **Current Price**: 2500
- **Location**: Hyderabad, Telangana
- **Weather Condition**: Optimal
- **Season**: Kharif (Monsoon)
- **Expected Result**: Upward trend, hold recommendation

#### Example Test Case 2: Tomato (Summer)
- **Crop**: Tomato
- **Current Price**: 25
- **Location**: Pune, Maharashtra
- **Weather Condition**: Heatwave
- **Season**: Summer
- **Expected Result**: High volatility, possible sell recommendation

#### Example Test Case 3: Wheat (Rabi Season)
- **Crop**: Wheat
- **Current Price**: 2200
- **Location**: Ludhiana, Punjab
- **Weather Condition**: Optimal
- **Season**: Rabi (Winter)
- **Expected Result**: Stable trend, medium confidence

### 6. Verify Results
After clicking "Get Prediction", you should see:

✅ **Prediction Result Card**
- Current Price
- Predicted Price
- Price Change (%)
- Confidence Score with progress bar
- Color-coded recommendation (Red=Sell, Yellow=Hold, Green=Wait)

✅ **Factors Analysis Card**
- Weather Impact
- Demand Trend
- Seasonal Pattern
- Market Condition

✅ **Historical Prices Chart**
- 30-day price history line chart
- Date on X-axis
- Price on Y-axis

✅ **Price Forecast Chart**
- 7-day future price predictions
- Orange line showing trend

### 7. Test Different Scenarios

#### High Price Scenario (Sell Recommendation)
- Select any crop
- Enter current price 20% above base price
- Weather: Drought
- Should recommend "Sell Now"

#### Low Price Scenario (Wait Recommendation)
- Select any crop
- Enter current price 10% below base price
- Weather: Excess Rain
- Should recommend "Wait"

#### Medium Price Scenario (Hold Recommendation)
- Select any crop
- Enter current price near base price
- Weather: Optimal
- Should recommend "Hold for X days"

## API Testing (Optional)

### Using Thunder Client or Postman

#### 1. Login to get JWT token
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "your-email@example.com",
  "password": "your-password"
}
```
Copy the `token` from response.

#### 2. Test Price Prediction
```
POST http://localhost:5000/api/price-analytics/predict
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "crop": "Rice",
  "currentPrice": 2500,
  "location": "Hyderabad, Telangana",
  "weatherCondition": "optimal",
  "season": "kharif"
}
```

#### 3. Get Historical Prices
```
GET http://localhost:5000/api/price-analytics/history/Rice
Authorization: Bearer YOUR_JWT_TOKEN
```

#### 4. Get Price Forecast
```
POST http://localhost:5000/api/price-analytics/forecast
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "crop": "Rice",
  "currentPrice": 2500
}
```

#### 5. Get Available Crops
```
GET http://localhost:5000/api/price-analytics/crops
Authorization: Bearer YOUR_JWT_TOKEN
```

## Troubleshooting

### Issue: "Failed to generate prediction"
**Solution**: 
- Check backend is running on port 5000
- Verify you're logged in (JWT token valid)
- Check browser console for errors

### Issue: Charts not displaying
**Solution**:
- Ensure recharts is installed: `npm install recharts`
- Check browser console for errors
- Try refreshing the page

### Issue: "Unauthorized" error
**Solution**:
- Login again to refresh JWT token
- Check token is being sent in request headers

### Issue: Translations not showing
**Solution**:
- Check translations.js has all keys
- Verify LanguageContext is working
- Try switching language in navbar

## Expected Behavior

### Confidence Scores
- **High Confidence (80-100%)**: Consistent historical data, stable weather
- **Medium Confidence (60-79%)**: Some volatility, moderate data
- **Low Confidence (40-59%)**: High volatility, limited data

### Price Change Ranges
- **Rice/Wheat**: ±5-15%
- **Cotton/Sugarcane**: ±8-20%
- **Vegetables (Tomato/Onion/Potato)**: ±15-40% (high volatility)

### Recommendation Messages
- **Sell Now**: "Current prices are favorable — Sell immediately"
- **Hold**: "Hold for X days — Expected price increase of +Y%"
- **Wait**: "Market conditions unfavorable — Wait for improvement"

## Next Steps After Testing

1. ✅ Verify all crops work correctly
2. ✅ Test with different weather conditions
3. ✅ Test with different seasons
4. ✅ Verify charts render properly
5. ✅ Test multilingual support (English/Telugu/Hindi)
6. ✅ Check responsive design on mobile
7. ✅ Verify recommendation logic is sound

## Production Considerations

When moving to production:
1. Replace dummy ML model with real trained model
2. Integrate with actual market data APIs
3. Add real-time weather API integration
4. Implement data caching for performance
5. Add prediction history tracking
6. Implement price alerts via FCM notifications
7. Add admin panel for bulk data upload

---

**Happy Testing!** 🌾📈
