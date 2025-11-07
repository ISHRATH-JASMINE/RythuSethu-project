import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { FaSeedling, FaFileAlt, FaWarehouse, FaComments } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { Calendar, Package, MapPin, Star, CheckCircle, Clock, XCircle, Search, DollarSign } from 'lucide-react'
import api from '../utils/api'
import { motion, AnimatePresence } from 'framer-motion'

const Dashboard = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [bookings, setBookings] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [filteredBookings, setFilteredBookings] = useState([])
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAllBookings, setShowAllBookings] = useState(false)
  const [ratingModal, setRatingModal] = useState({
    isOpen: false,
    bookingId: null,
    dealerName: '',
    cropName: '',
    rating: 0,
    review: ''
  })
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 5000)
  }

  useEffect(() => {
    if (user?.role === 'farmer') {
      fetchBookings()
    }
  }, [user])

  useEffect(() => {
    // Filter bookings based on status and search term
    let filtered = [...bookings]

    // Filter by status
    if (statusFilter !== 'All') {
      filtered = filtered.filter(b => b.status === statusFilter)
    }

    // Filter by search term (dealer name or crop name)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(b => 
        b.dealerName?.toLowerCase().includes(search) ||
        b.cropName?.toLowerCase().includes(search)
      )
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date))

    setFilteredBookings(filtered)
  }, [bookings, statusFilter, searchTerm])

  const fetchBookings = async () => {
    setLoadingBookings(true)
    try {
      const response = await api.get('/bookings/farmer')
      if (response.data.success) {
        setBookings(response.data.bookings || [])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoadingBookings(false)
    }
  }

  const handleOpenRating = (booking) => {
    setRatingModal({
      isOpen: true,
      bookingId: booking._id,
      dealerName: booking.dealerName,
      cropName: booking.cropName,
      rating: 0,
      review: ''
    })
  }

  const handleCloseRating = () => {
    setRatingModal({
      isOpen: false,
      bookingId: null,
      dealerName: '',
      cropName: '',
      rating: 0,
      review: ''
    })
  }

  const handleRatingSubmit = async () => {
    if (ratingModal.rating === 0) {
      showToast('Please select a rating', 'error')
      return
    }

    try {
      const response = await api.post('/ratings', {
        bookingId: ratingModal.bookingId,
        rating: ratingModal.rating,
        review: ratingModal.review
      })

      if (response.data.success) {
        showToast('Thank you for your feedback!', 'success')
        handleCloseRating()
        fetchBookings() // Refresh bookings
      }
    } catch (error) {
      console.error('Rating error:', error)
      showToast(error.response?.data?.message || 'Failed to submit rating', 'error')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      Pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" /> },
      Confirmed: { color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="w-4 h-4" /> },
      Completed: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
      Cancelled: { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" /> }
    }
    const badge = badges[status] || badges.Pending
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.icon}
        {status}
      </span>
    )
  }

  const getBookingStats = () => {
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'Pending').length,
      confirmed: bookings.filter(b => b.status === 'Confirmed').length,
      completed: bookings.filter(b => b.status === 'Completed').length,
      cancelled: bookings.filter(b => b.status === 'Cancelled').length
    }
  }

  const handleRebook = (booking) => {
    // Store booking data for rebooking
    localStorage.setItem('rebookingData', JSON.stringify({
      dealerId: booking.dealer?._id,
      dealerName: booking.dealerName,
      cropName: booking.cropName
    }))
    showToast('Redirecting to crop prices...', 'success')
    setTimeout(() => {
      window.location.href = '/crop-prices'
    }, 1000)
  }

  const quickLinks = [
    { icon: <FaSeedling size={40} />, title: t('common.cropAdvisor'), description: t('cropAdvisor.description'), link: '/crop-advisor', color: 'bg-green-100', textColor: 'text-green-700' },
    { icon: <DollarSign size={40} />, title: t('priceAnalytics.prices'), description: t('marketplace.buyNow'), link: '/crop-prices', color: 'bg-blue-100', textColor: 'text-blue-700' },
    { icon: <FaWarehouse size={40} />, title: t('storage.title'), description: t('storage.findNearby'), link: '/storage-finder', color: 'bg-indigo-100', textColor: 'text-indigo-700' },
    { icon: <FaComments size={40} />, title: t('common.forum'), description: t('forum.title'), link: '/forum', color: 'bg-purple-100', textColor: 'text-purple-700' },
    { icon: <FaFileAlt size={40} />, title: t('common.schemes'), description: t('schemes.programs'), link: '/schemes', color: 'bg-pink-100', textColor: 'text-pink-700' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {t('common.welcome')}, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 mt-2">{t('dashboard.overview')}</p>
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('dashboard.overview')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {quickLinks.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className={`${item.color} p-6 rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-1`}
            >
              <div className={`${item.textColor} mb-3`}>{item.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* My Bookings - Only for Farmers */}
      {user?.role === 'farmer' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-green-600" />
                {t('dashboard.myBookings')}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {t('booking.bookingDetails')}
              </p>
            </div>
            <Link
              to="/crop-prices"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              {t('booking.bookNow')}
            </Link>
          </div>

          {/* Booking Stats */}
          {bookings.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 font-medium">{t('common.all')}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{getBookingStats().total}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-700 font-medium">{t('dealer.pending')}</p>
                <p className="text-2xl font-bold text-yellow-800 mt-1">{getBookingStats().pending}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700 font-medium">{t('dealer.confirmed')}</p>
                <p className="text-2xl font-bold text-blue-800 mt-1">{getBookingStats().confirmed}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <p className="text-xs text-green-700 font-medium">{t('dealer.completed')}</p>
                <p className="text-2xl font-bold text-green-800 mt-1">{getBookingStats().completed}</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                <p className="text-xs text-red-700 font-medium">{t('dealer.rejected')}</p>
                <p className="text-2xl font-bold text-red-800 mt-1">{getBookingStats().cancelled}</p>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          {bookings.length > 0 && (
            <div className="mb-6 space-y-4">
              {/* Status Filter Tabs */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'All', label: t('common.all') },
                  { key: 'Pending', label: t('dealer.pending') },
                  { key: 'Confirmed', label: t('dealer.confirmed') },
                  { key: 'Completed', label: t('dealer.completed') },
                  { key: 'Cancelled', label: t('dealer.rejected') }
                ].map((statusObj) => (
                  <button
                    key={statusObj.key}
                    onClick={() => setStatusFilter(statusObj.key)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      statusFilter === statusObj.key
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {statusObj.label}
                    {statusObj.key !== 'All' && (
                      <span className="ml-2 text-xs opacity-75">
                        ({bookings.filter(b => b.status === statusObj.key).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('common.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Results Count */}
              <p className="text-sm text-gray-600">
                {t('common.loading')} <span className="font-semibold">{filteredBookings.length}</span> {t('common.noData')}{' '}
                <span className="font-semibold">{bookings.length}</span> {t('dashboard.myBookings')}
              </p>
            </div>
          )}

          {loadingBookings ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">{t('common.noData')}</p>
              <Link
                to="/crop-prices"
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                {t('priceAnalytics.prices')}
              </Link>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">{t('common.noData')}</p>
              <p className="text-sm text-gray-400">{t('common.search')}</p>
              <button
                onClick={() => {
                  setStatusFilter('All')
                  setSearchTerm('')
                }}
                className="mt-4 px-4 py-2 text-green-600 hover:text-green-700 font-medium"
              >
                {t('common.filter')}
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {(showAllBookings ? filteredBookings : filteredBookings.slice(0, 5)).map((booking) => (
                  <div
                    key={booking._id}
                    className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all bg-gradient-to-r from-white to-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {booking.dealerName}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Package className="w-4 h-4" />
                          {booking.cropName}
                        </p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">
                          {new Date(booking.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {booking.timeSlot}
                      </div>
                      {booking.dealer?.phone && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">📞</span>
                          {booking.dealer.phone}
                        </div>
                      )}
                    </div>

                    {booking.dealer?.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {booking.dealer.location.district}, {booking.dealer.location.state}
                      </div>
                    )}

                    {booking.notes && (
                      <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs text-blue-600 font-semibold mb-1">Your Notes:</p>
                        <p className="text-sm text-gray-700">{booking.notes}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                      {/* Rate Button for Completed bookings */}
                      {booking.status === 'Completed' && (
                        <button
                          onClick={() => handleOpenRating(booking)}
                          className="flex-1 min-w-[200px] px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <Star className="w-4 h-4" />
                          {t('common.submit')}
                        </button>
                      )}

                      {/* Rebook Button */}
                      <button
                        onClick={() => handleRebook(booking)}
                        className="flex-1 min-w-[150px] px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        {t('booking.bookNow')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All / Show Less Toggle */}
              {filteredBookings.length > 5 && (
                <div className="text-center mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowAllBookings(!showAllBookings)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 mx-auto"
                  >
                    {showAllBookings ? (
                      <>
                        <span>{t('common.back')}</span>
                        <span>▲</span>
                      </>
                    ) : (
                      <>
                        <span>{t('common.view')} {t('common.all')} {filteredBookings.length} {t('dashboard.myBookings')}</span>
                        <span>▼</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Rating Modal */}
      <AnimatePresence>
        {ratingModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseRating}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">{t('storage.rating')}</h3>
                  <button
                    onClick={handleCloseRating}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-600 mb-2">
                    {t('dealer.selectDealer')} <strong>{ratingModal.dealerName}</strong>?
                  </p>
                  <p className="text-sm text-gray-500">{t('booking.crop')}: {ratingModal.cropName}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('storage.rating')}
                  </label>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRatingModal({ ...ratingModal, rating: star })}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-12 h-12 ${
                            star <= ratingModal.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {ratingModal.rating > 0 && (
                    <p className="text-center mt-2 text-sm text-gray-600">
                      {ratingModal.rating === 5 && '⭐ Excellent!'}
                      {ratingModal.rating === 4 && '😊 Very Good'}
                      {ratingModal.rating === 3 && '👍 Good'}
                      {ratingModal.rating === 2 && '😐 Fair'}
                      {ratingModal.rating === 1 && '😞 Poor'}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('forum.comment')}
                  </label>
                  <textarea
                    value={ratingModal.review}
                    onChange={(e) => setRatingModal({ ...ratingModal, review: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows="4"
                    placeholder={t('common.search')}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCloseRating}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleRatingSubmit}
                    disabled={ratingModal.rating === 0}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {t('common.submit')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50"
          >
            <div
              className={`px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
                toast.type === 'success'
                  ? 'bg-green-600 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <XCircle className="w-6 h-6" />
              )}
              <p className="font-medium">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Dashboard
