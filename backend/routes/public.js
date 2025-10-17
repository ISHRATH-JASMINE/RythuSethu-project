import express from 'express';
import CropPrice from '../models/CropPrice.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * @route   GET /api/public/prices
 * @desc    Browse all active crop prices (public access)
 * @access  Public
 */
router.get('/prices', async (req, res) => {
  try {
    const {
      crop,
      state,
      district,
      minPrice,
      maxPrice,
      variety,
      sortBy = '-createdAt',
      page = 1,
      limit = 20,
    } = req.query;

    // Build query
    const query = { 
      status: 'active',
      validUntil: { $gt: new Date() } // Only show non-expired
    };

    if (crop) {
      query.cropName = new RegExp(crop, 'i');
    }

    if (state) {
      query['location.state'] = new RegExp(state, 'i');
    }

    if (district) {
      query['location.district'] = new RegExp(district, 'i');
    }

    if (variety) {
      query.variety = new RegExp(variety, 'i');
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Execute query
    const prices = await CropPrice.find(query)
      .populate('postedBy', 'name phone dealerInfo.businessName dealerInfo.specialization location')
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await CropPrice.countDocuments(query);

    res.json({
      success: true,
      prices,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error('Browse prices error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/public/prices/search
 * @desc    Search crop prices with advanced filters
 * @access  Public
 */
router.get('/prices/search', async (req, res) => {
  try {
    const { q, location, page = 1, limit = 20 } = req.query;

    const query = { 
      status: 'active',
      validUntil: { $gt: new Date() }
    };

    if (q) {
      // Search in crop name, variety, description
      query.$or = [
        { cropName: new RegExp(q, 'i') },
        { variety: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
      ];
    }

    if (location) {
      // Search in state, district, or pincode
      query.$or = [
        { 'location.state': new RegExp(location, 'i') },
        { 'location.district': new RegExp(location, 'i') },
        { 'location.pincode': location },
      ];
    }

    const prices = await CropPrice.find(query)
      .populate('postedBy', 'name phone dealerInfo.businessName location')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CropPrice.countDocuments(query);

    res.json({
      success: true,
      prices,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error('Search prices error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/public/prices/:id
 * @desc    Get single price details and increment view count
 * @access  Public
 */
router.get('/prices/:id', async (req, res) => {
  try {
    const price = await CropPrice.findById(req.params.id)
      .populate('postedBy', 'name phone email dealerInfo location');

    if (!price) {
      return res.status(404).json({ message: 'Price listing not found' });
    }

    // Check if price is active
    if (price.status !== 'active') {
      return res.status(404).json({ message: 'Price listing is no longer available' });
    }

    // Check if expired
    if (new Date() > price.validUntil) {
      await price.checkExpiry();
      return res.status(404).json({ message: 'Price listing has expired' });
    }

    // Increment view count
    await price.incrementViews();

    res.json({
      success: true,
      price,
    });
  } catch (error) {
    console.error('Get price details error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/public/prices/:id/inquiry
 * @desc    Send inquiry for a price (increment inquiry count)
 * @access  Public
 */
router.post('/prices/:id/inquiry', async (req, res) => {
  try {
    const price = await CropPrice.findById(req.params.id);

    if (!price) {
      return res.status(404).json({ message: 'Price listing not found' });
    }

    if (price.status !== 'active') {
      return res.status(400).json({ message: 'Price listing is no longer available' });
    }

    // Increment inquiry count
    await price.incrementInquiries();

    res.json({
      success: true,
      message: 'Inquiry recorded. Please contact the dealer for more information.',
      contactInfo: price.contactInfo,
    });
  } catch (error) {
    console.error('Send inquiry error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/public/crops/trending
 * @desc    Get trending crops based on views and inquiries
 * @access  Public
 */
router.get('/crops/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const trendingPrices = await CropPrice.find({
      status: 'active',
      validUntil: { $gt: new Date() },
    })
      .sort({ views: -1, inquiries: -1 })
      .limit(parseInt(limit))
      .populate('postedBy', 'name dealerInfo.businessName location')
      .select('cropName variety price location views inquiries createdAt');

    res.json({
      success: true,
      trendingPrices,
    });
  } catch (error) {
    console.error('Get trending crops error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/public/locations
 * @desc    Get available locations (states, districts)
 * @access  Public
 */
router.get('/locations', async (req, res) => {
  try {
    // Get unique states
    const states = await CropPrice.distinct('location.state', {
      status: 'active',
      validUntil: { $gt: new Date() },
    });

    // Get unique districts
    const districts = await CropPrice.distinct('location.district', {
      status: 'active',
      validUntil: { $gt: new Date() },
    });

    res.json({
      success: true,
      locations: {
        states: states.filter(Boolean).sort(),
        districts: districts.filter(Boolean).sort(),
      },
    });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/public/crops
 * @desc    Get available crop names
 * @access  Public
 */
router.get('/crops', async (req, res) => {
  try {
    const crops = await CropPrice.distinct('cropName', {
      status: 'active',
      validUntil: { $gt: new Date() },
    });

    res.json({
      success: true,
      crops: crops.filter(Boolean).sort(),
    });
  } catch (error) {
    console.error('Get crops error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
