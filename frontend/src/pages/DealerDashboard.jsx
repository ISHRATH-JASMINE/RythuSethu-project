import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import { toast } from 'react-toastify'

const DealerDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('crops')
  
  // Crops state
  const [crops, setCrops] = useState([])
  const [showCropForm, setShowCropForm] = useState(false)
  const [editingCrop, setEditingCrop] = useState(null)
  const [cropForm, setCropForm] = useState({
    cropName: '',
    variety: '',
    price: '',
    unit: 'kg',
    quantity: '',
    location: '',
    description: '',
    imageUrl: '',
  })

  // Bookings state
  const [bookings, setBookings] = useState([])
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

  // Market prices state
  const [marketPrices, setMarketPrices] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // Notifications state
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  // Stats
  const [stats, setStats] = useState({
    totalCrops: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
  })

  useEffect(() => {
    if (!user || user.role !== 'dealer') {
      navigate('/login')
      return
    }
    if (user.dealerInfo && !user.dealerInfo.approved) {
      toast.error('Your dealer account is pending admin approval')
      navigate('/dashboard')
      return
    }

    fetchDashboardData()
  }, [user, navigate])

  const fetchDashboardData = async () => {
    try {
      await Promise.all([
        fetchCrops(),
        fetchBookings(),
        fetchMarketPrices(),
        fetchNotifications(),
        fetchStats()
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const fetchCrops = async () => {
    try {
      const response = await api.get('/dealer/prices')
      setCrops(response.data.prices || [])
    } catch (error) {
      toast.error('Failed to fetch crops')
    }
  }

  const fetchBookings = async () => {
    try {
      const response = await api.get('/dealer/bookings')
      setBookings(response.data.bookings || [])
    } catch (error) {
      toast.error('Failed to fetch bookings')
    }
  }

  const fetchMarketPrices = async () => {
    try {
      const response = await api.get('/public/prices')
      setMarketPrices(response.data.prices || [])
    } catch (error) {
      toast.error('Failed to fetch market prices')
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications')
      const notifs = Array.isArray(response.data) ? response.data : []
      setNotifications(notifs)
      setUnreadCount(notifs.filter(n => !n.read).length)
    } catch (error) {
      console.error('Failed to fetch notifications')
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/dealer/dashboard')
      if (response.data.statistics) {
        setStats({
          totalCrops: response.data.statistics.totalPrices || 0,
          activeCrops: response.data.statistics.activePrices || 0,
          totalBookings: response.data.statistics.totalBookings || 0,
          pendingBookings: response.data.statistics.pendingBookings || 0,
          completedBookings: response.data.statistics.completedBookings || 0,
        })
      }
    } catch (error) {
      console.error('Failed to fetch stats')
    }
  }

  // Crop CRUD operations
  const handleSubmitCrop = async (e) => {
    e.preventDefault()
    try {
      if (editingCrop) {
        await api.put(`/dealer/prices/${editingCrop._id}`, cropForm)
        toast.success('Crop updated successfully!')
      } else {
        await api.post('/dealer/prices', cropForm)
        toast.success('Crop posted successfully!')
      }
      resetCropForm()
      fetchCrops()
      fetchStats()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save crop')
    }
  }

  const handleEditCrop = (crop) => {
    setEditingCrop(crop)
    setCropForm({
      cropName: crop.cropName,
      variety: crop.variety || '',
      price: crop.price,
      unit: crop.unit,
      quantity: crop.quantity?.available || '',
      location: crop.location?.district || '',
      description: crop.description || '',
      imageUrl: crop.imageUrl || '',
    })
    setShowCropForm(true)
  }

  const handleDeleteCrop = async (id) => {
    if (!window.confirm('Are you sure you want to delete this crop?')) return
    try {
      await api.delete(`/dealer/prices/${id}`)
      toast.success('Crop deleted successfully')
      fetchCrops()
      fetchStats()
    } catch (error) {
      toast.error('Failed to delete crop')
    }
  }

  const resetCropForm = () => {
    setCropForm({
      cropName: '',
      variety: '',
      price: '',
      unit: 'kg',
      quantity: '',
      location: '',
      description: '',
      imageUrl: '',
    })
    setEditingCrop(null)
    setShowCropForm(false)
  }

  // Booking operations
  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await api.put(`/dealer/bookings/${bookingId}/status`, { status })
      toast.success('Booking status updated')
      fetchBookings()
      fetchStats()
      setShowBookingModal(false)
      
      // Emit socket event
      if (socket) {
        socket.emit('bookingStatusUpdated', { bookingId, status })
      }
    } catch (error) {
      toast.error('Failed to update booking status')
    }
  }

  const handleViewBookingDetails = (booking) => {
    setSelectedBooking(booking)
    setShowBookingModal(true)
  }

  // Notification operations
  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`)
      fetchNotifications()
    } catch (error) {
      console.error('Failed to mark notification as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all')
      fetchNotifications()
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  // Filter market prices
  const filteredMarketPrices = marketPrices.filter(price =>
    price.cropName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                🏪 <span>Dealer Dashboard</span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, <span className="font-semibold">{user?.name}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                >
                  <span className="text-2xl">🔔</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="divide-y divide-gray-100">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`p-4 hover:bg-gray-50 cursor-pointer ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => markAsRead(notification._id)}
                          >
                            <p className="text-sm text-gray-900">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="p-4 text-sm text-gray-500 text-center">No notifications</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
              >
                <span>🏠</span>
                <span>Home</span>
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">My Crops</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCrops || crops.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <span className="text-2xl">🌾</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalBookings || bookings.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.pendingBookings || bookings.filter(b => b.status === 'pending').length}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.completedBookings || bookings.filter(b => b.status === 'completed').length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('crops')}
              className={`px-6 py-4 font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === 'crops'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              🌾 My Crops
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-6 py-4 font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === 'bookings'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📦 Bookings
              {bookings.filter(b => b.status === 'pending').length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {bookings.filter(b => b.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`px-6 py-4 font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === 'market'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              💹 Market Prices
            </button>
          </div>
        </div>

        {/* Tab Contents Will Go Here */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <p className="text-gray-600">Select a tab to view content</p>
        </div>
      </div>
    </div>
  )
}

export default DealerDashboard
