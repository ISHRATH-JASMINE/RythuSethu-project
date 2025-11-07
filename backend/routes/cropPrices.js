import express from 'express';
import CropPrice from '../models/CropPrice.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/crop-prices
// @desc    Get crop prices with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { cropName, state, district, village, sortBy = 'price', limit = 50 } = req.query;
    
    // Build query - don't filter by isActive since many old records don't have it
    const query = {};
    
    // Add isActive filter but also include records where isActive is undefined
    query.$or = [
      { isActive: true },
      { isActive: { $exists: false } }
    ];
    
    if (cropName) {
      // Search case-insensitively
      query.cropName = new RegExp(`^${cropName}$`, 'i');
    }
    
    if (state) {
      query['location.state'] = new RegExp(state, 'i');
    }
    
    if (district) {
      query['location.district'] = new RegExp(district, 'i');
    }
    
    if (village) {
      query['location.village'] = new RegExp(village, 'i');
    }
    
    // Determine sort order - handle both price and pricePerQuintal fields
    let sortOptions = {};
    switch (sortBy) {
      case 'price':
        sortOptions = { pricePerQuintal: -1, price: -1 }; // Highest price first
        break;
      case 'price-asc':
        sortOptions = { pricePerQuintal: 1, price: 1 }; // Lowest price first
        break;
      case 'stock':
        sortOptions = { stockAvailable: -1, 'quantity.available': -1 };
        break;
      case 'recent':
        sortOptions = { lastUpdated: -1, updatedAt: -1 };
        break;
      default:
        sortOptions = { pricePerQuintal: -1, price: -1 };
    }
    
    const cropPrices = await CropPrice.find(query)
      .populate('postedBy dealer', 'name phone email dealerInfo')
      .sort(sortOptions)
      .limit(parseInt(limit));
    
    // Normalize the data to handle both old and new formats
    const normalizedPrices = cropPrices.map(price => {
      const priceObj = price.toObject();
      
      // Ensure we have pricePerQuintal
      if (!priceObj.pricePerQuintal && priceObj.price) {
        priceObj.pricePerQuintal = priceObj.price;
      }
      
      // Calculate pricePerKg if not present
      if (!priceObj.pricePerKg && priceObj.pricePerQuintal) {
        priceObj.pricePerKg = (priceObj.pricePerQuintal / 100).toFixed(2);
      }
      
      // Ensure stockAvailable exists
      if (!priceObj.stockAvailable && priceObj.quantity?.available) {
        priceObj.stockAvailable = priceObj.quantity.available;
      }
      
      // Set dealer info from either dealer or postedBy
      if (!priceObj.dealerName) {
        priceObj.dealerName = priceObj.dealer?.name || priceObj.postedBy?.name || 'Unknown Dealer';
      }
      
      // Ensure contactInfo exists
      if (!priceObj.contactInfo && priceObj.postedBy) {
        priceObj.contactInfo = {
          phone: priceObj.postedBy.phone || priceObj.dealer?.phone,
          email: priceObj.postedBy.email || priceObj.dealer?.email
        };
      }
      
      return priceObj;
    });
    
    // Calculate statistics using normalized price field
    const pricesForStats = cropPrices.map(p => p.pricePerQuintal || p.price).filter(Boolean);
    
    const stats = {
      avgPrice: pricesForStats.length > 0 ? pricesForStats.reduce((a, b) => a + b, 0) / pricesForStats.length : 0,
      maxPrice: pricesForStats.length > 0 ? Math.max(...pricesForStats) : 0,
      minPrice: pricesForStats.length > 0 ? Math.min(...pricesForStats) : 0,
      totalStock: cropPrices.reduce((sum, p) => sum + (p.stockAvailable || p.quantity?.available || 0), 0),
      dealerCount: cropPrices.length
    };
    
    res.json({
      success: true,
      count: normalizedPrices.length,
      data: normalizedPrices,
      statistics: stats
    });
  } catch (error) {
    console.error('Error fetching crop prices:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching crop prices',
      error: error.message
    });
  }
});

// @route   GET /api/crop-prices/top-deals
// @desc    Get top 3 best deals by location
// @access  Public
router.get('/top-deals', async (req, res) => {
  try {
    const { cropName, state, district } = req.query;
    
    const query = {};
    
    // Include records without isActive or with isActive: true
    query.$or = [
      { isActive: true },
      { isActive: { $exists: false } }
    ];
    
    if (cropName) {
      query.cropName = new RegExp(`^${cropName}$`, 'i');
    }
    
    if (state) {
      query['location.state'] = new RegExp(state, 'i');
    }
    
    if (district) {
      query['location.district'] = new RegExp(district, 'i');
    }
    
    const topDeals = await CropPrice.find(query)
      .populate('postedBy dealer', 'name phone email dealerInfo')
      .sort({ pricePerQuintal: -1, price: -1 })
      .limit(3);
    
    // Normalize the data
    const normalizedDeals = topDeals.map(deal => {
      const dealObj = deal.toObject();
      
      // Ensure we have pricePerQuintal
      if (!dealObj.pricePerQuintal && dealObj.price) {
        dealObj.pricePerQuintal = dealObj.price;
      }
      
      // Calculate pricePerKg
      if (!dealObj.pricePerKg && dealObj.pricePerQuintal) {
        dealObj.pricePerKg = (dealObj.pricePerQuintal / 100).toFixed(2);
      }
      
      // Ensure stockAvailable
      if (!dealObj.stockAvailable && dealObj.quantity?.available) {
        dealObj.stockAvailable = dealObj.quantity.available;
      }
      
      // Set dealer name
      if (!dealObj.dealerName) {
        dealObj.dealerName = dealObj.dealer?.name || dealObj.postedBy?.name || 'Unknown Dealer';
      }
      
      // Ensure contactInfo
      if (!dealObj.contactInfo && (dealObj.postedBy || dealObj.dealer)) {
        dealObj.contactInfo = {
          phone: dealObj.postedBy?.phone || dealObj.dealer?.phone,
          email: dealObj.postedBy?.email || dealObj.dealer?.email
        };
      }
      
      return dealObj;
    });
    
    res.json({
      success: true,
      data: normalizedDeals
    });
  } catch (error) {
    console.error('Error fetching top deals:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top deals',
      error: error.message
    });
  }
});

