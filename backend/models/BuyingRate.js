import mongoose from 'mongoose';

const buyingRateSchema = new mongoose.Schema({
  dealer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  dealerName: {
    type: String,
    required: true
  },
  cropName: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  buyPricePerKg: {
    type: Number,
    required: true,
    min: 0
  },
  buyPricePerQuintal: {
    type: Number,
    // Auto-calculated: price per kg * 100
  },
  availableFrom: {
    type: String, // Time in HH:MM format
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'availableFrom must be in HH:MM format'
    }
  },
  availableTill: {
    type: String, // Time in HH:MM format
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'availableTill must be in HH:MM format'
    }
  },
  location: {
    state: String,
    district: {
      type: String,
      required: true
    },
    address: String,
    pincode: String
  },
  minimumQuantity: {
    type: Number,
    default: 0
  },
  maximumQuantity: Number,
  qualityRequirements: String,
  paymentTerms: {
    type: String,
    enum: ['immediate', 'within-24-hours', 'within-week', 'negotiable'],
    default: 'immediate'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  },
  validUntil: {
    type: Date,
    default: function() {
      // Default to 30 days from now
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  views: {
    type: Number,
    default: 0
  },
  inquiries: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
buyingRateSchema.index({ dealer: 1, status: 1 });
buyingRateSchema.index({ cropName: 1, 'location.district': 1, status: 1 });
buyingRateSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate buyPricePerQuintal
buyingRateSchema.pre('save', function(next) {
  if (this.buyPricePerKg) {
    this.buyPricePerQuintal = this.buyPricePerKg * 100;
  }
  next();
});

// Instance method to check if currently available
buyingRateSchema.methods.isCurrentlyAvailable = function() {
  if (this.status !== 'active') return false;
  if (this.validUntil && new Date() > this.validUntil) return false;
  
  if (this.availableFrom && this.availableTill) {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    return currentTime >= this.availableFrom && currentTime <= this.availableTill;
  }
  
  return true;
};

// Instance method to check if expired
buyingRateSchema.methods.isExpired = function() {
  return this.validUntil && new Date() > this.validUntil;
};

// Instance method to increment views
buyingRateSchema.methods.incrementViews = async function() {
  this.views += 1;
  return await this.save();
};

// Instance method to increment inquiries
buyingRateSchema.methods.incrementInquiries = async function() {
  this.inquiries += 1;
  return await this.save();
};

// Static method to get active rates
buyingRateSchema.statics.getActiveRates = async function(filters = {}) {
  const query = {
    status: 'active',
    validUntil: { $gt: new Date() }
  };
  
  if (filters.cropName) {
    query.cropName = new RegExp(filters.cropName, 'i');
  }
  
  if (filters.district) {
    query['location.district'] = new RegExp(filters.district, 'i');
  }
  
  return await this.find(query)
    .populate('dealer', 'name phone email dealerInfo')
    .sort({ buyPricePerKg: -1, createdAt: -1 });
};

const BuyingRate = mongoose.model('BuyingRate', buyingRateSchema);

export default BuyingRate;
