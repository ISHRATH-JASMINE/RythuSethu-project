import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/translations';
import api from '../utils/api';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

const CropAdvisor = () => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    soilPH: '',
    season: '',
    landSize: '',
    previousCrop: '',
    rainfall: 'moderate'
  });
  const [recommendations, setRecommendations] = useState(null);
  const [weather, setWeather] = useState(null);
  const [market, setMarket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const seasons = ['Kharif', 'Rabi', 'Summer'];
  const previousCrops = ['None', 'Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Pulses', 'Vegetables', 'Oilseeds'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fetch weather when location changes
  const fetchWeather = async (location) => {
    if (!location || location.trim().length < 3) {
      setWeather(null);
      return;
    }

    setWeatherLoading(true);
    try {
      const response = await api.get(`/crop/weather/${encodeURIComponent(location)}`);
      setWeather(response.data);
    } catch (error) {
      console.error('Weather fetch error:', error);
      setWeather(null);
    } finally {
      setWeatherLoading(false);
    }
  };

  // Debounce weather fetch when user types location
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.location) {
        fetchWeather(formData.location);
      }
    }, 1000); // Wait 1 second after user stops typing

    return () => clearTimeout(timer);
  }, [formData.location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/crop/recommend', formData);
      setRecommendations(response.data.recommendations);
      setMarket(response.data.market);
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{t('cropAdvisor', language)}</h1>
      
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="mb-6 space-y-3">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                notification.type === 'weather' ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-blue-50 border-l-4 border-blue-400'
              }`}
            >
              <div className="flex items-center">
                <span className="text-xl mr-3">{notification.type === 'weather' ? '⚠️' : '📈'}</span>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {notification.type === 'weather' ? t('weatherAlert', language) : t('marketUpdate', language)}
                  </h3>
                  <p className="text-gray-700">{notification.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">{t('location', language)}</label>
            <input 
              type="text" 
              name="location" 
              value={formData.location} 
              onChange={handleChange} 
              placeholder="e.g., Hyderabad, Mumbai, Delhi"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
              required 
            />
            {weatherLoading && <p className="text-sm text-blue-600 mt-1">🌦️ Fetching weather data...</p>}
          </div>
          <div>
            <label className="block text-gray-700 mb-2">{t('soilPH', language)}</label>
            <input 
              type="number" 
              name="soilPH" 
              value={formData.soilPH} 
              onChange={handleChange} 
              placeholder="Enter pH (4.0 - 9.0)"
              min="4" 
              max="9" 
              step="0.1"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
              required 
            />
            <p className="text-xs text-gray-500 mt-1">💡 Acidic: 4-6, Neutral: 6.5-7.5, Alkaline: 7.5-9</p>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">{t('season', language)}</label>
            <select name="season" value={formData.season} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required>
              <option value="">{t('selectSeason', language)}</option>
              {seasons.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">{t('landSize', language)}</label>
            <input type="number" name="landSize" value={formData.landSize} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">{t('previousCrop', language)}</label>
            <select name="previousCrop" value={formData.previousCrop} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required>
              <option value="">{t('selectPreviousCrop', language)}</option>
              {previousCrops.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">{t('rainfall', language)}</label>
            <select name="rainfall" value={formData.rainfall} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required>
              <option value="low">{t('low', language)}</option>
              <option value="moderate">{t('moderate', language)}</option>
              <option value="high">{t('high', language)}</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:bg-gray-400">{loading ? t('loading', language) : t('getRecommendations', language)}</button>
          </div>
        </form>
      </div>

      {/* Dynamic 7-Day Weather Forecast */}
      {weather && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🌦️</span>
            {t('weatherForecast', language)} - {formData.location}
          </h2>
          
          {/* Current Weather */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <p className="text-gray-600 text-sm font-medium">{t('temperature', language)}</p>
              <p className="text-3xl font-bold text-blue-600">{weather.current?.temperature || 'N/A'}°C</p>
              <p className="text-xs text-gray-500 mt-1">{weather.current?.condition || ''}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <p className="text-gray-600 text-sm font-medium">{t('humidity', language)}</p>
              <p className="text-3xl font-bold text-green-600">{weather.current?.humidity || 'N/A'}%</p>
              <p className="text-xs text-gray-500 mt-1">💧 Moisture level</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
              <p className="text-gray-600 text-sm font-medium">{t('rainfall', language)}</p>
              <p className="text-3xl font-bold text-yellow-600">{weather.current?.rainfall || 0}mm</p>
              <p className="text-xs text-gray-500 mt-1">☔ Precipitation</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <p className="text-gray-600 text-sm font-medium">{t('windSpeed', language)}</p>
              <p className="text-3xl font-bold text-purple-600">{weather.current?.windSpeed || 'N/A'} km/h</p>
              <p className="text-xs text-gray-500 mt-1">💨 Wind flow</p>
            </div>
          </div>

          {/* 7-Day Forecast Chart */}
          {weather.forecast && weather.forecast.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">📊 7-Day Temperature & Rainfall Forecast</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={weather.forecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="day" stroke="#666" />
                  <YAxis yAxisId="left" stroke="#3b82f6" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    name={`${t('temperature', language)} (°C)`}
                    dot={{ fill: '#3b82f6', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="rainfall" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    name={`${t('rainfall', language)} (mm)`}
                    dot={{ fill: '#10b981', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Weather Recommendation */}
          {weather.recommendation && (
            <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">🌾 Farming Tip: </span>
                {weather.recommendation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Crop Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">{t('topCropRecommendations', language)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((crop, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className={`h-2 ${index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : 'bg-yellow-500'}`}></div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{crop.name}</h3>
                    <span className="text-3xl">🌾</span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">{t('suitability', language)}</span>
                      <span className="font-semibold text-green-600">{crop.suitability}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                        style={{ width: `${crop.suitability}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('duration', language)}:</span>
                      <span className="font-medium">{crop.duration || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('water', language)}:</span>
                      <span className="font-medium">{crop.waterRequirement || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('yield', language)}:</span>
                      <span className="font-medium">{crop.expectedYield || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('demand', language)}:</span>
                      <span className={`font-medium ${crop.marketDemand === 'High' ? 'text-green-600' : crop.marketDemand === 'Medium' ? 'text-yellow-600' : 'text-gray-600'}`}>
                        {crop.marketDemand || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {crop.reasons && crop.reasons.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                        <span className="mr-2">💡</span> {t('whyThisCrop', language)}
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {crop.reasons.slice(0, 3).map((reason, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {crop.tips && crop.tips.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                        <span className="mr-2">🌱</span> {t('cropTips', language)}
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {crop.tips.slice(0, 2).map((tip, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Charts */}
      {recommendations && recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('suitabilityComparison', language)}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={recommendations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="suitability" fill="#10b981" name={t('suitability', language)} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('profitabilityDistribution', language)}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={recommendations}
                  dataKey="suitability"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.suitability}%`}
                >
                  {recommendations.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Market Conditions */}
      {market && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('marketConditions', language)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">{t('currentPrice', language)}</p>
              <p className="text-2xl font-bold text-green-600">₹{market.currentPrice || 'N/A'}/quintal</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">{t('trend', language)}</p>
              <p className="text-2xl font-bold text-blue-600">{market.trend || 'N/A'}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">{t('demand', language)}</p>
              <p className="text-2xl font-bold text-yellow-600">{market.demand || 'N/A'}</p>
            </div>
          </div>

          {market.priceHistory && market.priceHistory.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">{t('historicalPrices', language)}</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={market.priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} name={t('price', language)} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!recommendations && !loading && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-12 text-center">
          <span className="text-6xl mb-4 block">🌾</span>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('noCropRecommendations', language)}</h3>
          <p className="text-gray-600">{t('fillFormToGetRecommendations', language)}</p>
        </div>
      )}
    </div>
  );
};

export default CropAdvisor;