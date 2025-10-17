import mongoose from 'mongoose';

const coldStorageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Cold Storage', 'Mandi', 'Warehouse', 'Processing Unit'],
    default: 'Cold Storage'
  },
  address: {
    street: String,
    village: String,
    mandal: String,
    district: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: '2dsphere' // Geospatial index for location queries
    }
  },
  contact: {
    phone: String,
    email: String,
    manager: String
  },
  facilities: {
    capacity: {
      value: Number,
      unit: {
        type: String,
        enum: ['MT', 'Tonnes', 'Quintal', 'Bags'],
        default: 'MT'
      }
    },
    temperature: {
      min: Number,
      max: Number
    },
    chambers: Number,
    storageType: [String] // ['Vegetables', 'Fruits', 'Grains', 'Seeds']
  },
  services: {
    grading: { type: Boolean, default: false },
    packaging: { type: Boolean, default: false },
    transport: { type: Boolean, default: false },
    auction: { type: Boolean, default: false }
  },
  pricing: {
    dailyRate: Number,
    monthlyRate: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  },
  operatingHours: {
    open: String,
    close: String,
    workingDays: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  governmentApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster pincode searches
coldStorageSchema.index({ 'address.pincode': 1 });
coldStorageSchema.index({ 'address.district': 1 });
coldStorageSchema.index({ 'address.state': 1 });
coldStorageSchema.index({ type: 1 });

// Virtual for display address
coldStorageSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  return `${addr.village ? addr.village + ', ' : ''}${addr.mandal ? addr.mandal + ', ' : ''}${addr.district}, ${addr.state} - ${addr.pincode}`;
});

// Method to calculate distance from a point (in kilometers)
coldStorageSchema.methods.distanceFrom = function(lat, lng) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat - this.location.coordinates[1]) * Math.PI / 180;
  const dLon = (lng - this.location.coordinates[0]) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.location.coordinates[1] * Math.PI / 180) * 
    Math.cos(lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const ColdStorage = mongoose.model('ColdStorage', coldStorageSchema);

export default ColdStorage;
