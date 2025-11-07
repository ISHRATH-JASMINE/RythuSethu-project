// Comprehensive Crop Recommendation Service with Rule-Based Logic
import axios from 'axios';

class CropRecommendationService {
  constructor() {
    // Comprehensive crop database with scoring parameters
    this.cropsDatabase = [
      {
        name: 'Rice',
        season: ['Kharif', 'Rabi'],
        soilTypes: ['Clay loam', 'Loamy', 'Clayey'],
        rainfall: 'High',
        minLandSize: 0.5, // acres
        temperature: { min: 20, max: 35 },
        duration: '120-150 days',
        profitability: 8,
        waterRequirement: 'High',
        previousCropCompatibility: ['Wheat', 'Pulses', 'Vegetables'],
        avgYield: '40-50 quintals/acre',
        marketDemand: 'Very High',
        description: 'Staple food crop with consistent market demand',
        tips: ['Maintain standing water', 'Use certified seeds', 'Apply nitrogenous fertilizers in splits']
      },
      {
        name: 'Wheat',
        season: ['Rabi'],
        soilTypes: ['Loamy', 'Clay loam', 'Sandy loam'],
        rainfall: 'Moderate',
        minLandSize: 1,
        temperature: { min: 10, max: 25 },
        duration: '120-130 days',
        profitability: 7,
        waterRequirement: 'Moderate',
        previousCropCompatibility: ['Rice', 'Cotton', 'Sugarcane'],
        avgYield: '35-45 quintals/acre',
        marketDemand: 'Very High',
        description: 'Rabi season staple with good market value',
        tips: ['Timely sowing is crucial', 'Use line sowing method', '4-5 irrigations needed']
      },
      {
        name: 'Cotton',
        season: ['Kharif'],
        soilTypes: ['Black soil', 'Clayey', 'Loamy'],
        rainfall: 'Moderate',
        minLandSize: 2,
        temperature: { min: 21, max: 30 },
        duration: '150-180 days',
        profitability: 9,
        waterRequirement: 'Moderate',
        previousCropCompatibility: ['Wheat', 'Sorghum', 'Pulses'],
        avgYield: '15-20 quintals/acre',
        marketDemand: 'High',
        description: 'Cash crop with high profitability',
        tips: ['Deep plowing required', 'Pest management critical', 'Adequate drainage needed']
      },
      {
        name: 'Sugarcane',
        season: ['Year-round'],
        soilTypes: ['Loamy', 'Clay loam', 'Black soil'],
        rainfall: 'High',
        minLandSize: 1,
        temperature: { min: 20, max: 35 },
        duration: '12-18 months',
        profitability: 9,
        waterRequirement: 'Very High',
        previousCropCompatibility: ['Wheat', 'Pulses', 'Vegetables'],
        avgYield: '300-400 quintals/acre',
        marketDemand: 'High',
        description: 'Long duration cash crop with high returns',
        tips: ['Requires assured irrigation', 'Heavy fertilizer application', 'Earthing up at 90-120 days']
      },
      {
        name: 'Maize',
        season: ['Kharif', 'Rabi', 'Summer'],
        soilTypes: ['Loamy', 'Sandy loam', 'Well-drained loam'],
        rainfall: 'Moderate',
        minLandSize: 0.5,
        temperature: { min: 18, max: 32 },
        duration: '80-110 days',
        profitability: 7,
        waterRequirement: 'Moderate',
        previousCropCompatibility: ['Wheat', 'Rice', 'Pulses'],
        avgYield: '30-40 quintals/acre',
        marketDemand: 'High',
        description: 'Versatile crop suitable for multiple seasons',
        tips: ['Plant in rows', 'Weed control essential', 'Balanced NPK fertilization']
      },
      {
        name: 'Pulses (Lentils)',
        season: ['Rabi'],
        soilTypes: ['Sandy loam', 'Loamy', 'Black soil'],
        rainfall: 'Low',
        minLandSize: 0.5,
        temperature: { min: 15, max: 28 },
        duration: '90-120 days',
        profitability: 6,
        waterRequirement: 'Low',
        previousCropCompatibility: ['Rice', 'Cotton', 'Maize'],
        avgYield: '8-12 quintals/acre',
        marketDemand: 'Medium',
        description: 'Nitrogen-fixing crop, good for soil health',
        tips: ['Minimal irrigation needed', 'Rhizobium inoculation recommended', 'Light soils preferred']
      },
      {
        name: 'Tomato',
        season: ['Kharif', 'Rabi'],
        soilTypes: ['Loamy', 'Sandy loam', 'Well-drained loam'],
        rainfall: 'Moderate',
        minLandSize: 0.25,
        temperature: { min: 18, max: 27 },
        duration: '90-120 days',
        profitability: 8,
        waterRequirement: 'Moderate',
        previousCropCompatibility: ['Wheat', 'Maize', 'Pulses'],
        avgYield: '200-300 quintals/acre',
        marketDemand: 'High',
        description: 'High-value vegetable crop',
        tips: ['Staking required', 'Regular pest monitoring', 'Drip irrigation ideal']
      },
      {
        name: 'Onion',
        season: ['Rabi', 'Kharif'],
        soilTypes: ['Loamy', 'Sandy loam', 'Black soil'],
        rainfall: 'Moderate',
        minLandSize: 0.5,
        temperature: { min: 15, max: 25 },
        duration: '120-150 days',
        profitability: 8,
        waterRequirement: 'Moderate',
        previousCropCompatibility: ['Rice', 'Wheat', 'Cotton'],
        avgYield: '150-200 quintals/acre',
        marketDemand: 'Very High',
        description: 'Essential vegetable with good returns',
        tips: ['Transplanting method preferred', 'Light irrigation frequently', 'Harvest when tops fall']
      },
      {
        name: 'Potato',
        season: ['Rabi'],
        soilTypes: ['Sandy loam', 'Loamy', 'Well-drained loam'],
        rainfall: 'Low',
        minLandSize: 0.5,
        temperature: { min: 15, max: 22 },
        duration: '90-120 days',
        profitability: 7,
        waterRequirement: 'Moderate',
        previousCropCompatibility: ['Rice', 'Maize', 'Sugarcane'],
        avgYield: '120-180 quintals/acre',
        marketDemand: 'High',
        description: 'Profitable vegetable crop for Rabi season',
        tips: ['Ridges and furrows method', 'Earthing up twice', 'Avoid waterlogging']
      },
      {
        name: 'Groundnut',
        season: ['Kharif', 'Summer'],
        soilTypes: ['Sandy loam', 'Loamy', 'Red soil'],
        rainfall: 'Moderate',
        minLandSize: 1,
        temperature: { min: 20, max: 30 },
        duration: '100-130 days',
        profitability: 7,
        waterRequirement: 'Moderate',
        previousCropCompatibility: ['Rice', 'Wheat', 'Sorghum'],
        avgYield: '15-25 quintals/acre',
        marketDemand: 'Medium',
        description: 'Oilseed crop, improves soil fertility',
        tips: ['Calcium application important', 'Gypsum application at flowering', 'Proper curing before storage']
      },
      {
        name: 'Soybean',
        season: ['Kharif'],
        soilTypes: ['Loamy', 'Black soil', 'Clay loam'],
        rainfall: 'Moderate',
        minLandSize: 1,
        temperature: { min: 20, max: 30 },
        duration: '90-120 days',
        profitability: 7,
        waterRequirement: 'Moderate',
        previousCropCompatibility: ['Wheat', 'Sorghum', 'Cotton'],
        avgYield: '12-18 quintals/acre',
        marketDemand: 'High',
        description: 'Protein-rich oilseed crop',
        tips: ['Inoculation with Rhizobium', 'Good drainage essential', 'Avoid waterlogging']
      },
      {
        name: 'Chilli',
        season: ['Kharif', 'Summer'],
        soilTypes: ['Loamy', 'Sandy loam', 'Red soil'],
        rainfall: 'Moderate',
        minLandSize: 0.25,
        temperature: { min: 20, max: 30 },
        duration: '150-180 days',
        profitability: 9,
        waterRequirement: 'Moderate',
        previousCropCompatibility: ['Wheat', 'Maize', 'Rice'],
        avgYield: '40-60 quintals/acre',
        marketDemand: 'Very High',
        description: 'High-value spice crop',
        tips: ['Transplanting preferred', 'Multiple pickings possible', 'Pest control crucial']
      }
    ];

    // Weather conditions database (dummy data with API placeholder)
    this.weatherConditions = {
      favorable: {
        temperature: { min: 15, max: 35 },
        rainfall: 'Moderate',
        humidity: '50-70%'
      },
      drought: {
        rainfall: 'Low',
        recommendation: 'Choose drought-resistant crops like Pulses, Groundnut, Sorghum'
      },
      flood: {
        rainfall: 'Very High',
        recommendation: 'Ensure proper drainage, consider Rice in waterlogged areas'
      }
    };
  }

