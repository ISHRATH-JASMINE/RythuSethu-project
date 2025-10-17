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

// Update the updatedAt field on save
cropPriceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
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
