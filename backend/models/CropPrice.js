import mongoose from 'mongoose';

/**
 * CropPrice Model
 * Stores crop pricing information posted by dealers or admins
 */
const cropPriceSchema = new mongoose.Schema({
  cropName: {
    type: String,
    required: [true, 'Crop name is required'],
    trim: true,
  },
  variety: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  pricePerQuintal: {
    type: Number,
    min: [0, 'Price cannot be negative'],
  },
  pricePerKg: {
    type: Number,
    min: [0, 'Price cannot be negative'],
  },
  unit: {
    type: String,
    enum: ['kg', 'quintal', 'ton', 'piece'],
    default: 'quintal',
    required: true,
  },
  quantity: {
    available: {
      type: Number,
      default: 0,
    },
    unit: String,
  },
  stockAvailable: {
    type: Number,
    default: 0,
  },
  dealerName: {
    type: String,
  },
  previousPrice: {
    type: Number,
    default: null,
  },
  priceChange: {
    type: Number,
    default: 0,
  },
  trend: {
    type: String,
    enum: ['up', 'down', 'stable'],
    default: 'stable',
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  location: {
    state: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    market: String,
    pincode: String,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  postedByRole: {
    type: String,
    enum: ['dealer', 'admin'],
    required: true,
  },
  contactInfo: {
    phone: String,
    email: String,
    whatsapp: String,
  },
  qualityGrade: {
    type: String,
    enum: ['A+', 'A', 'B', 'C'],
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'expired', 'deleted'],
    default: 'active',
  },
  validUntil: {
    type: Date,
    required: true,
    default: function() {
      // Default validity: 7 days from now
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    },
  },
  imageUrl: {
    type: String,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  views: {
    type: Number,
    default: 0,
  },
  inquiries: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false, // Admin can verify prices
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verifiedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
cropPriceSchema.index({ cropName: 1, status: 1 });
cropPriceSchema.index({ 'location.state': 1, 'location.district': 1 });
cropPriceSchema.index({ postedBy: 1 });
cropPriceSchema.index({ createdAt: -1 });
cropPriceSchema.index({ validUntil: 1 });

// Update the updatedAt field on save and calculate price conversions
cropPriceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.lastUpdated = Date.now();
  
  // Calculate price conversions
  if (this.unit === 'quintal' && this.price) {
    this.pricePerQuintal = this.price;
    this.pricePerKg = parseFloat((this.price / 100).toFixed(2));
  } else if (this.unit === 'kg' && this.price) {
    this.pricePerKg = this.price;
    this.pricePerQuintal = parseFloat((this.price * 100).toFixed(2));
  }
  
  // Set stockAvailable from quantity
  if (this.quantity && this.quantity.available) {
    this.stockAvailable = this.quantity.available;
  }
  
  // Calculate trend
  if (this.previousPrice && this.price) {
    this.priceChange = this.price - this.previousPrice;
    if (this.priceChange > 0) {
      this.trend = 'up';
    } else if (this.priceChange < 0) {
      this.trend = 'down';
    } else {
      this.trend = 'stable';
    }
  }
  
  next();
});

// Auto-expire prices
cropPriceSchema.methods.checkExpiry = function() {
  if (this.validUntil < new Date() && this.status === 'active') {
    this.status = 'expired';
    return this.save();
  }
  return Promise.resolve(this);
};

// Increment views
cropPriceSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Increment inquiries
cropPriceSchema.methods.incrementInquiries = function() {
  this.inquiries += 1;
  return this.save();
};

export default mongoose.model('CropPrice', cropPriceSchema);