  // Main recommendation algorithm
  recommendCrops(inputData) {
    const { location, soilType, season, landSize, previousCrop, rainfall, temperature } = inputData;

    let scoredCrops = this.cropsDatabase.map(crop => {
      let score = 0;
      let reasons = [];

      // Soil type matching (30% weight)
      if (crop.soilTypes.some(soil => soil.toLowerCase() === soilType.toLowerCase())) {
        score += 30;
        reasons.push(`Ideal soil type: ${soilType}`);
      } else if (crop.soilTypes.some(soil => soilType.toLowerCase().includes(soil.toLowerCase().split(' ')[0]))) {
        score += 15;
        reasons.push(`Compatible soil type`);
      }

      // Season matching (25% weight)
      if (crop.season.includes(season) || crop.season.includes('Year-round')) {
        score += 25;
        reasons.push(`Perfect for ${season} season`);
      }

      // Rainfall matching (15% weight)
      if (crop.rainfall.toLowerCase() === rainfall.toLowerCase()) {
        score += 15;
        reasons.push(`Matches rainfall pattern: ${rainfall}`);
      } else if (
        (crop.rainfall === 'Moderate' && (rainfall === 'High' || rainfall === 'Low')) ||
        (rainfall === 'Moderate' && (crop.rainfall === 'High' || crop.rainfall === 'Low'))
      ) {
        score += 8;
        reasons.push(`Adaptable to rainfall`);
      }

      // Land size suitability (10% weight)
      if (landSize >= crop.minLandSize) {
        score += 10;
        if (landSize >= crop.minLandSize * 2) {
          score += 5;
          reasons.push(`Excellent land size for ${crop.name}`);
        } else {
          reasons.push(`Sufficient land size`);
        }
      }

      // Previous crop compatibility (10% weight)
      if (previousCrop && crop.previousCropCompatibility.includes(previousCrop)) {
        score += 10;
        reasons.push(`Good crop rotation after ${previousCrop}`);
      }

      // Profitability bonus (5% weight)
      score += (crop.profitability / 10) * 5;
      if (crop.profitability >= 8) {
        reasons.push(`High profitability potential`);
      }

      // Market demand bonus (5% weight)
      if (crop.marketDemand === 'Very High') {
        score += 5;
        reasons.push(`Excellent market demand`);
      } else if (crop.marketDemand === 'High') {
        score += 3;
      }

      return {
        ...crop,
        score: Math.round(score),
        suitability: Math.min(Math.round(score), 100), // Add suitability alias for frontend
        suitabilityPercentage: Math.min(Math.round(score), 100),
        expectedYield: crop.avgYield, // Add expectedYield alias for frontend
        reasons: reasons,
        recommendationLevel: this.getRecommendationLevel(score)
      };
    });

    // Sort by score and return top 3
    scoredCrops.sort((a, b) => b.score - a.score);
    return scoredCrops.slice(0, 3);
  }