// @route   GET /api/crop-prices/my-prices
// @desc    Get dealer's own crop prices
// @access  Private (Dealer only)
router.get('/my-prices', protect, authorize('dealer'), async (req, res) => {
  try {
    const cropPrices = await CropPrice.find({ dealer: req.user._id })
      .sort({ lastUpdated: -1 });
    
    res.json({
      success: true,
      count: cropPrices.length,
      data: cropPrices
    });
  } catch (error) {
    console.error('Error fetching dealer prices:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your crop prices',
      error: error.message
    });
  }
});

// @route   POST /api/crop-prices
// @desc    Create or update crop price
// @access  Private (Dealer only)
router.post('/', protect, authorize('dealer'), async (req, res) => {
  try {
    const {
      cropName,
      location,
      pricePerQuintal,
      stockAvailable,
      contactNumber
    } = req.body;
    
    // Validation
    if (!cropName || !location || !pricePerQuintal || stockAvailable === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Check if dealer already has a price entry for this crop
    const existingPrice = await CropPrice.findOne({
      dealer: req.user._id,
      cropName: cropName.toLowerCase(),
      'location.state': location.state,
      'location.district': location.district
    });
    
    if (existingPrice) {
      // Update existing price
      existingPrice.previousPrice = existingPrice.pricePerQuintal;
      existingPrice.pricePerQuintal = pricePerQuintal;
      existingPrice.stockAvailable = stockAvailable;
      existingPrice.location = location;
      existingPrice.contactNumber = contactNumber || req.user.phone;
      existingPrice.lastUpdated = Date.now();
      
      await existingPrice.save();
      
      return res.json({
        success: true,
        message: 'Crop price updated successfully',
        data: existingPrice
      });
    }
    
    // Create new price entry
    const cropPrice = await CropPrice.create({
      cropName: cropName.toLowerCase(),
      location,
      dealer: req.user._id,
      dealerName: req.user.dealerInfo?.businessName || req.user.name,
      pricePerQuintal,
      stockAvailable,
      contactNumber: contactNumber || req.user.phone
    });
    
    res.status(201).json({
      success: true,
      message: 'Crop price created successfully',
      data: cropPrice
    });
  } catch (error) {
    console.error('Error creating crop price:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating crop price',
      error: error.message
    });
  }
});

// @route   PUT /api/crop-prices/:id
// @desc    Update crop price
// @access  Private (Dealer only)
router.put('/:id', protect, authorize('dealer'), async (req, res) => {
  try {
    let cropPrice = await CropPrice.findById(req.params.id);
    
    if (!cropPrice) {
      return res.status(404).json({
        success: false,
        message: 'Crop price not found'
      });
    }
    
    // Check ownership
    if (cropPrice.dealer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this price'
      });
    }
    
    const { pricePerQuintal, stockAvailable, location, contactNumber } = req.body;
    
    if (pricePerQuintal) {
      cropPrice.previousPrice = cropPrice.pricePerQuintal;
      cropPrice.pricePerQuintal = pricePerQuintal;
    }
    
    if (stockAvailable !== undefined) {
      cropPrice.stockAvailable = stockAvailable;
    }
    
    if (location) {
      cropPrice.location = location;
    }
    
    if (contactNumber) {
      cropPrice.contactNumber = contactNumber;
    }
    
    cropPrice.lastUpdated = Date.now();
    
    await cropPrice.save();
    
    res.json({
      success: true,
      message: 'Crop price updated successfully',
      data: cropPrice
    });
  } catch (error) {
    console.error('Error updating crop price:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating crop price',
      error: error.message
    });
  }
});

// @route   DELETE /api/crop-prices/:id
// @desc    Delete (deactivate) crop price
// @access  Private (Dealer only)
router.delete('/:id', protect, authorize('dealer'), async (req, res) => {
  try {
    const cropPrice = await CropPrice.findById(req.params.id);
    
    if (!cropPrice) {
      return res.status(404).json({
        success: false,
        message: 'Crop price not found'
      });
    }
    
    // Check ownership
    if (cropPrice.dealer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this price'
      });
    }
    
    cropPrice.isActive = false;
    await cropPrice.save();
    
    res.json({
      success: true,
      message: 'Crop price deactivated successfully'
    });
  } catch (error) {
    console.error('Error deleting crop price:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting crop price',
      error: error.message
    });
  }
});

// @route   GET /api/crop-prices/crops
// @desc    Get list of available crops
// @access  Public
router.get('/crops', async (req, res) => {
  try {
    const crops = await CropPrice.distinct('cropName');
    
    res.json({
      success: true,
      data: crops
    });
  } catch (error) {
    console.error('Error fetching crops:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching crops',
      error: error.message
    });
  }
});

export default router;
