import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Dummy weather and soil data
const generateWeatherData = (location) => {
  const temperatures = [25, 28, 30, 32, 29, 27, 26];
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Thunderstorm'];
  
  const forecast = Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    temperature: {
      min: temperatures[i] - 5,
      max: temperatures[i] + 5,
      avg: temperatures[i],
    },
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    humidity: Math.floor(Math.random() * 40) + 50,
    rainfall: Math.random() > 0.6 ? Math.floor(Math.random() * 30) : 0,
    windSpeed: Math.floor(Math.random() * 15) + 5,
  }));

  return {
    location: location || 'Default Location',
    current: forecast[0],
    forecast,
    alerts: [
      { type: 'warning', message: 'Heavy rainfall expected in next 48 hours', severity: 'medium' },
    ],
  };
};

const generateSoilData = (location) => {
  return {
    location: location || 'Default Location',
    soilType: 'Loamy',
    pH: 6.5,
    moisture: 65,
    nitrogen: 'Medium',
    phosphorus: 'High',
    potassium: 'Medium',
    organicMatter: 3.2,
    ec: 0.45,
    recommendations: [
      'Soil pH is optimal for most crops',
      'Consider adding potassium-rich fertilizer',
      'Maintain current moisture levels',
      'Good organic matter content',
    ],
    lastUpdated: new Date().toISOString(),
  };
};

// Get weather forecast
router.get('/forecast', protect, async (req, res) => {
  try {
    const { location } = req.query;
    const weatherData = generateWeatherData(location);
    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get soil insights
router.get('/soil', protect, async (req, res) => {
  try {
    const { location } = req.query;
    const soilData = generateSoilData(location);
    res.json(soilData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get combined weather and soil data
router.get('/combined', protect, async (req, res) => {
  try {
    const { location } = req.query;
    const weatherData = generateWeatherData(location);
    const soilData = generateSoilData(location);
    
    res.json({
      weather: weatherData,
      soil: soilData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
