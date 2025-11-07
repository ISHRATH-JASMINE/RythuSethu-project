import mongoose from 'mongoose';

const dealerProductSchema = new mongoose.Schema({
  dealer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['fertilizer', 'seeds', 'pesticide', 'organic-manure', 'growth-promoter', 'farm-tools'],
  },
  subCategory: {
    type: String,
    trim: true,
  },
  brand: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'gram', 'liter', 'ml', 'piece', 'packet', 'bag', 'bottle', 'box'],
    default: 'piece',
  },
  stock: {
    quantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
  },
  specifications: {
    weight: String,
    size: String,
    composition: String,
    npkRatio: String, // For fertilizers (e.g., "10-26-26")
    activeIngredient: String, // For pesticides
    seedVariety: String, // For seeds
    cropSuitability: [String], // Which crops this product is suitable for
  },
  images: [{
    type: String,
  }],
  location: {
    state: String,
    district: String,
    address: String,
  },
  availability: {
    type: String,
    enum: ['in-stock', 'out-of-stock', 'limited', 'discontinued'],
    default: 'in-stock',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  discount: {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    validUntil: Date,
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  views: {
    type: Number,
    default: 0,
  },
  inquiries: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'deleted'],
    default: 'active',
  },
  isVerified: {
    type: Boolean,
    default: false,
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

// Indexes for better query performance
dealerProductSchema.index({ dealer: 1, status: 1 });
dealerProductSchema.index({ category: 1, status: 1 });
dealerProductSchema.index({ name: 'text', description: 'text' });

// Middleware to update updatedAt before save
dealerProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for discounted price
dealerProductSchema.virtual('discountedPrice').get(function() {
  if (this.discount.percentage > 0 && this.discount.validUntil > Date.now()) {
    return this.price * (1 - this.discount.percentage / 100);
  }
  return this.price;
});

// Method to check if stock is low
dealerProductSchema.methods.isLowStock = function() {
  return this.stock.quantity <= this.stock.lowStockThreshold;
};

// Method to update stock
dealerProductSchema.methods.updateStock = function(quantity) {
  this.stock.quantity = Math.max(0, this.stock.quantity + quantity);
  
  // Update availability based on stock
  if (this.stock.quantity === 0) {
    this.availability = 'out-of-stock';
  } else if (this.isLowStock()) {
    this.availability = 'limited';
  } else {
    this.availability = 'in-stock';
  }
  
  return this.save();
};

export default mongoose.model('DealerProduct', dealerProductSchema);
