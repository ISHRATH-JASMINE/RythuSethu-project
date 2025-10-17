import express from 'express';
import Booking from '../models/Booking.js';
import CropPrice from '../models/CropPrice.js';
import User from '../models/User.js';
import { protect, farmer, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/farmer/bookings
 * @desc    Create a new booking
 * @access  Private (Farmers only)
 */
router.post('/bookings', protect, farmer, async (req, res) => {
  try {
    const {
      dealerId,
      cropPriceId,
      cropDetails,
      pickupDetails,
      farmerNotes
    } = req.body;

    // Validation
    if (!dealerId || !cropDetails?.name || !cropDetails?.quantity || !cropDetails?.agreedPrice) {
      return res.status(400).json({
        message: 'Please provide dealer, crop details (name, quantity, agreed price)'
      });
    }

    // Check if dealer exists and is approved
    const dealer = await User.findById(dealerId);
    if (!dealer || dealer.role !== 'dealer') {
      return res.status(404).json({ message: 'Dealer not found' });
    }

    if (!dealer.isDealerApproved()) {
      return res.status(400).json({ message: 'Dealer is not approved' });
    }

    // Check crop price if provided
    if (cropPriceId) {
      const cropPrice = await CropPrice.findById(cropPriceId);
      if (!cropPrice) {
        return res.status(404).json({ message: 'Crop price listing not found' });
      }
    }

    // Calculate total amount
    const totalAmount = cropDetails.quantity * cropDetails.agreedPrice;

    // Create booking
    const booking = await Booking.create({
      farmer: req.user._id,
      dealer: dealerId,
      cropPrice: cropPriceId,
      cropDetails: {
        ...cropDetails,
        totalAmount,
      },
      pickupDetails,
      farmerNotes,
      status: 'pending',
    });

    // Populate references
    await booking.populate([
      { path: 'farmer', select: 'name phone email location' },
      { path: 'dealer', select: 'name phone email dealerInfo.businessName' },
      { path: 'cropPrice', select: 'cropName variety price' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully. Waiting for dealer confirmation.',
      booking,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/farmer/bookings
 * @desc    Get all bookings for logged-in farmer
 * @access  Private (Farmers only)
 */
router.get('/bookings', protect, farmer, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { farmer: req.user._id };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('dealer', 'name phone email dealerInfo.businessName dealerInfo.specialization')
      .populate('cropPrice', 'cropName variety price location')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error('Get farmer bookings error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/farmer/bookings/:id
 * @desc    Get single booking details
 * @access  Private (Farmers only)
 */
router.get('/bookings/:id', protect, farmer, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('farmer', 'name phone email location')
      .populate('dealer', 'name phone email dealerInfo')
      .populate('cropPrice', 'cropName variety price location contactInfo');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if farmer owns this booking
    if (booking.farmer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Get booking details error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/farmer/bookings/:id/cancel
 * @desc    Cancel a booking
 * @access  Private (Farmers only)
 */
router.put('/bookings/:id/cancel', protect, farmer, async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check ownership
    if (booking.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if booking can be cancelled
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ 
        message: `Cannot cancel booking with status: ${booking.status}` 
      });
    }

    // Cancel booking
    booking.cancellationReason = cancellationReason || 'Cancelled by farmer';
    await booking.updateStatus('cancelled', req.user._id, cancellationReason);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking,
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/farmer/bookings/:id/rating
 * @desc    Rate a completed booking (farmer rates dealer)
 * @access  Private (Farmers only)
 */
router.put('/bookings/:id/rating', protect, farmer, async (req, res) => {
  try {
    const { stars, review } = req.body;

    // Validation
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ 
        message: 'Please provide a rating between 1 and 5 stars' 
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check ownership
    if (booking.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({ 
        message: 'Can only rate completed bookings' 
      });
    }

    // Check if already rated
    if (booking.rating.farmerRating?.stars) {
      return res.status(400).json({ 
        message: 'You have already rated this booking' 
      });
    }

    // Add rating
    await booking.addFarmerRating(stars, review);

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      booking,
    });
  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
