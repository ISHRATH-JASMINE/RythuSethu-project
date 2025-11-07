import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  role: {
    type: String,
    enum: ['farmer', 'dealer', 'admin'],
    default: 'farmer',
    required: true,
  },
  // Dealer-specific fields
  dealerInfo: {
    businessName: String,
    businessAddress: String,
    gstNumber: String,
    licenseNumber: String,
    specialization: [String], // e.g., ['Vegetables', 'Fruits', 'Grains']
    approved: {
      type: Boolean,
      default: false, // Dealers need admin approval
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    rejectionReason: String,
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  },
  // Farmer-specific fields
  farmerInfo: {
    farmSize: Number, // in acres
    farmLocation: {
      latitude: Number,
      longitude: Number,
    },
    crops: [String],
  },
  location: {
    state: String,
    district: String,
    village: String,
    pincode: String,
  },
  language: {
    type: String,
    enum: ['en', 'te', 'hi'],
    default: 'en',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  fcmToken: {
    type: String,
  },
  profileImage: {
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

// Update the updatedAt field on save
userSchema.pre('save', async function (next) {
  this.updatedAt = Date.now();
  
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if dealer is approved
userSchema.methods.isDealerApproved = function () {
  return this.role === 'dealer' && this.dealerInfo?.approved === true;
};

// Method to get safe user data (without password)
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
