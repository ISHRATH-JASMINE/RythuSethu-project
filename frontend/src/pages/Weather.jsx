import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { t } from '../utils/translations'
import api from '../utils/api'
import { FaCloudSun, FaCloudRain, FaSun, FaCloud, FaBolt } from 'react-icons/fa'

const Weather = () => {
  const { language } = useLanguage()
  const [weatherData, setWeatherData] = useState(null)
  const [soilData, setSoilData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWeatherAndSoil()
  }, [])

  const fetchWeatherAndSoil = async () => {
    try {
      const { data } = await api.get('/weather/combined')
      setWeatherData(data.weather)
      setSoilData(data.soil)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'Sunny': return <FaSun className="text-yellow-500" size={40} />
      case 'Cloudy': return <FaCloud className="text-gray-400" size={40} />
      case 'Partly Cloudy': return <FaCloudSun className="text-blue-400" size={40} />
      case 'Rainy': return <FaCloudRain className="text-blue-600" size={40} />
      case 'Thunderstorm': return <FaBolt className="text-purple-600" size={40} />
      default: return <FaSun className="text-yellow-500" size={40} />
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        ☁️ {t('weather', language)}
      </h1>

      {/* Current Weather */}
      <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Current Weather</h2>
            <p className="text-lg">{weatherData?.location}</p>
            <div className="flex items-center mt-4">
              {getWeatherIcon(weatherData?.current?.condition)}
              <span className="text-5xl font-bold ml-4">
                {weatherData?.current?.temperature?.avg}°C
              </span>
            </div>
            <p className="text-xl mt-2">{weatherData?.current?.condition}</p>
          </div>
          <div className="text-right">
            <div className="space-y-2">
              <p>💧 Humidity: {weatherData?.current?.humidity}%</p>
              <p>🌧️ Rainfall: {weatherData?.current?.rainfall}mm</p>
              <p>💨 Wind: {weatherData?.current?.windSpeed} km/h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Alerts */}
      {weatherData?.alerts?.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Weather Alerts</h3>
          {weatherData.alerts.map((alert, index) => (
            <p key={index} className="text-yellow-700">{alert.message}</p>
          ))}
        </div>
      )}

      {/* 7-Day Forecast */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">7-Day Forecast</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {weatherData?.forecast?.map((day, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-2">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </p>
              <div className="flex justify-center mb-2">
                {getWeatherIcon(day.condition)}
              </div>
              <p className="text-2xl font-bold">{day.temperature.avg}°C</p>
              <p className="text-xs text-gray-600">
                {day.temperature.min}° / {day.temperature.max}°
              </p>
              <p className="text-xs text-gray-600 mt-1">
                🌧️ {day.rainfall}mm
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Soil Insights */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">🌱 Soil Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3">Soil Parameters</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>Soil Type</span>
                <span className="font-semibold">{soilData?.soilType}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>pH Level</span>
                <span className="font-semibold">{soilData?.pH}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>Moisture</span>
                <span className="font-semibold">{soilData?.moisture}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>Organic Matter</span>
                <span className="font-semibold">{soilData?.organicMatter}%</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Nutrient Levels</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>Nitrogen (N)</span>
                <span className="font-semibold">{soilData?.nitrogen}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>Phosphorus (P)</span>
                <span className="font-semibold">{soilData?.phosphorus}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>Potassium (K)</span>
                <span className="font-semibold">{soilData?.potassium}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>EC (dS/m)</span>
                <span className="font-semibold">{soilData?.ec}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">📋 Recommendations</h3>
          <ul className="space-y-1 text-sm text-green-700">
            {soilData?.recommendations?.map((rec, index) => (
              <li key={index}>• {rec}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Weather
