import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/translations';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { FaChartLine, FaSeedling, FaCloudSun, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PriceAnalytics = () => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [crops, setCrops] = useState([]);
  const [formData, setFormData] = useState({
    crop: '',
    currentPrice: '',
    location: '',
    weatherCondition: 'optimal',
    season: 'kharif',
  });
  const [prediction, setPrediction] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      const response = await api.get('/price-analytics/crops');
      setCrops(response.data.crops || []);
    } catch (error) {
      console.error('Error fetching crops:', error);
      // Set default crops if API fails
      setCrops(['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Tomato', 'Onion', 'Potato']);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Get prediction
      const predictionRes = await api.post('/price-analytics/predict', formData);
      setPrediction(predictionRes.data);

      // Get historical data
      if (formData.crop) {
        const historyRes = await api.get(`/price-analytics/history/${formData.crop}`);
        setHistoricalData(historyRes.data.data || []);

        // Get forecast
        const forecastRes = await api.post('/price-analytics/forecast', {
          crop: formData.crop,
          currentPrice: formData.currentPrice,
        });
        setForecast(forecastRes.data.forecast || []);
      }

      toast.success('Price prediction generated successfully!');
    } catch (error) {
      console.error('Error generating prediction:', error);
      toast.error(error.response?.data?.message || 'Failed to generate prediction');
      // Reset data on error
      setHistoricalData([]);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'sell_now':
        return 'text-red-600 bg-red-50';
      case 'hold':
        return 'text-yellow-600 bg-yellow-50';
      case 'wait':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FaChartLine className="text-green-600" />
          {t('priceAnalytics', language)}
        </h1>
        <p className="text-gray-600 mt-2">{t('predictPricesDesc', language)}</p>
      </div>

      {/* Prediction Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">{t('getPrediction', language)}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">
              <FaSeedling className="inline mr-2" />
              {t('selectCrop', language)}
            </label>
            <select
              name="crop"
              value={formData.crop}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">{t('selectCrop', language)}</option>
              {crops && crops.length > 0 && crops.map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">{t('currentPrice', language)} (₹/quintal)</label>
            <input
              type="number"
              name="currentPrice"
              value={formData.currentPrice}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter current price"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              <FaMapMarkerAlt className="inline mr-2" />
              {t('location', language)}
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Hyderabad, Telangana"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              <FaCloudSun className="inline mr-2" />
              {t('weatherCondition', language)}
            </label>
            <select
              name="weatherCondition"
              value={formData.weatherCondition}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="optimal">{t('optimal', language)}</option>
              <option value="drought">{t('drought', language)}</option>
              <option value="excess_rain">{t('excessRain', language)}</option>
              <option value="heatwave">{t('heatwave', language)}</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              <FaCalendarAlt className="inline mr-2" />
              {t('season', language)}
            </label>
            <select
              name="season"
              value={formData.season}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="kharif">{t('kharif', language)}</option>
              <option value="rabi">{t('rabi', language)}</option>
              <option value="summer">{t('summer', language)}</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? t('analyzing', language) : t('getPrediction', language)}
            </button>
          </div>
        </form>
      </div>

      {/* Prediction Results */}
      {prediction && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Prediction Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('predictionResult', language)}</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('currentPrice', language)}:</span>
                <span className="text-lg font-semibold">₹{prediction.currentPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('predictedPrice', language)}:</span>
                <span className="text-lg font-semibold text-green-600">
                  ₹{prediction.predictedPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('priceChange', language)}:</span>
                <span
                  className={`text-lg font-semibold ${
                    prediction.priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {prediction.priceChange >= 0 ? '+' : ''}
                  {prediction.priceChange.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('confidence', language)}:</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${prediction.confidence}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold">{prediction.confidence.toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className={`mt-6 p-4 rounded-lg ${getActionColor(prediction.recommendation.action)}`}>
              <h4 className="font-semibold text-lg mb-2">{t('recommendation', language)}</h4>
              <p className="font-medium">{prediction.recommendation.message}</p>
            </div>
          </div>

          {/* Factors Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('factorsAnalysis', language)}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-700">{t('weatherImpact', language)}:</span>
                <span className="font-semibold">{prediction.factors.weatherImpact}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-700">{t('demandTrend', language)}:</span>
                <span className="font-semibold capitalize">{prediction.factors.demandTrend}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-700">{t('seasonalPattern', language)}:</span>
                <span className="font-semibold">{prediction.factors.seasonalPattern}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-700">{t('marketCondition', language)}:</span>
                <span className="font-semibold capitalize">{prediction.factors.marketCondition}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      {((historicalData && historicalData.length > 0) || (forecast && forecast.length > 0)) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Historical Price Chart */}
          {historicalData && historicalData.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('historicalPrices', language)}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="price" stroke="#16a34a" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Price Forecast Chart */}
          {forecast && forecast.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('priceForecast', language)}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={forecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="predictedPrice" stroke="#ea580c" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PriceAnalytics;
