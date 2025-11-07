import express from 'express';
import CropPrice from '../models/CropPrice.js';
import Booking from '../models/Booking.js';
import DealerProduct from '../models/DealerProduct.js';
import BuyingRate from '../models/BuyingRate.js';
import { protect, approvedDealer, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/dealer/prices
 * @desc    Post a new crop price
 * @access  Private (Approved Dealers only)
 */
router.post('/prices', protect, approvedDealer, async (req, res) => {
  try {
    const {
      cropName,
      variety,
      price,
      unit,
      quantity,
      location,
      contactInfo,
      qualityGrade,
      validUntil,
      imageUrl,
      description
    } = req.body;

    // Validation
    if (!cropName || !price || !location?.state || !location?.district) {
      return res.status(400).json({
        message: 'Please provide crop name, price, state, and district'
      });
    }

    // Create crop price
    const cropPrice = await CropPrice.create({
      cropName,
      variety,
      price,
      unit: unit || 'quintal',
      quantity,
      location,
      postedBy: req.user._id,
      postedByRole: 'dealer',
      contactInfo: contactInfo || {
        phone: req.user.phone,
        email: req.user.email,
      },
      qualityGrade,
      validUntil,
      imageUrl,
      description,
      status: 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Crop price posted successfully',
      cropPrice,
    });
  } catch (error) {
    console.error('Post price error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/dealer/prices
 * @desc    Get all prices posted by logged-in dealer
 * @access  Private (Approved Dealers only)
 */
router.get('/prices', protect, approvedDealer, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { postedBy: req.user._id };
    if (status) {
      query.status = status;
    }

    const prices = await CropPrice.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CropPrice.countDocuments(query);

    res.json({
      success: true,
      prices,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error('Get prices error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/dealer/prices/:id
 * @desc    Update a crop price
 * @access  Private (Approved Dealers only)
 */
router.put('/prices/:id', protect, approvedDealer, async (req, res) => {
  try {
    const cropPrice = await CropPrice.findById(req.params.id);

    if (!cropPrice) {
      return res.status(404).json({ message: 'Crop price not found' });
    }

    // Check if the dealer owns this price
    if (cropPrice.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'You can only update your own crop prices' 
      });
    }

    // Update fields
    const updateFields = [
      'cropName', 'variety', 'price', 'unit', 'quantity', 
      'location', 'contactInfo', 'qualityGrade', 'validUntil', 
      'imageUrl', 'description', 'status'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        cropPrice[field] = req.body[field];
      }
    });

    cropPrice.updatedAt = Date.now();
    await cropPrice.save();

    res.json({
      success: true,
      message: 'Crop price updated successfully',
      cropPrice,
    });
  } catch (error) {
    console.error('Update price error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   DELETE /api/dealer/prices/:id
 * @desc    Delete a crop price
 * @access  Private (Approved Dealers only)
 */
router.delete('/prices/:id', protect, approvedDealer, async (req, res) => {
  try {
    const cropPrice = await CropPrice.findById(req.params.id);

    if (!cropPrice) {
      return res.status(404).json({ message: 'Crop price not found' });
    }

    // Check ownership
    if (cropPrice.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'You can only delete your own crop prices' 
      });
    }

    // Soft delete - change status to deleted
    cropPrice.status = 'deleted';
    await cropPrice.save();

    res.json({
      success: true,
      message: 'Crop price deleted successfully',
    });
  } catch (error) {
    console.error('Delete price error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/dealer/bookings
 * @desc    Get all bookings for logged-in dealer
 * @access  Private (Approved Dealers only)
 */
router.get('/bookings', protect, approvedDealer, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { dealer: req.user._id };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('farmer', 'name phone email location')
      .populate('cropPrice', 'cropName variety price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/dealer/bookings/:id/status
 * @desc    Update booking status
 * @access  Private (Approved Dealers only)
 */
router.put('/bookings/:id/status', protect, approvedDealer, async (req, res) => {
  try {
    const { status, notes } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if dealer owns this booking
    if (booking.dealer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'You can only update your own bookings' 
      });
    }

    // Validate status
    const validStatuses = ['confirmed', 'in-progress', 'completed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Valid statuses: ' + validStatuses.join(', ')
      });
    }

    // Update status
    await booking.updateStatus(status, req.user._id, notes);

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      booking,
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/dealer/dashboard
 * @desc    Get dealer dashboard statistics
 * @access  Private (Approved Dealers only)
 */
router.get('/dashboard', protect, approvedDealer, async (req, res) => {
  try {
    // Get statistics
    const [
      totalPrices,
      activePrices,
      totalBookings,
      pendingBookings,
      completedBookings,
      totalProducts,
      activeProducts,
      lowStockProducts,
      totalBuyingRates,
      activeBuyingRates,
      recentPrices,
      recentBookings
    ] = await Promise.all([
      CropPrice.countDocuments({ postedBy: req.user._id }),
      CropPrice.countDocuments({ postedBy: req.user._id, status: 'active' }),
      Booking.countDocuments({ dealer: req.user._id }),
      Booking.countDocuments({ dealer: req.user._id, status: 'pending' }),
      Booking.countDocuments({ dealer: req.user._id, status: 'completed' }),
      DealerProduct.countDocuments({ dealer: req.user._id }),
      DealerProduct.countDocuments({ dealer: req.user._id, status: 'active' }),
      DealerProduct.countDocuments({ 
        dealer: req.user._id, 
        status: 'active',
        $expr: { $lte: ['$stock.quantity', '$stock.lowStockThreshold'] }
      }),
      BuyingRate.countDocuments({ dealer: req.user._id }),
      BuyingRate.countDocuments({ dealer: req.user._id, status: 'active', validUntil: { $gt: new Date() } }),
      CropPrice.find({ postedBy: req.user._id })
        .sort({ createdAt: -1 })
        .limit(5),
      Booking.find({ dealer: req.user._id })
        .populate('farmer', 'name phone')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    res.json({
      success: true,
      statistics: {
        totalPrices,
        activePrices,
        totalBookings,
        pendingBookings,
        completedBookings,
        totalProducts,
        activeProducts,
        lowStockProducts,
        totalBuyingRates,
        activeBuyingRates,
      },
      recentPrices,
      recentBookings,
    });
  } catch (error) {
    console.error('Dealer dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ==================== PRODUCT MANAGEMENT ROUTES ====================

/**
 * @route   POST /api/dealer/products
 * @desc    Create a new product
 * @access  Private (Approved Dealers only)
 */
router.post('/products', protect, approvedDealer, async (req, res) => {
  try {
    const productData = {
      ...req.body,
      dealer: req.user._id,
      location: req.body.location || {
        state: req.user.dealerInfo?.location?.state,
        district: req.user.dealerInfo?.location?.district,
      },
    };

    const product = await DealerProduct.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

/**
 * @route   GET /api/dealer/products
 * @desc    Get all products for logged-in dealer
 * @access  Private (Approved Dealers only)
 */
router.get('/products', protect, approvedDealer, async (req, res) => {
  try {
    const { 
      status, 
      category, 
      availability,
      search,
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = { dealer: req.user._id };
    
    if (status && status !== 'all') {
      query.status = status;
    } else {
      query.status = { $ne: 'deleted' };
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (availability && availability !== 'all') {
      query.availability = availability;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort
    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const products = await DealerProduct.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DealerProduct.countDocuments(query);

    // Get category counts
    const categoryCounts = await DealerProduct.aggregate([
      { $match: { dealer: req.user._id, status: { $ne: 'deleted' } } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      categoryCounts,
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

/**
 * @route   GET /api/dealer/products/:id
 * @desc    Get single product by ID
 * @access  Private (Approved Dealers only)
 */
router.get('/products/:id', protect, approvedDealer, async (req, res) => {
  try {
    const product = await DealerProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    // Check ownership
    if (product.dealer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to access this product' 
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

/**
 * @route   PUT /api/dealer/products/:id
 * @desc    Update a product
 * @access  Private (Approved Dealers only)
 */
router.put('/products/:id', protect, approvedDealer, async (req, res) => {
  try {
    let product = await DealerProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    // Check ownership
    if (product.dealer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this product' 
      });
    }

    // Update product
    Object.keys(req.body).forEach(key => {
      if (key !== 'dealer' && key !== '_id') {
        product[key] = req.body[key];
      }
    });

    // Update availability based on stock
    if (req.body.stock?.quantity !== undefined) {
      if (product.stock.quantity === 0) {
        product.availability = 'out-of-stock';
      } else if (product.isLowStock()) {
        product.availability = 'limited';
      } else {
        product.availability = 'in-stock';
      }
    }

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

/**
 * @route   DELETE /api/dealer/products/:id
 * @desc    Delete (soft delete) a product
 * @access  Private (Approved Dealers only)
 */
router.delete('/products/:id', protect, approvedDealer, async (req, res) => {
  try {
    const product = await DealerProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    // Check ownership
    if (product.dealer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this product' 
      });
    }

    // Soft delete
    product.status = 'deleted';
    await product.save();

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

/**
 * @route   PUT /api/dealer/products/:id/stock
 * @desc    Update product stock
 * @access  Private (Approved Dealers only)
 */
router.put('/products/:id/stock', protect, approvedDealer, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ 
        success: false,
        message: 'Quantity is required' 
      });
    }

    const product = await DealerProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    // Check ownership
    if (product.dealer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this product' 
      });
    }

    // Update stock using the model method
    await product.updateStock(quantity);

    res.json({
      success: true,
      message: 'Stock updated successfully',
      product,
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

/**
 * @route   GET /api/dealer/products/low-stock
 * @desc    Get products with low stock
 * @access  Private (Approved Dealers only)
 */
router.get('/products-low-stock', protect, approvedDealer, async (req, res) => {
  try {
    const products = await DealerProduct.find({
      dealer: req.user._id,
      status: 'active',
      $expr: { $lte: ['$stock.quantity', '$stock.lowStockThreshold'] }
    }).sort({ 'stock.quantity': 1 });

    res.json({
      success: true,
      products,
      count: products.length,
    });
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

export default router;