  getRecommendationLevel(score) {
    if (score >= 80) return 'Highly Recommended';
    if (score >= 60) return 'Recommended';
    if (score >= 40) return 'Moderately Suitable';
    return 'Less Suitable';
  }

  // Get weather information with OpenWeatherMap API integration
  async getWeatherInfo(location) {
    try {
      // Check if API key is available
      const apiKey = process.env.WEATHER_API_KEY || process.env.OPENWEATHER_API_KEY;
      
      if (apiKey && apiKey !== 'your_openweather_api_key') {
        // Real API call to OpenWeatherMap
        
        // Get current weather
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)},IN&appid=${apiKey}&units=metric`;
        const currentResponse = await axios.get(currentWeatherUrl);
        const current = currentResponse.data;
        
        // Get 7-day forecast
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)},IN&appid=${apiKey}&units=metric&cnt=56`;
        const forecastResponse = await axios.get(forecastUrl);
        const forecastData = forecastResponse.data.list;
        
        // Process 7-day forecast (group by day)
        const dailyForecasts = [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        for (let i = 0; i < 7; i++) {
          const dayData = forecastData.filter((item, index) => Math.floor(index / 8) === i);
          if (dayData.length > 0) {
            const avgTemp = dayData.reduce((sum, item) => sum + item.main.temp, 0) / dayData.length;
            const totalRain = dayData.reduce((sum, item) => sum + (item.rain ? item.rain['3h'] || 0 : 0), 0);
            const date = new Date(dayData[0].dt * 1000);
            
            dailyForecasts.push({
              day: days[date.getDay()],
              temperature: Math.round(avgTemp),
              rainfall: Math.round(totalRain),
              condition: dayData[0].weather[0].main
            });
          }
        }
        
        // Build response with real data
        const weatherInfo = {
          location: location,
          current: {
            temperature: Math.round(current.main.temp),
            condition: current.weather[0].description,
            humidity: current.main.humidity,
            rainfall: current.rain ? current.rain['1h'] || 0 : 0,
            windSpeed: Math.round(current.wind.speed * 3.6) // Convert m/s to km/h
          },
          forecast: dailyForecasts,
          alerts: [],
          suitableForFarming: true,
          recommendation: ''
        };
        
        // Add alerts based on real conditions
        if (weatherInfo.current.temperature > 35) {
          weatherInfo.alerts.push({
            type: 'heatwave',
            message: 'High temperature alert! Ensure adequate irrigation for crops.',
            severity: 'warning'
          });
          weatherInfo.recommendation = 'High temperatures expected. Increase irrigation frequency and consider shade nets for sensitive crops.';
        }
        
        const totalRain = dailyForecasts.reduce((sum, day) => sum + day.rainfall, 0);
        if (totalRain > 50) {
          weatherInfo.alerts.push({
            type: 'heavy_rain',
            message: `Heavy rainfall expected (${Math.round(totalRain)}mm in 7 days). Check drainage systems.`,
            severity: 'warning'
          });
          weatherInfo.recommendation = 'Heavy rainfall forecasted. Ensure proper drainage and avoid waterlogging in fields.';
        } else if (totalRain < 10 && weatherInfo.current.temperature > 30) {
          weatherInfo.recommendation = 'Low rainfall and high temperature expected. Plan irrigation schedule accordingly.';
        } else {
          weatherInfo.recommendation = 'Weather conditions are favorable for farming activities. Good time for crop cultivation.';
        }
        
        return weatherInfo;
        
      } else {
        // Fallback to dummy data if no API key
        console.log('⚠️ No OpenWeatherMap API key found. Using dummy weather data.');
        return this.getDummyWeatherData(location);
      }
      
    } catch (error) {
      console.error('OpenWeatherMap API Error:', error.message);
      // Fallback to dummy data on error
      return this.getDummyWeatherData(location);
    }
  }

  // Dummy weather data fallback
  getDummyWeatherData(location) {
    // Generate realistic dummy weather data with proper structure
    const baseTemp = 28;
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const forecast = days.map((day, index) => {
      const tempVariation = Math.floor(Math.random() * 6) - 3; // -3 to +3
      const rainChance = Math.random();
      return {
        day: day,
        temperature: baseTemp + tempVariation,
        rainfall: rainChance > 0.6 ? Math.floor(Math.random() * 25) : 0,
        condition: rainChance > 0.6 ? 'Rainy' : rainChance > 0.3 ? 'Cloudy' : 'Sunny'
      };
    });

    const dummyWeather = {
      location: location,
      current: {
        temperature: baseTemp,
        condition: 'Partly Cloudy',
        humidity: 65,
        rainfall: 0,
        windSpeed: 12
      },
      forecast: forecast,
      alerts: [],
      suitableForFarming: true,
      recommendation: 'Good conditions for Kharif crops. Ensure proper drainage for expected rainfall.'
    };

    // Add alerts based on conditions
    if (dummyWeather.current.temperature > 35) {
      dummyWeather.alerts.push({
        type: 'heatwave',
        message: 'High temperature alert! Ensure adequate irrigation for crops.',
        severity: 'warning'
      });
    }

    const totalRain = forecast.reduce((sum, day) => sum + day.rainfall, 0);
    if (totalRain > 50) {
      dummyWeather.alerts.push({
        type: 'heavy_rain',
        message: 'Heavy rainfall expected. Check drainage systems.',
        severity: 'warning'
      });
    }

    return dummyWeather;
  }

  // Get market conditions (placeholder)
  getMarketConditions(cropName) {
    // Dummy market data - Replace with actual market API
    const marketData = {
      crop: cropName,
      currentPrice: this.getRandomPrice(cropName),
      trend: Math.random() > 0.5 ? 'increasing' : 'stable',
      demand: 'High', // Changed from demandLevel to demand
      priceHistory: this.generatePriceHistory(cropName, 30), // Changed from priceHistory30Days
      recommendation: 'Market conditions are favorable for selling in the next 7-10 days.'
    };

    return marketData;
  }

  getRandomPrice(cropName) {
    const basePrices = {
      'Rice': 2500,
      'Wheat': 2200,
      'Cotton': 5500,
      'Sugarcane': 3000,
      'Maize': 1800,
      'Tomato': 25,
      'Onion': 30,
      'Potato': 20,
      'Groundnut': 5000,
      'Soybean': 4000,
      'Chilli': 8000
    };
    const base = basePrices[cropName] || 1000;
    return Math.round(base * (0.9 + Math.random() * 0.2));
  }

  generatePriceHistory(cropName, days) {
    const history = [];
    const basePrice = this.getRandomPrice(cropName);
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variation = 0.9 + Math.random() * 0.2;
      
      history.push({
        day: date.toISOString().split('T')[0], // Changed from 'date' to 'day'
        price: Math.round(basePrice * variation)
      });
    }
    
    return history;
  }

  // Check if notification should be sent
  shouldNotify(currentConditions, userPreferences) {
    const notifications = [];

    // Weather-based notifications
    if (currentConditions.weather.alerts.length > 0) {
      currentConditions.weather.alerts.forEach(alert => {
        notifications.push({
          type: 'weather',
          priority: alert.severity,
          message: alert.message,
          timestamp: new Date().toISOString()
        });
      });
    }

    // Market-based notifications (price change > 10%)
    if (userPreferences.crops) {
      userPreferences.crops.forEach(crop => {
        const marketData = this.getMarketConditions(crop);
        if (marketData.trend === 'increasing') {
          notifications.push({
            type: 'market',
            priority: 'info',
            message: `${crop} prices are increasing. Good time to consider selling.`,
            timestamp: new Date().toISOString()
          });
        }
      });
    }

    return notifications;
  }
}

export default new CropRecommendationService();
