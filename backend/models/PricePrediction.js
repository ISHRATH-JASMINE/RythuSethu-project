import mongoose from 'mongoose';

const pricePredictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  crop: {
    type: String,
    required: true,
  },
  currentPrice: {
    type: Number,
    required: true,
  },
  predictedPrice: {
    type: Number,
    required: true,
  },
  priceChange: {
    type: Number, // percentage
    required: true,
  },
  confidence: {
    type: Number, // 0-100
    required: true,
  },
  recommendation: {
    action: {
      type: String,
      enum: ['sell_now', 'hold', 'wait'],
      required: true,
    },
    message: String,
    daysToWait: Number,
  },
  factors: {
    weatherImpact: String,
    demandTrend: String,
    seasonalPattern: String,
    marketCondition: String,
  },
  location: {
    state: String,
    district: String,
  },
  validUntil: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('PricePrediction', pricePredictionSchema);
