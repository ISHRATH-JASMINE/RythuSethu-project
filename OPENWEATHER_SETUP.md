# 🌦️ OpenWeatherMap API Setup Guide

## Overview
The Crop Advisor feature now includes **dynamic 7-day weather forecasts** based on the farmer's location using the OpenWeatherMap API.

---

## 🎯 Features Implemented

### 1. **Soil pH Level Field**
- Replaced "Soil Type" dropdown with numeric pH input (range: 4.0 - 9.0)
- Provides helpful hints: Acidic (4-6), Neutral (6.5-7.5), Alkaline (7.5-9)
- More precise for crop recommendation algorithms

### 2. **Dynamic Weather Fetching**
- Weather data loads **automatically** when user types location (1-second debounce)
- Shows loading indicator while fetching
- Updates in real-time without form submission

### 3. **7-Day Weather Forecast Display**
- **Current Weather Cards**: Temperature, Humidity, Rainfall, Wind Speed
- **Interactive Chart**: Temperature and Rainfall trends over 7 days
- **Smart Alerts**: Heatwave warnings, Heavy rainfall alerts
- **Farming Tips**: Context-aware recommendations based on weather

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Free API Key

1. Go to **[OpenWeatherMap](https://openweathermap.org/api)**
2. Click **"Sign Up"** (top right)
3. Fill in your details:
   - Email
   - Username
   - Password
4. Verify your email
5. Go to **[API Keys](https://home.openweathermap.org/api_keys)**
6. Copy your **API Key** (looks like: `abc123def456...`)

**Free Tier Limits:**
- ✅ 1,000 API calls per day
- ✅ 60 calls per minute
- ✅ Current weather + 7-day forecast
- ✅ Perfect for testing and small-scale deployments

---

### Step 2: Add API Key to Backend

1. Open `backend/.env` file
2. Add this line:
   ```env
   OPENWEATHER_API_KEY=your_actual_api_key_here
   ```

3. Replace `your_actual_api_key_here` with your copied key

**Example:**
```env
OPENWEATHER_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

### Step 3: Install axios (if not already installed)

Run in `backend` folder:
```bash
npm install axios
```

---

### Step 4: Restart Backend Server

```bash
cd backend
node server.js
```

You should see:
```
✅ Server running on port 5000
✅ MongoDB Connected
```

---

## 🧪 Testing the Feature

### 1. **Open Frontend**
Navigate to: `http://localhost:5173/crop-advisor`

### 2. **Type a Location**
- Enter: **"Hyderabad"** or **"Mumbai"** or **"Delhi"**
- Wait 1 second → See "🌦️ Fetching weather data..." message
- Weather section appears below the form automatically!

### 3. **View Weather Data**
You should see:
- ✅ Current temperature, humidity, rainfall, wind speed
- ✅ Beautiful gradient cards with real-time data
- ✅ Interactive 7-day forecast chart
- ✅ Weather-based farming tips

### 4. **Test Different Locations**
Try these Indian cities:
- Hyderabad
- Mumbai
- Delhi
- Bangalore
- Chennai
- Kolkata
- Pune
- Jaipur

---

## 📊 API Response Structure

### Current Weather:
```json
{
  "location": "Hyderabad",
  "current": {
    "temperature": 28,
    "condition": "partly cloudy",
    "humidity": 65,
    "rainfall": 0,
    "windSpeed": 12
  }
}
```

### 7-Day Forecast:
```json
{
  "forecast": [
    { "day": "Mon", "temperature": 29, "rainfall": 0, "condition": "Sunny" },
    { "day": "Tue", "temperature": 28, "rainfall": 5, "condition": "Cloudy" },
    { "day": "Wed", "temperature": 27, "rainfall": 20, "condition": "Rainy" }
    // ... 4 more days
  ]
}
```

---

## 🛡️ Fallback Behavior

**If API key is missing or invalid:**
- System automatically uses **dummy weather data**
- Console shows: `⚠️ No OpenWeatherMap API key found. Using dummy weather data.`
- Feature still works for testing UI

**If API call fails:**
- Graceful fallback to dummy data
- No errors shown to user
- Logs error to console for debugging

---

## 🌍 India-Specific Features

### Location Detection:
- API automatically appends `,IN` to location queries
- Example: `"Hyderabad"` → `"Hyderabad,IN"` (India)
- Ensures accurate Indian city results

### Unit Conversions:
- Temperature: **Celsius** (°C) - suitable for Indian farmers
- Wind Speed: **km/h** (converted from m/s)
- Rainfall: **mm** (millimeters)

### Indian Cities Coverage:
✅ All major cities (Tier 1)
✅ Most Tier 2 cities (Pune, Jaipur, Lucknow, etc.)
✅ Many Tier 3 cities
⚠️ Remote villages may not have data (fallback to nearest city)

---

## 💰 Cost Optimization Tips

### Free Tier (1,000 calls/day)
- **User Enters Location → 1 API call**
- **User Clicks "Get Recommendations" → 0 calls** (cached data used)

**Daily Capacity:**
- 1,000 unique location searches per day
- ~40 farmers per hour (24/7)
- Perfect for MVP and testing!

### Reduce API Calls:
1. **Caching** (future): Store weather data for 1 hour per location
2. **Debouncing** (already implemented): 1-second delay before API call
3. **Default Cities**: Pre-fetch weather for top 10 Indian cities

---

## 🔧 Advanced Configuration

### Change Country (if needed):
In `backend/services/cropRecommendation.js`, line ~310:
```javascript
// Change ,IN to ,US or ,UK etc.
const currentWeatherUrl = `...?q=${location},IN&appid=...`;
```

### Adjust Forecast Days:
Change `cnt=56` (7 days × 8 intervals) to:
- `cnt=40` for 5 days
- `cnt=24` for 3 days

### Add More Metrics:
OpenWeatherMap provides:
- UV Index
- Air Quality
- Soil Temperature (premium)
- Crop-specific indices (premium)

---

## 🐛 Troubleshooting

### Error: "Invalid API key"
- **Solution**: Check `.env` file, ensure no extra spaces
- Verify key at: https://home.openweathermap.org/api_keys

### Error: "City not found"
- **Solution**: Try different spelling (e.g., "Bengaluru" vs "Bangalore")
- Check for typos
- Some small villages may not exist in database

### Weather not loading
1. Check browser console for errors (F12 → Console tab)
2. Verify backend is running (`node server.js`)
3. Check `.env` file has API key
4. Ensure `axios` is installed (`npm list axios`)

### Dummy data still showing
- Restart backend after adding API key
- Clear browser cache (Ctrl + Shift + R)
- Check console for: `⚠️ No OpenWeatherMap API key found`

---

## 📈 Upgrade to Paid Plans (Optional)

### When to Upgrade:
- More than 1,000 users per day
- Need hourly forecasts
- Require historical weather data
- Want 16-day forecasts

### Pricing:
- **Startup**: $40/month (100,000 calls/day)
- **Developer**: $180/month (1,000,000 calls/day)
- **Professional**: Custom pricing

---

## 🎓 For Developers

### Code Location:
- **Frontend**: `frontend/src/pages/CropAdvisor.jsx` (lines 30-56)
- **Backend**: `backend/services/cropRecommendation.js` (lines 305-380)
- **Route**: `backend/routes/crop.js` (line 31)

### Key Functions:
```javascript
// Frontend - Auto-fetch weather on location change
useEffect(() => {
  const timer = setTimeout(() => {
    if (formData.location) {
      fetchWeather(formData.location);
    }
  }, 1000);
  return () => clearTimeout(timer);
}, [formData.location]);

// Backend - OpenWeatherMap integration
async getWeatherInfo(location) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location},IN&appid=${apiKey}&units=metric`;
  const response = await axios.get(url);
  // ... process data
}
```

---

## ✅ Checklist

Before going live, ensure:
- [ ] API key added to `.env`
- [ ] Backend restarted with new key
- [ ] Tested with at least 3 Indian cities
- [ ] Weather chart rendering correctly
- [ ] Alerts showing for extreme conditions
- [ ] Mobile responsive (check on phone)
- [ ] Error handling working (test with invalid location)
- [ ] Fallback to dummy data confirmed

---

## 🎉 Success!

Your Crop Advisor now has:
✅ **Soil pH Level** input (more precise)
✅ **Real-time weather** from OpenWeatherMap
✅ **Auto-loading** when location is typed
✅ **7-day forecast** with beautiful charts
✅ **Smart farming tips** based on weather
✅ **India-optimized** (Celsius, km/h, Indian cities)

**Next Steps:**
1. Get farmers to test the feature
2. Collect feedback on pH input vs soil type
3. Monitor API usage in OpenWeatherMap dashboard
4. Consider adding more weather metrics (UV, humidity trends)

---

## 📞 Support

- **OpenWeatherMap Docs**: https://openweathermap.org/api
- **API Dashboard**: https://home.openweathermap.org/
- **Community**: https://community.openweathermap.org/

---

**Happy Farming! 🌾🚜**
