// Dummy ML-based price prediction service
// In production, replace this with actual ML model API calls

export class PricePredictionService {
  constructor() {
    // Historical data for different crops (dummy data)
    this.historicalData = {
      'Rice': { basePrice: 2500, volatility: 0.15, trend: 'upward' },
      'Wheat': { basePrice: 2200, volatility: 0.12, trend: 'stable' },
      'Cotton': { basePrice: 5500, volatility: 0.20, trend: 'upward' },
      'Sugarcane': { basePrice: 3000, volatility: 0.10, trend: 'downward' },
      'Maize': { basePrice: 1800, volatility: 0.18, trend: 'upward' },
      'Tomato': { basePrice: 25, volatility: 0.35, trend: 'volatile' },
      'Onion': { basePrice: 30, volatility: 0.40, trend: 'volatile' },
      'Potato': { basePrice: 20, volatility: 0.25, trend: 'stable' },
    };

    // Season impact factors
    this.seasonImpact = {
      'Kharif': { multiplier: 1.1, demand: 'high' },
      'Rabi': { multiplier: 1.05, demand: 'medium' },
      'Summer': { multiplier: 0.95, demand: 'low' },
    };

    // Weather impact on prices
    this.weatherImpact = {
      'drought': { priceChange: 0.25, message: 'Low supply expected due to drought' },
      'excess_rain': { priceChange: -0.15, message: 'Quality concerns due to excess rainfall' },
      'optimal': { priceChange: 0.05, message: 'Favorable weather conditions' },
      'heatwave': { priceChange: 0.10, message: 'Heat stress affecting yield' },
    };
  }

  // Main prediction function
  async predictPrice(crop, currentPrice, location, weatherCondition = 'optimal', season = 'Kharif') {
    const cropData = this.historicalData[crop] || this.historicalData['Rice'];
    
    // Calculate base predicted price using multiple factors
    let predictedPrice = currentPrice;
    let confidence = 75; // Base confidence

    // 1. Trend Analysis
    const trendImpact = this.calculateTrendImpact(cropData.trend);
    predictedPrice *= (1 + trendImpact);

    // 2. Seasonal Impact
    const seasonalImpact = this.seasonImpact[season] || this.seasonImpact['Kharif'];
    predictedPrice *= seasonalImpact.multiplier;
    
    // 3. Weather Impact
    const weatherEffect = this.weatherImpact[weatherCondition] || this.weatherImpact['optimal'];
    predictedPrice *= (1 + weatherEffect.priceChange);

    // 4. Market Volatility
    const volatilityFactor = this.calculateVolatility(cropData.volatility);
    predictedPrice *= (1 + volatilityFactor);

    // 5. Demand-Supply Balance
    const demandImpact = this.calculateDemandImpact(seasonalImpact.demand);
    predictedPrice *= (1 + demandImpact);

    // Calculate price change percentage
    const priceChange = ((predictedPrice - currentPrice) / currentPrice) * 100;

    // Adjust confidence based on volatility
    confidence -= cropData.volatility * 100;
    confidence = Math.max(60, Math.min(95, confidence));

    // Generate recommendation
    const recommendation = this.generateRecommendation(priceChange, confidence, crop);

    // Compile analysis factors
    const factors = {
      weatherImpact: weatherEffect.message,
      demandTrend: `${seasonalImpact.demand.toUpperCase()} demand expected`,
      seasonalPattern: `${season} season - ${seasonalImpact.multiplier >= 1 ? 'favorable' : 'moderate'} pricing`,
      marketCondition: `Trend: ${cropData.trend.toUpperCase()} | Volatility: ${(cropData.volatility * 100).toFixed(0)}%`,
    };

    return {
      currentPrice: Math.round(currentPrice),
      predictedPrice: Math.round(predictedPrice),
      priceChange: parseFloat(priceChange.toFixed(2)),
      confidence: Math.round(confidence),
      recommendation,
      factors,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };
  }

  calculateTrendImpact(trend) {
    const impacts = {
      'upward': 0.08,
      'stable': 0.02,
      'downward': -0.05,
      'volatile': Math.random() * 0.1 - 0.05,
    };
    return impacts[trend] || 0;
  }

  calculateVolatility(volatility) {
    // Random walk within volatility range
    return (Math.random() - 0.5) * volatility * 2;
  }

  calculateDemandImpact(demand) {
    const impacts = {
      'high': 0.12,
      'medium': 0.05,
      'low': -0.08,
    };
    return impacts[demand] || 0;
  }

  generateRecommendation(priceChange, confidence, crop) {
    let action, message, daysToWait;

    if (priceChange >= 10 && confidence >= 70) {
      action = 'hold';
      daysToWait = Math.ceil(Math.random() * 5) + 3; // 3-7 days
      message = `🎯 Hold for ${daysToWait} days — Expected price increase of +${priceChange.toFixed(1)}%`;
    } else if (priceChange >= 5 && confidence >= 65) {
      action = 'hold';
      daysToWait = Math.ceil(Math.random() * 3) + 2; // 2-4 days
      message = `📈 Consider holding for ${daysToWait} days — Moderate price increase expected (+${priceChange.toFixed(1)}%)`;
    } else if (priceChange <= -5) {
      action = 'sell_now';
      daysToWait = 0;
      message = `⚠️ Sell NOW — Price expected to drop by ${Math.abs(priceChange).toFixed(1)}%`;
    } else if (priceChange > 0 && priceChange < 5) {
      action = 'sell_now';
      daysToWait = 0;
      message = `✅ Good time to SELL — Current prices are favorable (+${priceChange.toFixed(1)}%)`;
    } else {
      action = 'wait';
      daysToWait = 7;
      message = `⏳ Monitor market — Prices stable, check again in a week`;
    }

    return { action, message, daysToWait };
  }

  // Generate historical price data for analysis
  async getHistoricalPrices(crop, days = 30) {
    const cropData = this.historicalData[crop] || this.historicalData['Rice'];
    const prices = [];
    const basePrice = cropData.basePrice;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate price with trend and volatility
      const trendFactor = 1 + (this.calculateTrendImpact(cropData.trend) * i / days);
      const randomFactor = 1 + (Math.random() - 0.5) * cropData.volatility;
      const price = basePrice * trendFactor * randomFactor;
      
      prices.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(price),
        volume: Math.floor(Math.random() * 1000) + 500,
      });
    }
    
    return prices;
  }

  // Get price forecast for next 7 days
  async getPriceForecast(crop, currentPrice, weatherCondition = 'optimal', season = 'Kharif') {
    const forecast = [];
    const cropData = this.historicalData[crop] || this.historicalData['Rice'];
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const trendImpact = this.calculateTrendImpact(cropData.trend);
      const dailyChange = (1 + trendImpact / 7) * (1 + (Math.random() - 0.5) * 0.05);
      currentPrice *= dailyChange;
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        predictedPrice: Math.round(currentPrice),
        confidence: Math.round(75 - (i * 2)), // Confidence decreases over time
      });
    }
    
    return forecast;
  }

  // Market sentiment analysis
  getMarketSentiment(priceChange, volume = 'medium') {
    if (priceChange > 10) return { sentiment: 'bullish', emoji: '📈', color: 'green' };
    if (priceChange > 5) return { sentiment: 'positive', emoji: '🟢', color: 'lightgreen' };
    if (priceChange > -5) return { sentiment: 'neutral', emoji: '➖', color: 'gray' };
    if (priceChange > -10) return { sentiment: 'negative', emoji: '🔴', color: 'orange' };
    return { sentiment: 'bearish', emoji: '📉', color: 'red' };
  }
}

export default new PricePredictionService();
