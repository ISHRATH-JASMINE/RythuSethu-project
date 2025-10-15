import mongoose from 'mongoose';

const priceHistorySchema = new mongoose.Schema({
  crop: {
    type: String,
    required: true,
    index: true,
  },
  price: {
    type: Number,
    required: true,
  },
  market: {
    state: String,
    district: String,
    mandi: String,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  quantity: {
    type: Number,
  },
  quality: {
    type: String,
    enum: ['premium', 'standard', 'low'],
    default: 'standard',
  },
  weatherConditions: {
    temperature: Number,
    rainfall: Number,
    humidity: Number,
  },
  demand: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
priceHistorySchema.index({ crop: 1, date: -1 });
priceHistorySchema.index({ 'market.state': 1, crop: 1 });

export default mongoose.model('PriceHistory', priceHistorySchema);
