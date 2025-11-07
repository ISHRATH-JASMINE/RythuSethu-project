import express from 'express';
import BuyingRate from '../models/BuyingRate.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is a dealer
const isDealer = (req, res, next) => {
  if (req.user && req.user.role === 'dealer') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Dealers only.' });
  }
};

// @route   POST /api/buying-rates
// @desc    Create a new buying rate
// @access  Private (Dealer only)
router.post('/', protect, isDealer, async (req, res) => {
  try {
    const {
      cropName,
      buyPricePerKg,
      availableFrom,
      availableTill,
      location,
      minimumQuantity,
      maximumQuantity,
      qualityRequirements,
      paymentTerms,
      validUntil
    } = req.body;

    // Validation
    if (!cropName || !buyPricePerKg) {
      return res.status(400).json({
        success: false,
        message: 'Crop name and buy price per kg are required'
      });
    }

    if (!location || !location.district) {
      return res.status(400).json({
        success: false,
        message: 'Location district is required'
      });
    }

    // Validate time range if provided
    if (availableFrom && availableTill) {
      if (availableTill <= availableFrom) {
        return res.status(400).json({
          success: false,
          message: 'Available till time must be after available from time'
        });
      }
    }

    const buyingRate = await BuyingRate.create({
      dealer: req.user._id,
      dealerName: req.user.name,
      cropName,
      buyPricePerKg,
      availableFrom,
      availableTill,
      location,
      minimumQuantity,
      maximumQuantity,
      qualityRequirements,
      paymentTerms,
      validUntil
    });

    res.status(201).json({
      success: true,
      message: 'Buying rate created successfully',
      buyingRate
    });
  } catch (error) {
    console.error('Error creating buying rate:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create buying rate'
    });
  }
});

// @route   GET /api/buying-rates/my-rates
// @desc    Get dealer's own buying rates
// @access  Private (Dealer only)
router.get('/my-rates', protect, isDealer, async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = { dealer: req.user._id };
    if (status) {
      query.status = status;
    }

    const rates = await BuyingRate.find(query).sort({ createdAt: -1 });

    // Calculate stats
    const stats = {
      total: rates.length,
      active: rates.filter(r => r.status === 'active').length,
      inactive: rates.filter(r => r.status === 'inactive').length,
      expired: rates.filter(r => r.isExpired()).length
    };

    res.json({
      success: true,
      rates,
      stats
    });
  } catch (error) {
    console.error('Error fetching dealer rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch buying rates'
    });
  }
});

// @route   GET /api/buying-rates/search
// @desc    Search buying rates (public, for farmers)
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { cropName, district, minPrice, maxPrice, sortBy } = req.query;

    const query = {
      status: 'active',
      validUntil: { $gt: new Date() }
    };

    if (cropName) {
      query.cropName = new RegExp(cropName, 'i');
    }

    if (district) {
      query['location.district'] = new RegExp(district, 'i');
    }

    if (minPrice || maxPrice) {
      query.buyPricePerKg = {};
      if (minPrice) query.buyPricePerKg.$gte = parseFloat(minPrice);
      if (maxPrice) query.buyPricePerKg.$lte = parseFloat(maxPrice);
    }

    let sort = { createdAt: -1 };
    if (sortBy === 'price-high') {
      sort = { buyPricePerKg: -1 };
    } else if (sortBy === 'price-low') {
      sort = { buyPricePerKg: 1 };
    }

    const rates = await BuyingRate.find(query)
      .populate('dealer', 'name phone email dealerInfo')
      .sort(sort);

    // Filter rates that are currently available (time-based)
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const availableNow = rates.filter(rate => {
      if (!rate.availableFrom || !rate.availableTill) return true;
      return currentTime >= rate.availableFrom && currentTime <= rate.availableTill;
    });

    res.json({
      success: true,
      rates,
      availableNow,
      count: rates.length,
      availableCount: availableNow.length
    });
  } catch (error) {
    console.error('Error searching buying rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search buying rates'
    });
  }
});

// @route   GET /api/buying-rates/:id
// @desc    Get single buying rate
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const rate = await BuyingRate.findById(req.params.id)
      .populate('dealer', 'name phone email dealerInfo');

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: 'Buying rate not found'
      });
    }

    // Increment view count
    await rate.incrementViews();

    res.json({
      success: true,
      rate,
      isCurrentlyAvailable: rate.isCurrentlyAvailable()
    });
  } catch (error) {
    console.error('Error fetching buying rate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch buying rate'
    });
  }
});

// @route   PUT /api/buying-rates/:id
// @desc    Update buying rate
// @access  Private (Dealer only, own rates only)
router.put('/:id', protect, isDealer, async (req, res) => {
  try {
    const rate = await BuyingRate.findById(req.params.id);

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: 'Buying rate not found'
      });
    }

    // Check ownership
    if (rate.dealer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this buying rate'
      });
    }

    // Update fields
    const allowedUpdates = [
      'cropName', 'buyPricePerKg', 'availableFrom', 'availableTill',
      'location', 'minimumQuantity', 'maximumQuantity',
      'qualityRequirements', 'paymentTerms', 'validUntil', 'status'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        rate[field] = req.body[field];
      }
    });

    await rate.save();

    res.json({
      success: true,
      message: 'Buying rate updated successfully',
      rate
    });
  } catch (error) {
    console.error('Error updating buying rate:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update buying rate'
    });
  }
});

// @route   DELETE /api/buying-rates/:id
// @desc    Delete buying rate
// @access  Private (Dealer only, own rates only)
router.delete('/:id', protect, isDealer, async (req, res) => {
  try {
    const rate = await BuyingRate.findById(req.params.id);

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: 'Buying rate not found'
      });
    }

    // Check ownership
    if (rate.dealer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this buying rate'
      });
    }

    await rate.deleteOne();

    res.json({
      success: true,
      message: 'Buying rate deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting buying rate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete buying rate'
    });
  }
});

// @route   PUT /api/buying-rates/:id/toggle-status
// @desc    Toggle buying rate status (active/inactive)
// @access  Private (Dealer only, own rates only)
router.put('/:id/toggle-status', protect, isDealer, async (req, res) => {
  try {
    const rate = await BuyingRate.findById(req.params.id);

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: 'Buying rate not found'
      });
    }

    // Check ownership
    if (rate.dealer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this buying rate'
      });
    }

    rate.status = rate.status === 'active' ? 'inactive' : 'active';
    await rate.save();

    res.json({
      success: true,
      message: `Buying rate ${rate.status === 'active' ? 'activated' : 'deactivated'} successfully`,
      rate
    });
  } catch (error) {
    console.error('Error toggling buying rate status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update buying rate status'
    });
  }
});

// @route   POST /api/buying-rates/:id/inquiry
// @desc    Increment inquiry count (when farmer shows interest)
// @access  Public
router.post('/:id/inquiry', async (req, res) => {
  try {
    const rate = await BuyingRate.findById(req.params.id);

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: 'Buying rate not found'
      });
    }

    await rate.incrementInquiries();

    res.json({
      success: true,
      message: 'Inquiry recorded'
    });
  } catch (error) {
    console.error('Error recording inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record inquiry'
    });
  }
});

export default router;
