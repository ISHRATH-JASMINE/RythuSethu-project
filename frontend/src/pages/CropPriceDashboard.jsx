import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Phone,
  RefreshCw,
  Filter,
  Search,
  Package,
  Calendar,
  Award,
  ChevronDown,
  Star,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

const CropPriceDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedCrop, setSelectedCrop] = useState('');
  const [location, setLocation] = useState({
    state: '',
    district: '',
    village: ''
  });
  const [cropPrices, setCropPrices] = useState([]);
  const [topDeals, setTopDeals] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [useGeolocation, setUseGeolocation] = useState(false);
  const [sortBy, setSortBy] = useState('price');
  const [hasSearched, setHasSearched] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Booking modal state
  const [bookingModal, setBookingModal] = useState({
    isOpen: false,
    dealer: null,
    dealerId: null,
    cropName: '',
    dealerName: ''
  });

  // Rating modal state
  const [ratingModal, setRatingModal] = useState({
    isOpen: false,
    bookingId: null,
    dealerName: '',
    cropName: '',
    rating: 0,
    review: ''
  });

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 5000);
  };

  // Handle opening booking modal
  const handleOpenBooking = (rate) => {
    if (!user) {
      showToast('Please login to book a slot', 'error');
      return;
    }
    if (user.role !== 'farmer') {
      showToast('Only farmers can book slots', 'error');
      return;
    }
    
    setBookingModal({
      isOpen: true,
      dealer: rate.dealer,
      dealerId: rate.dealer._id,
      cropName: rate.cropName,
      dealerName: rate.dealerName
    });
  };

  const handleCloseBooking = () => {
    setBookingModal({
      isOpen: false,
      dealer: null,
      dealerId: null,
      cropName: '',
      dealerName: ''
    });
  };

  // Handle booking submission
  const handleBookingSuccess = async (bookingData) => {
    try {
      const response = await api.post('/bookings', bookingData);
      if (response.data.success) {
        showToast('Booking created successfully! The dealer will confirm soon.', 'success');
        handleCloseBooking();
        
        // Increment inquiries for the rate
        const rateId = cropPrices.find(r => r.dealer?._id === bookingData.dealerId)?._id;
        if (rateId) {
          await api.post(`/buying-rates/${rateId}/inquiry`);
        }
      }
    } catch (error) {
      console.error('Booking error:', error);
      showToast(error.response?.data?.message || 'Failed to create booking', 'error');
    }
  };

  // Handle opening rating modal
  const handleOpenRating = (bookingId, dealerName, cropName) => {
    setRatingModal({
      isOpen: true,
      bookingId,
      dealerName,
      cropName,
      rating: 0,
      review: ''
    });
  };

  const handleCloseRating = () => {
    setRatingModal({
      isOpen: false,
      bookingId: null,
      dealerName: '',
      cropName: '',
      rating: 0,
      review: ''
    });
  };

  // Handle rating submission
  const handleRatingSubmit = async () => {
    if (ratingModal.rating === 0) {
      showToast('Please select a rating', 'error');
      return;
    }

    try {
      const response = await api.post('/ratings', {
        bookingId: ratingModal.bookingId,
        rating: ratingModal.rating,
        review: ratingModal.review
      });

      if (response.data.success) {
        showToast('Thank you for your feedback!', 'success');
        handleCloseRating();
        fetchCropPrices(true); // Refresh to show updated ratings
      }
    } catch (error) {
      console.error('Rating error:', error);
      showToast(error.response?.data?.message || 'Failed to submit rating', 'error');
    }
  };

  // Crop options
  const cropOptions = [
    { value: 'rice', label: 'Rice', icon: '🌾' },
    { value: 'wheat', label: 'Wheat', icon: '🌾' },
    { value: 'maize', label: 'Maize', icon: '🌽' },
    { value: 'cotton', label: 'Cotton', icon: '🌿' },
    { value: 'sugarcane', label: 'Sugarcane', icon: '🎋' },
    { value: 'pulses', label: 'Pulses', icon: '🫘' },
    { value: 'vegetables', label: 'Vegetables', icon: '🥬' },
    { value: 'oilseeds', label: 'Oilseeds', icon: '🌻' }
  ];

  // Get user's location from geolocation API
  const getUserLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setUseGeolocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // For now, we'll use a placeholder - in production, you'd use reverse geocoding
          const { latitude, longitude } = position.coords;
          console.log('User location:', latitude, longitude);
          
          // Placeholder: You would call a reverse geocoding API here
          // For now, just enable the feature
          alert('Location detected! Please manually enter your district for accurate results.');
        } catch (error) {
          console.error('Error getting location:', error);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your location. Please enter manually.');
        setUseGeolocation(false);
      }
    );
  };

  // Fetch crop prices
  const fetchCropPrices = async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    // Mark that user has performed a search
    setHasSearched(true);

    try {
      // Fetch buying rates from dealers
      const params = new URLSearchParams();
      if (selectedCrop) params.append('cropName', selectedCrop);
      if (location.district) params.append('district', location.district);
      
      // Adjust sorting parameter names for buying rates API
      let sortParam = 'recent';
      if (sortBy === 'price') sortParam = 'price-high';
      else if (sortBy === 'price-asc') sortParam = 'price-low';
      else if (sortBy === 'recent') sortParam = 'recent';
      
      params.append('sortBy', sortParam);

      const response = await api.get(`/buying-rates/search?${params.toString()}`);
      
      if (response.data.success) {
        const ratesWithDealerInfo = response.data.rates || [];
        setCropPrices(ratesWithDealerInfo);
        
        // Calculate statistics from the fetched data
        if (ratesWithDealerInfo.length > 0) {
          const prices = ratesWithDealerInfo.map(r => r.buyPricePerQuintal);
          setStatistics({
            avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
            maxPrice: Math.max(...prices),
            minPrice: Math.min(...prices),
            dealerCount: ratesWithDealerInfo.length
          });
        } else {
          setStatistics(null);
        }

        // Set top deals from available rates (highest prices)
        const topRates = [...ratesWithDealerInfo]
          .sort((a, b) => b.buyPricePerQuintal - a.buyPricePerQuintal)
          .slice(0, 3);
        setTopDeals(topRates);
      }
    } catch (error) {
      console.error('Error fetching crop prices:', error);
      showToast('Failed to fetch crop prices', 'error');
      setCropPrices([]);
      setTopDeals([]);
      setStatistics(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Auto-detect farmer's location on component mount
  useEffect(() => {
    if (user && user.location?.district) {
      setLocation({
        state: user.location.state || '',
        district: user.location.district || '',
        village: user.location.village || ''
      });
    }
  }, [user]);

  // Remove auto-fetch on location change - only fetch on manual refresh
  // This prevents the annoying behavior of fetching on every keystroke

  // Format date
  const formatDate = (date) => {
    const now = new Date();
    const priceDate = new Date(date);
    const diffTime = Math.abs(now - priceDate);
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return priceDate.toLocaleDateString();
  };

  // Render trend icon
  const TrendIcon = ({ trend, priceChange }) => {
    if (trend === 'up') {
      return (
        <div className="flex items-center text-green-600">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span className="text-xs font-medium">+₹{Math.abs(priceChange)}</span>
        </div>
      );
    } else if (trend === 'down') {
      return (
        <div className="flex items-center text-red-600">
          <TrendingDown className="w-4 h-4 mr-1" />
          <span className="text-xs font-medium">-₹{Math.abs(priceChange)}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center text-gray-500">
        <Minus className="w-4 h-4 mr-1" />
        <span className="text-xs font-medium">No change</span>
      </div>
    );
  };

  // Empty state
  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        No dealers found in your area
      </h3>
      <p className="text-gray-500 mb-6">
        Try changing your location or selecting a different crop
      </p>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        Adjust Filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            💰 {t('priceAnalytics.title')}
          </h1>
          <p className="text-gray-600 text-lg">
            {t('priceAnalytics.description')}
          </p>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              {t('common.search')} {t('common.filter')}
            </h2>
            <button
              onClick={getUserLocation}
              className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {t('common.useMyLocation')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Crop Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('booking.crop')}
              </label>
              <div className="relative">
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">{t('common.all')} {t('booking.crops')}</option>
                  {cropOptions.map((crop) => (
                    <option key={crop.value} value={crop.value}>
                      {crop.icon} {crop.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                value={location.state}
                onChange={(e) => setLocation({ ...location, state: e.target.value })}
                placeholder="Telangana"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District *
              </label>
              <input
                type="text"
                value={location.district}
                onChange={(e) => setLocation({ ...location, district: e.target.value })}
                placeholder="Warangal"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="price">Highest Price</option>
                <option value="price-asc">Lowest Price</option>
                <option value="stock">Most Stock</option>
                <option value="recent">Recently Updated</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => fetchCropPrices(true)}
              disabled={refreshing}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Prices'}
            </button>

            {statistics && (
              <div className="flex gap-6 text-sm text-gray-600">
                <span>📊 Avg: ₹{statistics.avgPrice?.toFixed(0) || 0}/qtl</span>
                <span>📈 Max: ₹{statistics.maxPrice?.toFixed(0) || 0}/qtl</span>
                <span>📉 Min: ₹{statistics.minPrice?.toFixed(0) || 0}/qtl</span>
                <span>🏪 {statistics.dealerCount || 0} Dealers</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Deals Section */}
        <AnimatePresence>
          {topDeals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8"
            >
              <div className="flex items-center mb-4">
                <Award className="w-6 h-6 text-yellow-500 mr-2" />
                <h2 className="text-2xl font-bold text-gray-800">
                  🏆 Best Deals Near You
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topDeals.map((deal, index) => (
                  <motion.div
                    key={deal._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all"
                  >
                    <div className="absolute -top-3 -right-3 bg-yellow-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shadow-lg">
                      {index + 1}
                    </div>

                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {deal.dealerName || 'Unknown Dealer'}
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {deal.location?.district}, {deal.location?.state}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-green-600">
                          ₹{deal.buyPricePerQuintal}
                        </span>
                        <span className="text-gray-500 ml-2">/quintal</span>
                      </div>

                      <div className="flex items-baseline text-gray-700">
                        <span className="text-2xl font-semibold">
                          ₹{deal.buyPricePerKg}
                        </span>
                        <span className="text-gray-500 ml-1">/kg</span>
                      </div>

                      <div className="text-sm text-blue-600 font-medium">
                        🌾 {deal.cropName}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-yellow-200">
                        <div className="flex items-center text-sm text-gray-600">
                          <Package className="w-4 h-4 mr-1" />
                          {deal.minimumQuantity ? `Min: ${deal.minimumQuantity}kg` : 'Any quantity'}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          👁️ {deal.views || 0} views
                        </div>
                      </div>

                      <button 
                        onClick={() => handleOpenBooking(deal)}
                        className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all font-semibold shadow-md flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        Book Slot
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* All Prices Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <Search className="w-6 h-6 mr-2" />
            All Available Prices
          </h2>

          {loading ? (
            <div key="loading" className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
            </div>
          ) : !hasSearched ? (
            <div key="welcome" className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Ready to Find Best Prices
              </h3>
              <p className="text-gray-500 mb-6">
                Select your filters and click "Refresh Prices" to see dealer offers
              </p>
            </div>
          ) : cropPrices.length === 0 ? (
            <div key="empty">
              <EmptyState />
            </div>
          ) : (
            <div key="results" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cropPrices.map((price, index) => (
                <motion.div
                  key={price._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        {price.dealerName || 'Unknown Dealer'}
                      </h3>
                      <div className="flex items-center text-gray-500 text-sm mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {price.location?.district || 'Location not specified'}
                      </div>
                      {/* Dealer Rating */}
                      {price.dealer?.dealerInfo?.rating > 0 && (
                        <div className="flex items-center mt-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.round(price.dealer.dealerInfo.rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            {price.dealer.dealerInfo.rating.toFixed(1)} 
                            ({price.dealer.dealerInfo.totalRatings || 0})
                          </span>
                        </div>
                      )}
                    </div>
                    {price.status === 'active' && (
                      <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                        ✓ Active
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-600 mb-1">
                      🌾 {price.cropName}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-green-600">
                        ₹{price.buyPricePerQuintal}
                      </span>
                      <span className="text-gray-500 ml-2 text-sm">/quintal</span>
                    </div>
                    <div className="text-gray-700">
                      ₹{price.buyPricePerKg}/kg
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {price.minimumQuantity && (
                      <div className="flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        Min Quantity: {price.minimumQuantity} kg
                      </div>
                    )}
                    {price.availableFrom && price.availableTill && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Available: {price.availableFrom} - {price.availableTill}
                      </div>
                    )}
                    <div className="flex items-center text-xs">
                      👁️ {price.views || 0} views • 📞 {price.inquiries || 0} inquiries
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenBooking(price)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Book Slot
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {bookingModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseBooking}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Book Appointment</h3>
                  <button
                    onClick={handleCloseBooking}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <BookingForm 
                  dealerId={bookingModal.dealerId}
                  dealerName={bookingModal.dealerName}
                  cropName={bookingModal.cropName}
                  onSuccess={handleBookingSuccess}
                  onCancel={handleCloseBooking}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  <h3 className="text-2xl font-bold text-gray-900">Rate Your Experience</h3>
                  <button
                    onClick={handleCloseRating}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-600 mb-2">
                    How was your experience with <strong>{ratingModal.dealerName}</strong>?
                  </p>
                  <p className="text-sm text-gray-500">Crop: {ratingModal.cropName}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Your Rating
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
                    Your Review (Optional)
                  </label>
                  <textarea
                    value={ratingModal.review}
                    onChange={(e) => setRatingModal({ ...ratingModal, review: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows="4"
                    placeholder="Tell us about your experience..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCloseRating}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRatingSubmit}
                    disabled={ratingModal.rating === 0}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Submit Rating
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
                  : toast.type === 'error'
                  ? 'bg-red-600 text-white'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {toast.type === 'success' && <CheckCircle className="w-6 h-6" />}
              {toast.type === 'error' && <AlertCircle className="w-6 h-6" />}
              <p className="font-medium">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Booking Form Component
const BookingForm = ({ dealerId, dealerName, cropName, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    date: '',
    timeSlot: 'Morning',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const bookingData = {
      dealerId,
      cropName,
      date: formData.date,
      timeSlot: formData.timeSlot,
      notes: formData.notes
    };

    await onSuccess(bookingData);
    setLoading(false);
  };

  // Minimum date is tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <p className="text-sm text-gray-700">
          <strong>Dealer:</strong> {dealerName}
        </p>
        <p className="text-sm text-gray-700">
          <strong>Crop:</strong> {cropName}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date *
        </label>
        <input
          type="date"
          required
          min={minDateStr}
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Time Slot *
        </label>
        <select
          required
          value={formData.timeSlot}
          onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="Morning">Morning (9 AM - 12 PM)</option>
          <option value="Afternoon">Afternoon (12 PM - 4 PM)</option>
          <option value="Evening">Evening (4 PM - 7 PM)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes (Optional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          rows="3"
          placeholder="Any special requirements or notes..."
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Booking...' : 'Confirm Booking'}
        </button>
      </div>
    </form>
  );
};

export default CropPriceDashboard;
