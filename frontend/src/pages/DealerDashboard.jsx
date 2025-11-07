import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../utils/api'
import { toast } from 'react-toastify'

const DealerDashboard = () => {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('bookings')

  // Bookings state
  const [bookings, setBookings] = useState([])
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

  // Notifications state
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  // Crop Prices state (prices dealer is willing to buy at)
  const [cropPrices, setCropPrices] = useState([])
  const [showPriceForm, setShowPriceForm] = useState(false)
  const [editingPrice, setEditingPrice] = useState(null)
  const [priceForm, setPriceForm] = useState({
    cropName: '',
    variety: '',
    pricePerQuintal: '',
    minimumQuantity: '',
    location: '',
    validUntil: '',
    description: '',
  })

  // Buying Rates state (rates dealer is willing to buy crops at)
  const [buyingRates, setBuyingRates] = useState([])
  const [showBuyingRateForm, setShowBuyingRateForm] = useState(false)
  const [editingBuyingRate, setEditingBuyingRate] = useState(null)
  const [buyingRateForm, setBuyingRateForm] = useState({
    cropName: '',
    buyPricePerKg: '',
    availableFrom: '09:00',
    availableTill: '18:00',
    location: {
      state: '',
      district: '',
      address: '',
      pincode: ''
    },
    minimumQuantity: '',
    maximumQuantity: '',
    qualityRequirements: '',
    paymentTerms: 'immediate',
    validUntil: ''
  })

  // Stats
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalPrices: 0,
    activePrices: 0,
    totalBuyingRates: 0,
    activeBuyingRates: 0,
  })

  // Ratings state
  const [ratings, setRatings] = useState([])
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalRatings: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
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
        fetchBookings(),
        fetchNotifications(),
        fetchStats(),
        fetchCropPrices(),
        fetchBuyingRates(),
        fetchRatings()
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/dealer')
      setBookings(response.data.bookings || [])
      // Update stats with the returned data
      if (response.data.stats) {
        setStats(prev => ({
          ...prev,
          totalBookings: response.data.stats.total || 0,
          pendingBookings: response.data.stats.pending || 0,
          completedBookings: response.data.stats.confirmed || 0,
        }))
      }
    } catch (error) {
      // Silently handle authentication/authorization errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Dealer not authorized to view bookings yet')
      } else {
        console.error('Failed to fetch bookings:', error)
      }
      // Set empty bookings instead of showing error toast
      setBookings([])
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications')
      const notifs = Array.isArray(response.data) ? response.data : []
      setNotifications(notifs)
      setUnreadCount(notifs.filter(n => !n.read).length)
    } catch (error) {
      // Silently handle notification errors
      console.log('Notifications not available')
      setNotifications([])
      setUnreadCount(0)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/dealer/dashboard')
      if (response.data.statistics) {
        setStats({
          totalBookings: response.data.statistics.totalBookings || 0,
          pendingBookings: response.data.statistics.pendingBookings || 0,
          completedBookings: response.data.statistics.completedBookings || 0,
          totalPrices: response.data.statistics.totalPrices || 0,
          activePrices: response.data.statistics.activePrices || 0,
          totalBuyingRates: response.data.statistics.totalBuyingRates || 0,
          activeBuyingRates: response.data.statistics.activeBuyingRates || 0,
        })
      }
    } catch (error) {
      // Silently handle stats errors
      console.log('Stats not available')
    }
  }

  // Crop Prices CRUD operations
  const fetchCropPrices = async () => {
    try {
      const response = await api.get('/dealer/prices')
      setCropPrices(response.data.prices || [])
    } catch (error) {
      // Silently handle price fetch errors
      console.log('Crop prices not available')
      setCropPrices([])
    }
  }

  // Buying Rates CRUD operations
  const fetchBuyingRates = async () => {
    try {
      const response = await api.get('/buying-rates/my-rates')
      setBuyingRates(response.data.rates || [])
    } catch (error) {
      console.log('Buying rates not available')
      setBuyingRates([])
    }
  }

  const handleSubmitBuyingRate = async (e) => {
    e.preventDefault()
    try {
      if (editingBuyingRate) {
        await api.put(`/buying-rates/${editingBuyingRate._id}`, buyingRateForm)
        toast.success('Buying rate updated successfully!')
      } else {
        await api.post('/buying-rates', buyingRateForm)
        toast.success('Buying rate posted successfully!')
      }
      resetBuyingRateForm()
      fetchBuyingRates()
      fetchStats()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save buying rate')
    }
  }

  const handleEditBuyingRate = (rate) => {
    setEditingBuyingRate(rate)
    setBuyingRateForm({
      cropName: rate.cropName,
      buyPricePerKg: rate.buyPricePerKg,
      availableFrom: rate.availableFrom || '09:00',
      availableTill: rate.availableTill || '18:00',
      location: {
        state: rate.location?.state || '',
        district: rate.location?.district || '',
        address: rate.location?.address || '',
        pincode: rate.location?.pincode || ''
      },
      minimumQuantity: rate.minimumQuantity || '',
      maximumQuantity: rate.maximumQuantity || '',
      qualityRequirements: rate.qualityRequirements || '',
      paymentTerms: rate.paymentTerms || 'immediate',
      validUntil: rate.validUntil ? rate.validUntil.split('T')[0] : ''
    })
    setShowBuyingRateForm(true)
  }

  const handleDeleteBuyingRate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this buying rate?')) return
    try {
      await api.delete(`/buying-rates/${id}`)
      toast.success('Buying rate deleted successfully')
      fetchBuyingRates()
      fetchStats()
    } catch (error) {
      toast.error('Failed to delete buying rate')
    }
  }

  const handleToggleBuyingRateStatus = async (id) => {
    try {
      await api.put(`/buying-rates/${id}/toggle-status`)
      toast.success('Status updated successfully')
      fetchBuyingRates()
      fetchStats()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const resetBuyingRateForm = () => {
    setBuyingRateForm({
      cropName: '',
      buyPricePerKg: '',
      availableFrom: '09:00',
      availableTill: '18:00',
      location: {
        state: '',
        district: '',
        address: '',
        pincode: ''
      },
      minimumQuantity: '',
      maximumQuantity: '',
      qualityRequirements: '',
      paymentTerms: 'immediate',
      validUntil: ''
    })
    setEditingBuyingRate(null)
    setShowBuyingRateForm(false)
  }

  // Ratings operations
  const fetchRatings = async () => {
    try {
      const response = await api.get(`/ratings/dealer/${user._id}?limit=10`)
      setRatings(response.data.ratings || [])
      setRatingStats(response.data.stats || {
        averageRating: 0,
        totalRatings: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      })
    } catch (error) {
      // Silently handle rating fetch errors
      console.log('Ratings not available')
      setRatings([])
    }
  }

  const handleSubmitPrice = async (e) => {
    e.preventDefault()
    try {
      if (editingPrice) {
        await api.put(`/dealer/prices/${editingPrice._id}`, priceForm)
        toast.success('Crop price updated successfully!')
      } else {
        await api.post('/dealer/prices', priceForm)
        toast.success('Crop price posted successfully!')
      }
      resetPriceForm()
      fetchCropPrices()
      fetchStats()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save price')
    }
  }

  const handleEditPrice = (price) => {
    setEditingPrice(price)
    setPriceForm({
      cropName: price.cropName,
      variety: price.variety || '',
      pricePerQuintal: price.pricePerQuintal,
      minimumQuantity: price.minimumQuantity || '',
      location: price.location || '',
      validUntil: price.validUntil ? price.validUntil.split('T')[0] : '',
      description: price.description || '',
    })
    setShowPriceForm(true)
  }

  const handleDeletePrice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this crop price?')) return
    try {
      await api.delete(`/dealer/prices/${id}`)
      toast.success('Crop price deleted successfully')
      fetchCropPrices()
      fetchStats()
    } catch (error) {
      toast.error('Failed to delete price')
    }
  }

  const resetPriceForm = () => {
    setPriceForm({
      cropName: '',
      variety: '',
      pricePerQuintal: '',
      minimumQuantity: '',
      location: '',
      validUntil: '',
      description: '',
    })
    setEditingPrice(null)
    setShowPriceForm(false)
  }

  // Booking operations
  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await api.patch(`/api/bookings/${bookingId}/status`, { status })
      toast.success(`Booking ${status.toLowerCase()} successfully!`)
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
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm text-gray-600">
                  Welcome back, <span className="font-semibold">{user?.name}</span>
                </p>
                {/* Rating Display */}
                {ratingStats.totalRatings > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500 text-lg">⭐</span>
                      <span className="font-bold text-yellow-700 text-lg">
                        {ratingStats.averageRating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600">
                      ({ratingStats.totalRatings} {ratingStats.totalRatings === 1 ? 'rating' : 'ratings'})
                    </span>
                  </div>
                )}
              </div>
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
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <span className="text-xl">🔔</span>
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="divide-y divide-gray-100">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => {
                          // Determine icon based on notification type
                          let icon = '📢';
                          let iconBg = 'bg-blue-100';
                          
                          if (notification.type === 'booking') {
                            if (notification.title?.includes('New')) {
                              icon = '📦';
                              iconBg = 'bg-green-100';
                            } else if (notification.title?.includes('Confirmed')) {
                              icon = '✅';
                              iconBg = 'bg-green-100';
                            } else if (notification.title?.includes('Cancelled')) {
                              icon = '❌';
                              iconBg = 'bg-red-100';
                            } else if (notification.title?.includes('Completed')) {
                              icon = '📝';
                              iconBg = 'bg-purple-100';
                            }
                          } else if (notification.type === 'reminder') {
                            icon = '⏰';
                            iconBg = 'bg-yellow-100';
                          }

                          return (
                            <div
                              key={notification._id}
                              className={`p-4 hover:bg-gray-50 cursor-pointer transition ${
                                !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                              }`}
                              onClick={() => markAsRead(notification._id)}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`${iconBg} p-2 rounded-lg flex-shrink-0`}>
                                  <span className="text-lg">{icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 mb-1">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-700 break-words">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                    <span>🕐</span>
                                    {new Date(notification.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center">
                          <div className="text-4xl mb-2">🔔</div>
                          <p className="text-sm text-gray-500">No notifications yet</p>
                        </div>
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
                <span>{t('common.home')}</span>
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                {t('common.logout')}
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
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('dealer.totalBookings')}</p>
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
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('dealer.pendingBookings')}</p>
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
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('dealer.completedBookings')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.completedBookings || bookings.filter(b => b.status === 'completed').length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          {/* Buying Rates Stats Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active Buying Rates</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.activeBuyingRates || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Total: {stats.totalBuyingRates || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          {/* Community Forum Card */}
          <Link 
            to="/forum"
            className="bg-gradient-to-br from-green-500 to-blue-500 p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-0"
          >
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-xs font-medium text-white uppercase tracking-wide">Community</p>
                <p className="text-2xl font-bold text-white mt-2">Forum</p>
                <p className="text-xs text-green-100 mt-1">Connect & Share</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <span className="text-2xl">💬</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-6 py-4 font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === 'bookings'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📦 {t('dealer.bookings')}
              {bookings.filter(b => b.status === 'pending').length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {bookings.filter(b => b.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('prices')}
              className={`px-6 py-4 font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === 'prices'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              💰 My Buying Rates
              {stats.activeBuyingRates > 0 && (
                <span className="ml-2 bg-green-100 text-green-700 text-xs rounded-full px-2 py-1">
                  {stats.activeBuyingRates} active
                </span>
              )}
            </button>

            {/* Ratings Tab */}
            <button
              onClick={() => setActiveTab('ratings')}
              className={`px-6 py-4 font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === 'ratings'
                  ? 'border-yellow-600 text-yellow-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              ⭐ Farmer Ratings
              {ratingStats.totalRatings > 0 && (
                <span className="ml-2 bg-yellow-100 text-yellow-700 text-xs rounded-full px-2 py-1 font-bold">
                  {ratingStats.averageRating.toFixed(1)} ({ratingStats.totalRatings})
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Bookings Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">📦 My Bookings</h2>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {bookings.length} Total
                </span>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                  {bookings.filter(b => b.status === 'Pending').length} Pending
                </span>
              </div>
            </div>

            {/* Bookings List */}
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookings yet</h3>
                <p className="text-gray-500">Farmer bookings will appear here</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      {/* Booking Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {booking.farmerName?.charAt(0) || booking.farmer?.name?.charAt(0) || 'F'}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {booking.farmerName || booking.farmer?.name || 'Unknown Farmer'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {booking.farmer?.phone && `📞 ${booking.farmer.phone}`}
                            </p>
                          </div>
                        </div>

                        {/* Crop & Details */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Crop</p>
                            <p className="text-sm font-semibold text-gray-900">🌾 {booking.cropName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date</p>
                            <p className="text-sm font-semibold text-gray-900">
                              📅 {new Date(booking.date).toLocaleDateString('en-IN', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Time Slot</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {booking.timeSlot === 'Morning' && '🌅'} 
                              {booking.timeSlot === 'Afternoon' && '☀️'} 
                              {booking.timeSlot === 'Evening' && '🌆'} 
                              {booking.timeSlot}
                              {booking.timeSlot === 'Morning' && ' (9 AM - 12 PM)'}
                              {booking.timeSlot === 'Afternoon' && ' (12 PM - 4 PM)'}
                              {booking.timeSlot === 'Evening' && ' (4 PM - 7 PM)'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              booking.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                              booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                              booking.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {booking.status === 'Completed' && '✔️'} 
                              {booking.status === 'Confirmed' && '✅'} 
                              {booking.status === 'Pending' && '⏳'} 
                              {booking.status === 'Cancelled' && '❌'} 
                              {booking.status}
                            </span>
                          </div>
                        </div>

                        {/* Notes */}
                        {booking.notes && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                            <p className="text-sm text-gray-700">{booking.notes}</p>
                          </div>
                        )}

                        {/* Booking Date */}
                        <p className="text-xs text-gray-400 mt-3">
                          Booked on {new Date(booking.createdAt).toLocaleString('en-IN')}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      {booking.status === 'Pending' && (
                        <div className="flex flex-col gap-2 ml-4">
                          <button
                            onClick={() => handleUpdateBookingStatus(booking._id, 'Confirmed')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2 whitespace-nowrap"
                          >
                            <span>✅</span>
                            <span>Confirm</span>
                          </button>
                          <button
                            onClick={() => handleUpdateBookingStatus(booking._id, 'Cancelled')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2 whitespace-nowrap"
                          >
                            <span>❌</span>
                            <span>Cancel</span>
                          </button>
                        </div>
                      )}

                      {booking.status === 'Confirmed' && (
                        <div className="flex flex-col gap-2 ml-4">
                          <button
                            onClick={() => handleUpdateBookingStatus(booking._id, 'Completed')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2 whitespace-nowrap"
                          >
                            <span>✔️</span>
                            <span>Mark Complete</span>
                          </button>
                          <button
                            onClick={() => handleUpdateBookingStatus(booking._id, 'Cancelled')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2 whitespace-nowrap"
                          >
                            <span>❌</span>
                            <span>Cancel</span>
                          </button>
                        </div>
                      )}

                      {(booking.status === 'Completed' || booking.status === 'Cancelled') && (
                        <div className="ml-4">
                          <span className={`px-4 py-2 rounded-lg font-medium ${
                            booking.status === 'Completed'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {booking.status === 'Completed' ? '✅ Completed' : '❌ Cancelled'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Products Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">📦 Product Management</h2>
                <p className="text-gray-600 mt-1">Manage your agricultural products - fertilizers, seeds, pesticides, and more</p>
              </div>
              <button
                onClick={() => setShowProductForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold shadow-md flex items-center gap-2"
              >
                <span className="text-xl">➕</span>
                Add New Product
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-semibold">Total Products</p>
                    <p className="text-3xl font-bold text-blue-700 mt-2">{stats.totalProducts}</p>
                  </div>
                  <div className="text-4xl">📦</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-semibold">Active Products</p>
                    <p className="text-3xl font-bold text-green-700 mt-2">{stats.activeProducts}</p>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-semibold">Low Stock Alert</p>
                    <p className="text-3xl font-bold text-orange-700 mt-2">{stats.lowStockProducts}</p>
                  </div>
                  <div className="text-4xl">⚠️</div>
                </div>
              </div>
            </div>

            {/* Product Form Modal */}
            {showProductForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-bold">
                        {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
                      </h3>
                      <button
                        onClick={resetProductForm}
                        className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                      >
                        <span className="text-2xl">✕</span>
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitProduct} className="p-6 space-y-6">
                    {/* Product Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        placeholder="e.g., Urea Fertilizer, Hybrid Tomato Seeds, NPK 10-26-26"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Category & Brand */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          required
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="fertilizer">🌱 Fertilizers</option>
                          <option value="seeds">🌾 Seeds</option>
                          <option value="pesticide">🐛 Pesticides & Insecticides</option>
                          <option value="organic-manure">🍂 Organic Manure</option>
                          <option value="growth-promoter">🌿 Growth Promoters</option>
                          <option value="farm-tools">� Farm Tools & Equipment</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Brand
                        </label>
                        <input
                          type="text"
                          value={productForm.brand}
                          onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                          placeholder="e.g., IFFCO, Coromandel, Bayer, Rallis"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        required
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        rows="3"
                        placeholder="Describe the product, its benefits, and usage..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Price & Unit */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Price (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          placeholder="0.00"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Unit *
                        </label>
                        <select
                          required
                          value={productForm.unit}
                          onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="kg">Kilogram (kg)</option>
                          <option value="gram">Gram (g)</option>
                          <option value="liter">Liter (L)</option>
                          <option value="ml">Milliliter (ml)</option>
                          <option value="piece">Piece</option>
                          <option value="packet">Packet</option>
                          <option value="bag">Bag</option>
                          <option value="bottle">Bottle</option>
                          <option value="box">Box</option>
                        </select>
                      </div>
                    </div>

                    {/* Stock Quantity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Stock Quantity *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={productForm.stock.quantity}
                          onChange={(e) => setProductForm({ 
                            ...productForm, 
                            stock: { ...productForm.stock, quantity: e.target.value }
                          })}
                          placeholder="Available quantity"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Low Stock Alert Level
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={productForm.stock.lowStockThreshold}
                          onChange={(e) => setProductForm({ 
                            ...productForm, 
                            stock: { ...productForm.stock, lowStockThreshold: e.target.value }
                          })}
                          placeholder="10"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-4 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={resetProductForm}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold shadow-md"
                      >
                        {editingProduct ? 'Update Product' : 'Add Product'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Products List */}
            {products.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No products yet</h3>
                <p className="text-gray-500 mb-6">Start adding your agricultural products to reach farmers</p>
                <button
                  onClick={() => setShowProductForm(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Add First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                  >
                    {/* Product Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">{product.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                              {product.category}
                            </span>
                            {product.brand && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                {product.brand}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Product Body */}
                    <div className="p-4 space-y-3">
                      <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                      
                      {/* Price */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-green-600">₹{product.price}</span>
                        <span className="text-gray-500">/ {product.unit}</span>
                      </div>

                      {/* Stock */}
                      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Stock:</span>
                        <span className={`font-bold ${
                          product.stock.quantity <= product.stock.lowStockThreshold 
                            ? 'text-orange-600' 
                            : 'text-green-600'
                        }`}>
                          {product.stock.quantity} {product.unit}
                          {product.stock.quantity <= product.stock.lowStockThreshold && (
                            <span className="ml-2 text-xs">⚠️ Low</span>
                          )}
                        </span>
                      </div>

                      {/* Availability Badge */}
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.availability === 'in-stock' 
                            ? 'bg-green-100 text-green-700'
                            : product.availability === 'limited'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {product.availability === 'in-stock' && '✅ In Stock'}
                          {product.availability === 'limited' && '⚠️ Limited'}
                          {product.availability === 'out-of-stock' && '❌ Out of Stock'}
                        </span>
                      </div>
                    </div>

                    {/* Product Actions */}
                    <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Buying Rates Tab */}
        {activeTab === 'prices' && (
          <div className="space-y-6">
            {/* Buying Rates Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">💰 My Buying Rates</h2>
                <p className="text-gray-600 mt-1">Post the rates you're willing to pay for crops from farmers</p>
              </div>
              <button
                onClick={() => setShowBuyingRateForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition font-semibold shadow-md flex items-center gap-2"
              >
                <span className="text-xl">➕</span>
                Add Buying Rate
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-semibold">Total Rates</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{buyingRates.length}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <span className="text-3xl">💰</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-600 text-sm font-semibold">Active Rates</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {buyingRates.filter(r => r.status === 'active').length}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <span className="text-3xl">✅</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-semibold">Total Views</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {buyingRates.reduce((sum, r) => sum + (r.views || 0), 0)}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <span className="text-3xl">👁️</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Buying Rate Form Modal */}
            {showBuyingRateForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-t-2xl">
                    <h3 className="text-2xl font-bold text-white">
                      {editingBuyingRate ? '✏️ Edit Buying Rate' : '➕ Add New Buying Rate'}
                    </h3>
                    <p className="text-green-100 mt-1">Set your crop buying prices and availability</p>
                  </div>
                  <form onSubmit={handleSubmitBuyingRate} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Crop Name */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Crop Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={buyingRateForm.cropName}
                          onChange={(e) => setBuyingRateForm({...buyingRateForm, cropName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="e.g., Rice, Wheat, Tomatoes"
                        />
                      </div>

                      {/* Buy Price Per Kg */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Buy Price (₹/kg) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={buyingRateForm.buyPricePerKg}
                          onChange={(e) => setBuyingRateForm({...buyingRateForm, buyPricePerKg: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="e.g., 25.50"
                        />
                        {buyingRateForm.buyPricePerKg && (
                          <p className="text-xs text-gray-500 mt-1">
                            ₹{(buyingRateForm.buyPricePerKg * 100).toFixed(2)}/quintal
                          </p>
                        )}
                      </div>

                      {/* Valid Until */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Valid Until
                        </label>
                        <input
                          type="date"
                          value={buyingRateForm.validUntil}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setBuyingRateForm({...buyingRateForm, validUntil: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      {/* Available From Time */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Available From <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          required
                          value={buyingRateForm.availableFrom}
                          onChange={(e) => setBuyingRateForm({...buyingRateForm, availableFrom: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      {/* Available Till Time */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Available Till <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          required
                          value={buyingRateForm.availableTill}
                          onChange={(e) => setBuyingRateForm({...buyingRateForm, availableTill: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      {/* Location Fields */}
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="md:col-span-2 font-semibold text-gray-700 mb-2">Location</h4>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                          <input
                            type="text"
                            value={buyingRateForm.location.state}
                            onChange={(e) => setBuyingRateForm({
                              ...buyingRateForm,
                              location: {...buyingRateForm.location, state: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="e.g., Telangana"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            District <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={buyingRateForm.location.district}
                            onChange={(e) => setBuyingRateForm({
                              ...buyingRateForm,
                              location: {...buyingRateForm.location, district: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="e.g., Hyderabad"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                          <input
                            type="text"
                            value={buyingRateForm.location.address}
                            onChange={(e) => setBuyingRateForm({
                              ...buyingRateForm,
                              location: {...buyingRateForm.location, address: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="Street address"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                          <input
                            type="text"
                            value={buyingRateForm.location.pincode}
                            onChange={(e) => setBuyingRateForm({
                              ...buyingRateForm,
                              location: {...buyingRateForm.location, pincode: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="e.g., 500001"
                          />
                        </div>
                      </div>

                      {/* Minimum Quantity */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Minimum Quantity (kg)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={buyingRateForm.minimumQuantity}
                          onChange={(e) => setBuyingRateForm({...buyingRateForm, minimumQuantity: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="e.g., 100"
                        />
                      </div>

                      {/* Maximum Quantity */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Maximum Quantity (kg)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={buyingRateForm.maximumQuantity}
                          onChange={(e) => setBuyingRateForm({...buyingRateForm, maximumQuantity: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="e.g., 5000"
                        />
                      </div>

                      {/* Payment Terms */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Payment Terms
                        </label>
                        <select
                          value={buyingRateForm.paymentTerms}
                          onChange={(e) => setBuyingRateForm({...buyingRateForm, paymentTerms: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="immediate">Immediate Payment</option>
                          <option value="within-24-hours">Within 24 Hours</option>
                          <option value="within-week">Within a Week</option>
                          <option value="negotiable">Negotiable</option>
                        </select>
                      </div>

                      {/* Quality Requirements */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Quality Requirements
                        </label>
                        <textarea
                          value={buyingRateForm.qualityRequirements}
                          onChange={(e) => setBuyingRateForm({...buyingRateForm, qualityRequirements: e.target.value})}
                          rows="3"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Specify quality standards, moisture content, etc."
                        />
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={resetBuyingRateForm}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition font-semibold shadow-md"
                      >
                        {editingBuyingRate ? 'Update Rate' : 'Post Rate'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Buying Rates List */}
            {buyingRates.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <div className="text-6xl mb-4">💰</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No buying rates posted yet</h3>
                <p className="text-gray-500 mb-6">Start posting your crop buying rates to attract farmers</p>
                <button
                  onClick={() => setShowBuyingRateForm(true)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Post First Rate
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {buyingRates.map((rate) => {
                  const isCurrentlyAvailable = rate.status === 'active' && !rate.isExpired;
                  const isExpired = new Date(rate.validUntil) < new Date();
                  
                  return (
                    <div
                      key={rate._id}
                      className={`bg-white border-2 rounded-xl overflow-hidden hover:shadow-lg transition-all ${
                        isCurrentlyAvailable ? 'border-green-300' : 'border-gray-200'
                      }`}
                    >
                      {/* Rate Header */}
                      <div className={`p-4 border-b ${
                        isCurrentlyAvailable ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-xl mb-1">🌾 {rate.cropName}</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                rate.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {rate.status === 'active' ? '✅ Active' : '⏸️ Inactive'}
                              </span>
                              {isExpired && (
                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                                  ⚠️ Expired
                                </span>
                              )}
                              {isCurrentlyAvailable && (
                                <span className="px-2 py-1 bg-green-500 text-white rounded-full text-xs font-bold animate-pulse">
                                  🟢 Available Now
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Rate Body */}
                      <div className="p-4 space-y-3">
                        {/* Price */}
                        <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-lg border border-green-200">
                          <p className="text-xs text-green-700 font-semibold uppercase mb-1">Buying Price</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-green-700">₹{rate.buyPricePerKg}</span>
                            <span className="text-green-600">/kg</span>
                          </div>
                          <p className="text-xs text-green-600 mt-1">
                            ₹{rate.buyPricePerQuintal}/quintal
                          </p>
                        </div>

                        {/* Availability Time */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <p className="text-xs text-blue-600 font-semibold mb-1">Available From</p>
                            <p className="text-sm font-bold text-gray-900">🕐 {rate.availableFrom}</p>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <p className="text-xs text-blue-600 font-semibold mb-1">Till</p>
                            <p className="text-sm font-bold text-gray-900">🕐 {rate.availableTill}</p>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-600 font-semibold mb-1">📍 Location</p>
                          <p className="text-sm text-gray-900">
                            {rate.location?.district}
                            {rate.location?.state && `, ${rate.location.state}`}
                          </p>
                        </div>

                        {/* Quantity Range */}
                        {(rate.minimumQuantity || rate.maximumQuantity) && (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-600 font-semibold mb-1">Quantity Range</p>
                            <p className="text-sm text-gray-900">
                              {rate.minimumQuantity && `Min: ${rate.minimumQuantity}kg`}
                              {rate.minimumQuantity && rate.maximumQuantity && ' | '}
                              {rate.maximumQuantity && `Max: ${rate.maximumQuantity}kg`}
                            </p>
                          </div>
                        )}

                        {/* Payment Terms */}
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                          <p className="text-xs text-purple-600 font-semibold mb-1">💳 Payment</p>
                          <p className="text-sm text-gray-900 capitalize">
                            {rate.paymentTerms?.replace(/-/g, ' ')}
                          </p>
                        </div>

                        {/* Quality Requirements */}
                        {rate.qualityRequirements && (
                          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                            <p className="text-xs text-yellow-700 font-semibold mb-1">📋 Quality Requirements</p>
                            <p className="text-sm text-gray-700">{rate.qualityRequirements}</p>
                          </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-200">
                          <span>👁️ {rate.views || 0} views</span>
                          <span>📞 {rate.inquiries || 0} inquiries</span>
                          {rate.validUntil && (
                            <span>⏰ Until {new Date(rate.validUntil).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>

                      {/* Rate Actions */}
                      <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2">
                        <button
                          onClick={() => handleEditBuyingRate(rate)}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleToggleBuyingRateStatus(rate._id)}
                          className={`px-4 py-2 rounded-lg transition font-semibold text-sm ${
                            rate.status === 'active'
                              ? 'bg-orange-600 text-white hover:bg-orange-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {rate.status === 'active' ? '⏸️ Deactivate' : '▶️ Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteBuyingRate(rate._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Ratings Tab */}
        {activeTab === 'ratings' && (
          <div className="space-y-6">
            {/* Ratings Header with Stats */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg border-2 border-yellow-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-4xl">⭐</span>
                Customer Ratings & Reviews
              </h2>

              {/* Rating Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Average Rating */}
                <div className="bg-white rounded-xl p-6 border border-yellow-300 shadow-sm">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-yellow-600 mb-2">
                      {ratingStats.averageRating > 0 ? ratingStats.averageRating.toFixed(1) : '0.0'}
                    </div>
                    <div className="flex justify-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-2xl ${
                            star <= Math.round(ratingStats.averageRating)
                              ? 'text-yellow-500'
                              : 'text-gray-300'
                          }`}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm">
                      Based on {ratingStats.totalRatings} {ratingStats.totalRatings === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="bg-white rounded-xl p-6 border border-yellow-300 shadow-sm col-span-2">
                  <h3 className="font-semibold text-gray-900 mb-4">Rating Distribution</h3>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = ratingStats.distribution[star] || 0
                      const percentage = ratingStats.totalRatings > 0
                        ? (count / ratingStats.totalRatings) * 100
                        : 0
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700 w-12">
                            {star} ⭐
                          </span>
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">
                            {count}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Recent Reviews</h3>
              </div>

              {ratings.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {ratings.map((rating) => (
                    <div key={rating._id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex items-start gap-4">
                        {/* Farmer Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {rating.farmer?.name?.charAt(0).toUpperCase() || 'F'}
                        </div>

                        {/* Review Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {rating.farmer?.name || 'Anonymous Farmer'}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                      key={star}
                                      className={`text-lg ${
                                        star <= rating.rating
                                          ? 'text-yellow-500'
                                          : 'text-gray-300'
                                      }`}
                                    >
                                      ⭐
                                    </span>
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {new Date(rating.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Review Text */}
                          {rating.review && (
                            <p className="text-gray-700 mt-3 leading-relaxed">
                              {rating.review}
                            </p>
                          )}

                          {/* Flagged Warning */}
                          {rating.isFlagged && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                              <span>⚠️</span>
                              <span className="font-medium">
                                This review has been flagged for moderation
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">⭐</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Reviews Yet
                  </h3>
                  <p className="text-gray-600">
                    You haven't received any customer reviews yet. Complete bookings successfully to receive ratings!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab !== 'bookings' && activeTab !== 'products' && activeTab !== 'ratings' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-gray-600">{t('dealer.selectTab')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DealerDashboard
