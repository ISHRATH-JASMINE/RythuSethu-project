import mongoose from 'mongoose';

/**
 * Booking Model
 * Manages appointments between farmers and dealers
 */
const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farmer reference is required'],
  },
  farmerName: {
    type: String,
    required: true,
  },
  dealer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Dealer reference is required'],
  },
  dealerName: {
    type: String,
    required: true,
  },
  cropName: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  timeSlot: {
    type: String,
    enum: ['Morning', 'Afternoon', 'Evening'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  notes: {
    type: String,
  },
  farmerNotes: {
    type: String,
  },
  dealerNotes: {
    type: String,
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
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  cancelledAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  // Legacy fields for backward compatibility
  cropPrice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CropPrice',
  },
  cropDetails: {
    name: String,
    variety: String,
    quantity: Number,
    unit: String,
    agreedPrice: Number,
    pricePerUnit: String,
    totalAmount: Number,
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
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'completed', 'refunded'],
  },
  paymentDetails: {
    method: String,
    transactionId: String,
    paidAmount: Number,
    paidAt: Date,
  },
  rating: {
    farmerRating: {
      stars: Number,
      review: String,
      ratedAt: Date,
    },
    dealerRating: {
      stars: Number,
      review: String,
      ratedAt: Date,
    },
  },
  completedAt: Date,
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

// Indexes for faster queries and duplicate prevention
bookingSchema.index({ farmer: 1, createdAt: -1 });
bookingSchema.index({ dealer: 1, createdAt: -1 });
bookingSchema.index({ dealer: 1, date: 1, timeSlot: 1 }); // For duplicate checking
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
