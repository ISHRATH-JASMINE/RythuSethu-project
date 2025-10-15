import express from 'express';
import { protect } from '../middleware/auth.js';
import cropRecommendationService from '../services/cropRecommendation.js';
import Notification from '../models/Notification.js';
import { sendEmail } from '../config/nodemailer.js';

const router = express.Router();

// Helper function to convert soil pH to soil type
function getSoilTypeFromPH(pH) {
  if (pH < 5.5) {
    return 'Sandy loam'; // Acidic soils
  } else if (pH >= 5.5 && pH < 6.5) {
    return 'Red soil'; // Slightly acidic
  } else if (pH >= 6.5 && pH < 7.5) {
    return 'Loamy'; // Neutral - ideal for most crops
  } else if (pH >= 7.5 && pH < 8.5) {
    return 'Black soil'; // Slightly alkaline
  } else {
    return 'Clayey'; // Alkaline soils
  }
}

// Get comprehensive crop recommendations (no auth required - accessible to all farmers)
router.post('/recommend', async (req, res) => {
  try {
    const { location, soilPH, season, landSize, previousCrop, rainfall, temperature } = req.body;

    // Validate required fields
    if (!soilPH || !season || !landSize) {
      return res.status(400).json({ 
        message: 'Please provide soil pH, season, and land size' 
      });
    }

    // Convert soil pH to soil type for recommendation algorithm
    const soilType = getSoilTypeFromPH(parseFloat(soilPH));

    // Get crop recommendations
    const recommendations = cropRecommendationService.recommendCrops({
      location: location || 'Unknown',
      soilType,
      soilPH: parseFloat(soilPH),
      season,
      landSize: parseFloat(landSize),
      previousCrop: previousCrop || null,
      rainfall: rainfall || 'Moderate',
      temperature: temperature || 25
    });

    // Get weather information
    const weather = await cropRecommendationService.getWeatherInfo(location || 'Unknown');

    // Get market conditions for top recommendation
    const market = recommendations.length > 0 
      ? cropRecommendationService.getMarketConditions(recommendations[0].name)
      : null;

    // Check for notifications
    const notifications = cropRecommendationService.shouldNotify(
      { weather, market },
      { crops: recommendations.map(r => r.name) }
    );

    // Save notifications to database and send alerts (only if user is authenticated)
    if (notifications.length > 0 && req.user) {
      for (const notification of notifications) {
        // Save to database
        await Notification.create({
          user: req.user._id,
          title: notification.type === 'weather' ? '🌦️ Weather Alert' : '💰 Market Update',
          message: notification.message,
          type: notification.type,
          priority: notification.priority
        });

        // Send email notification
        try {
          await sendEmail(
            req.user.email,
            notification.type === 'weather' ? 'Weather Alert - RythuSetu' : 'Market Update - RythuSetu',
            `
              <h2>Hello ${req.user.name},</h2>
              <p>${notification.message}</p>
              <p>Location: ${location || 'Your area'}</p>
              <p><strong>Stay informed and plan your farming activities accordingly.</strong></p>
              <br>
              <p>Best regards,<br>RythuSetu Team</p>
            `
          );
        } catch (emailError) {
          console.error('Email notification error:', emailError);
        }
      }
    }

    res.json({
      success: true,
      recommendations,
      weather,
      market,
      notifications,
      message: `Found ${recommendations.length} suitable crops for your requirements`
    });
  } catch (error) {
    console.error('Crop recommendation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get weather information
router.get('/weather/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const weather = await cropRecommendationService.getWeatherInfo(location);
    res.json(weather);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get market conditions for a crop
router.get('/market/:cropName', async (req, res) => {
  try {
    const { cropName } = req.params;
    const marketData = cropRecommendationService.getMarketConditions(cropName);
    res.json(marketData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get fertilizer recommendations for a crop
router.get('/fertilizer/:cropName', async (req, res) => {
  try {
    const { cropName } = req.params;
    const crop = cropRecommendationService.cropsDatabase.find(
      c => c.name.toLowerCase() === cropName.toLowerCase()
    );

    if (crop) {
      res.json({ 
        crop: cropName,
        tips: crop.tips,
        waterRequirement: crop.waterRequirement,
        duration: crop.duration
      });
    } else {
      res.status(404).json({ message: 'Crop not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all available crops
router.get('/all', async (req, res) => {
  try {
    const crops = cropRecommendationService.cropsDatabase.map(crop => ({
      name: crop.name,
      season: crop.season,
      soilTypes: crop.soilTypes,
      duration: crop.duration,
      marketDemand: crop.marketDemand
    }));
    res.json(crops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
