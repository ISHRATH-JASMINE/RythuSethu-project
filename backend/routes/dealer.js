import express from 'express';
import CropPrice from '../models/CropPrice.js';
import Booking from '../models/Booking.js';
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
      recentPrices,
      recentBookings
    ] = await Promise.all([
      CropPrice.countDocuments({ postedBy: req.user._id }),
      CropPrice.countDocuments({ postedBy: req.user._id, status: 'active' }),
      Booking.countDocuments({ dealer: req.user._id }),
      Booking.countDocuments({ dealer: req.user._id, status: 'pending' }),
      Booking.countDocuments({ dealer: req.user._id, status: 'completed' }),
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
      },
      recentPrices,
      recentBookings,
    });
  } catch (error) {
    console.error('Dealer dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
