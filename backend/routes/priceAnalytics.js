import express from 'express';
import { protect } from '../middleware/auth.js';
import PricePrediction from '../models/PricePrediction.js';
import PriceHistory from '../models/PriceHistory.js';
import pricePredictionService from '../services/pricePrediction.js';

const router = express.Router();

// Get price prediction for a specific crop
router.post('/predict', protect, async (req, res) => {
  try {
    const { crop, currentPrice, location, weatherCondition, season } = req.body;

    if (!crop || !currentPrice) {
      return res.status(400).json({ message: 'Crop and current price are required' });
    }

    // Get ML prediction
    const prediction = await pricePredictionService.predictPrice(
      crop,
      currentPrice,
      location,
      weatherCondition,
      season
    );

    // Save prediction to database
    const savedPrediction = await PricePrediction.create({
      user: req.user._id,
      crop,
      location,
      ...prediction,
    });

    res.json(savedPrediction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get historical prices for a crop
router.get('/history/:crop', protect, async (req, res) => {
  try {
    const { crop } = req.params;
    const { days = 30 } = req.query;

    const historicalPrices = await pricePredictionService.getHistoricalPrices(
      crop,
      parseInt(days)
    );

    res.json(historicalPrices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get price forecast for next 7 days
router.post('/forecast', protect, async (req, res) => {
  try {
    const { crop, currentPrice, weatherCondition, season } = req.body;

    if (!crop || !currentPrice) {
      return res.status(400).json({ message: 'Crop and current price are required' });
    }

    const forecast = await pricePredictionService.getPriceForecast(
      crop,
      currentPrice,
      weatherCondition,
      season
    );

    res.json(forecast);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's prediction history
router.get('/my-predictions', protect, async (req, res) => {
  try {
    const predictions = await PricePrediction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(predictions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get market sentiment for a crop
router.get('/sentiment/:crop', protect, async (req, res) => {
  try {
    const { crop } = req.params;
    const { currentPrice } = req.query;

    if (!currentPrice) {
      return res.status(400).json({ message: 'Current price is required' });
    }

    // Get recent prediction
    const prediction = await pricePredictionService.predictPrice(
      crop,
      parseFloat(currentPrice)
    );

    const sentiment = pricePredictionService.getMarketSentiment(
      prediction.priceChange
    );

    res.json({
      crop,
      currentPrice: parseFloat(currentPrice),
      priceChange: prediction.priceChange,
      ...sentiment,
      recommendation: prediction.recommendation.message,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available crops for prediction
router.get('/crops', protect, async (req, res) => {
  try {
    const crops = ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Tomato', 'Onion', 'Potato'];

    res.json({ crops });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk upload historical price data (admin only)
router.post('/history/bulk', protect, async (req, res) => {
  try {
    const { priceData } = req.body;

    if (!Array.isArray(priceData)) {
      return res.status(400).json({ message: 'Price data must be an array' });
    }

    const savedData = await PriceHistory.insertMany(priceData);
    res.json({ message: 'Price history uploaded successfully', count: savedData.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
