import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  dealer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true, // One rating per booking
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
  },
  review: {
    type: String,
    maxlength: [500, 'Review cannot be more than 500 characters'],
    trim: true,
  },
  // Moderation flags
  isModerated: {
    type: Boolean,
    default: false,
  },
  isFlagged: {
    type: Boolean,
    default: false,
  },
  flagReason: {
    type: String,
    enum: ['spam', 'inappropriate', 'duplicate-text', 'fake', null],
    default: null,
  },
  // Duplicate detection
  reviewHash: {
    type: String,
    index: true,
  },
  // IP tracking for rate limiting
  ipAddress: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to prevent multiple ratings from same farmer to same dealer
ratingSchema.index({ dealer: 1, farmer: 1, booking: 1 }, { unique: true });

// Index for dealer stats
ratingSchema.index({ dealer: 1, isModerated: 1 });

// Middleware to update updatedAt
ratingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check for duplicate review text
ratingSchema.statics.findSimilarReviews = async function(reviewHash, dealerId) {
  if (!reviewHash) return [];
  
  return this.find({
    reviewHash,
    dealer: dealerId,
    isFlagged: false,
  }).limit(5);
};

// Method to calculate dealer's average rating
ratingSchema.statics.calculateDealerRating = async function(dealerId) {
  const result = await this.aggregate([
    { 
      $match: { 
        dealer: new mongoose.Types.ObjectId(dealerId),
        isFlagged: false // Exclude flagged ratings
      } 
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (result.length === 0) {
    return {
      averageRating: 0,
      totalRatings: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  // Calculate distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  result[0].ratingDistribution.forEach(rating => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });

  return {
    averageRating: Math.round(result[0].averageRating * 10) / 10, // Round to 1 decimal
    totalRatings: result[0].totalRatings,
    distribution
  };
};

// Method to check rate limiting (max 5 ratings per IP per day)
ratingSchema.statics.checkRateLimit = async function(ipAddress) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const count = await this.countDocuments({
    ipAddress,
    createdAt: { $gte: oneDayAgo }
  });

  return count < 5; // Allow up to 5 ratings per day
};

export default mongoose.model('Rating', ratingSchema);
