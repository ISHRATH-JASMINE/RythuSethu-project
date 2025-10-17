import mongoose from 'mongoose';

/**
 * Booking Model
 * Manages bookings between farmers and dealers
 */
const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farmer reference is required'],
  },
  dealer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Dealer reference is required'],
  },
  cropPrice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CropPrice',
  },
  cropDetails: {
    name: {
      type: String,
      required: true,
    },
    variety: String,
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity must be positive'],
    },
    unit: {
      type: String,
      enum: ['kg', 'quintal', 'ton', 'piece'],
      default: 'quintal',
    },
    agreedPrice: {
      type: Number,
      required: true,
    },
    pricePerUnit: String,
    totalAmount: {
      type: Number,
      required: true,
    },
  },
  pickupDetails: {
    address: String,
    location: {
      latitude: Number,
      longitude: Number,
    },
    preferredDate: Date,
    preferredTime: String,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending',
  },
  farmerNotes: {
    type: String,
    maxlength: 500,
  },
  dealerNotes: {
    type: String,
    maxlength: 500,
  },
  statusHistory: [{
    status: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    notes: String,
  }],
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'completed', 'refunded'],
    default: 'pending',
  },
  paymentDetails: {
    method: {
      type: String,
      enum: ['cash', 'upi', 'bank_transfer', 'cheque'],
    },
    transactionId: String,
    paidAmount: Number,
    paidAt: Date,
  },
  rating: {
    farmerRating: {
      stars: {
        type: Number,
        min: 1,
        max: 5,
      },
      review: String,
      ratedAt: Date,
    },
    dealerRating: {
      stars: {
        type: Number,
        min: 1,
        max: 5,
      },
      review: String,
      ratedAt: Date,
    },
  },
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  cancelledAt: Date,
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate unique booking ID
bookingSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();
  
  if (this.isNew && !this.bookingId) {
    // Generate booking ID: BK-YYYYMMDD-XXXX
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    this.bookingId = `BK-${dateStr}-${random}`;
  }
  
  next();
});

// Indexes for faster queries
// Note: bookingId already has unique index from schema definition
bookingSchema.index({ farmer: 1, createdAt: -1 });
bookingSchema.index({ dealer: 1, createdAt: -1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });

// Method to update status
bookingSchema.methods.updateStatus = function(newStatus, updatedBy, notes = '') {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    updatedBy,
    updatedAt: new Date(),
    notes,
  });
  
  if (newStatus === 'completed') {
    this.completedAt = new Date();
  } else if (newStatus === 'cancelled' || newStatus === 'rejected') {
    this.cancelledAt = new Date();
    this.cancelledBy = updatedBy;
  }
  
  return this.save();
};

// Method to add farmer rating
bookingSchema.methods.addFarmerRating = function(stars, review) {
  this.rating.farmerRating = {
    stars,
    review,
    ratedAt: new Date(),
  };
  return this.save();
};

// Method to add dealer rating
bookingSchema.methods.addDealerRating = function(stars, review) {
  this.rating.dealerRating = {
    stars,
    review,
    ratedAt: new Date(),
  };
  return this.save();
};

export default mongoose.model('Booking', bookingSchema);
