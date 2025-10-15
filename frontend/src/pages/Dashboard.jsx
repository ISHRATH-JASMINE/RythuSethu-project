import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { t } from '../utils/translations'
import { FaSeedling, FaStore, FaCloudSunRain, FaFileAlt } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const { user } = useAuth()
  const { language } = useLanguage()

  const quickLinks = [
    { icon: <FaSeedling size={40} />, title: t('cropAdvisor', language), link: '/crop-advisor', color: 'bg-green-100' },
    { icon: <FaStore size={40} />, title: t('marketplace', language), link: '/marketplace', color: 'bg-blue-100' },
    { icon: <FaCloudSunRain size={40} />, title: t('weather', language), link: '/weather', color: 'bg-yellow-100' },
    { icon: <FaFileAlt size={40} />, title: t('schemes', language), link: '/schemes', color: 'bg-purple-100' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {t('welcome', language)}, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your farm today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Today's Weather</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">28°C</p>
          <p className="text-sm text-gray-600">Partly Cloudy</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Soil Moisture</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">65%</p>
          <p className="text-sm text-green-600">Optimal</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">My Products</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">12</p>
          <p className="text-sm text-gray-600">Active Listings</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">New Schemes</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">5</p>
          <p className="text-sm text-blue-600">Available</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickLinks.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className={`${item.color} p-6 rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-1`}
            >
              <div className="text-primary mb-3">{item.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Updates</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-primary pl-4">
            <p className="font-semibold text-gray-800">New Scheme Available</p>
            <p className="text-sm text-gray-600">PM-KISAN: Direct income support announced</p>
            <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
          </div>
          <div className="border-l-4 border-blue-500 pl-4">
            <p className="font-semibold text-gray-800">Weather Alert</p>
            <p className="text-sm text-gray-600">Moderate rainfall expected in next 48 hours</p>
            <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <p className="font-semibold text-gray-800">Marketplace Activity</p>
            <p className="text-sm text-gray-600">3 new buyers interested in your products</p>
            <p className="text-xs text-gray-400 mt-1">1 day ago</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
