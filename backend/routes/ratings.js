import express from 'express';
import crypto from 'crypto';
import Rating from '../models/Rating.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Helper function to create review hash for duplicate detection
const createReviewHash = (text) => {
  if (!text) return null;
  // Normalize text and create hash
  const normalized = text.toLowerCase().trim().replace(/\s+/g, ' ');
  return crypto.createHash('md5').update(normalized).digest('hex');
};

/**
 * @route   POST /api/ratings
 * @desc    Create a rating for a dealer (linked to a completed booking)
 * @access  Private (Farmer only)
 */
router.post('/', protect, authorize('farmer'), async (req, res) => {
  try {
    const { bookingId, rating, review } = req.body;

    // Validate input
    if (!bookingId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and rating are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Get client IP for rate limiting
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Check rate limit
    const canRate = await Rating.checkRateLimit(ipAddress);
    if (!canRate) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. You can only submit 5 ratings per day.'
      });
    }

    // Find booking
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify booking belongs to the farmer
    if (booking.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only rate your own bookings'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only rate completed bookings'
      });
    }

    // Check if rating already exists for this booking
    const existingRating = await Rating.findOne({ booking: bookingId });
    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this booking'
      });
    }

    // Create review hash for duplicate detection
    const reviewHash = review ? createReviewHash(review) : null;
    let isFlagged = false;
    let flagReason = null;

    // Check for duplicate review text
    if (reviewHash) {
      const similarReviews = await Rating.findSimilarReviews(reviewHash, booking.dealer);
      if (similarReviews.length >= 2) {
        isFlagged = true;
        flagReason = 'duplicate-text';
      }
    }

    // Create rating
    const newRating = await Rating.create({
      dealer: booking.dealer,
      farmer: req.user._id,
      booking: bookingId,
      rating,
      review: review || '',
      reviewHash,
      isFlagged,
      flagReason,
      ipAddress,
    });

    // Update dealer's rating stats
    const dealerRatingStats = await Rating.calculateDealerRating(booking.dealer);
    
    // Update dealer's rating in User model
    await User.findByIdAndUpdate(booking.dealer, {
      'dealerInfo.rating': dealerRatingStats.averageRating,
      'dealerInfo.totalRatings': dealerRatingStats.totalRatings,
    });

    const populatedRating = await Rating.findById(newRating._id)
      .populate('farmer', 'name')
      .populate('dealer', 'name');

    res.status(201).json({
      success: true,
      message: isFlagged 
        ? 'Rating submitted successfully but flagged for moderation'
        : 'Rating submitted successfully',
      rating: populatedRating,
      dealerStats: dealerRatingStats,
    });
  } catch (error) {
    console.error('Create rating error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this booking'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/ratings/dealer/:dealerId
 * @desc    Get all ratings for a dealer
 * @access  Public
 */
router.get('/dealer/:dealerId', async (req, res) => {
  try {
    const { page = 1, limit = 10, includeReviews = 'true' } = req.query;

    const query = {
      dealer: req.params.dealerId,
      isFlagged: false, // Only show non-flagged ratings
    };

    const ratings = await Rating.find(query)
      .populate('farmer', 'name')
      .select(includeReviews === 'true' ? '' : '-review')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Rating.countDocuments(query);

    // Get rating statistics
    const stats = await Rating.calculateDealerRating(req.params.dealerId);

    res.json({
      success: true,
      ratings,
      stats,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error('Get dealer ratings error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/ratings/dealer/:dealerId/stats
 * @desc    Get rating statistics for a dealer
 * @access  Public
 */
router.get('/dealer/:dealerId/stats', async (req, res) => {
  try {
    const stats = await Rating.calculateDealerRating(req.params.dealerId);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Get dealer rating stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/ratings/my-ratings
 * @desc    Get ratings given by the logged-in farmer
 * @access  Private (Farmer only)
 */
router.get('/my-ratings', protect, authorize('farmer'), async (req, res) => {
  try {
    const ratings = await Rating.find({ farmer: req.user._id })
      .populate('dealer', 'name dealerInfo')
      .populate('booking', 'status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      ratings,
      total: ratings.length,
    });
  } catch (error) {
    console.error('Get my ratings error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/ratings/booking/:bookingId/check
 * @desc    Check if a booking has been rated
 * @access  Private
 */
router.get('/booking/:bookingId/check', protect, async (req, res) => {
  try {
    const rating = await Rating.findOne({ booking: req.params.bookingId });

    res.json({
      success: true,
      hasRating: !!rating,
      rating: rating || null,
    });
  } catch (error) {
    console.error('Check booking rating error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/ratings/:id
 * @desc    Update a rating (only review text, not the rating value)
 * @access  Private (Farmer only - own ratings)
 */
router.put('/:id', protect, authorize('farmer'), async (req, res) => {
  try {
    const { review } = req.body;

    const rating = await Rating.findById(req.params.id);

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    // Check ownership
    if (rating.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own ratings'
      });
    }

    // Update review
    rating.review = review;
    rating.reviewHash = createReviewHash(review);

    // Re-check for duplicates
    if (rating.reviewHash) {
      const similarReviews = await Rating.findSimilarReviews(rating.reviewHash, rating.dealer);
      if (similarReviews.length >= 2) {
        rating.isFlagged = true;
        rating.flagReason = 'duplicate-text';
      }
    }

    await rating.save();

    res.json({
      success: true,
      message: 'Review updated successfully',
      rating,
    });
  } catch (error) {
    console.error('Update rating error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   DELETE /api/ratings/:id
 * @desc    Delete a rating
 * @access  Private (Farmer only - own ratings)
 */
router.delete('/:id', protect, authorize('farmer'), async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    // Check ownership
    if (rating.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own ratings'
      });
    }

    const dealerId = rating.dealer;

    await rating.deleteOne();

    // Recalculate dealer's rating
    const dealerRatingStats = await Rating.calculateDealerRating(dealerId);
    await User.findByIdAndUpdate(dealerId, {
      'dealerInfo.rating': dealerRatingStats.averageRating,
      'dealerInfo.totalRatings': dealerRatingStats.totalRatings,
    });

    res.json({
      success: true,
      message: 'Rating deleted successfully',
    });
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
