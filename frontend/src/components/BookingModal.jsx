import { useState } from 'react';
import { X, Calendar, Clock, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const BookingModal = ({ isOpen, onClose, dealer, cropName, onBookingSuccess }) => {
  const [formData, setFormData] = useState({
    date: '',
    timeSlot: 'Morning',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.date) {
      toast.error('Please select a date');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/bookings', {
        dealerId: dealer._id,
        cropName,
        date: formData.date,
        timeSlot: formData.timeSlot,
        notes: formData.notes
      });

      toast.success('Booking confirmed successfully! 🎉');
      
      // Reset form
      setFormData({
        date: '',
        timeSlot: 'Morning',
        notes: ''
      });

      if (onBookingSuccess) {
        onBookingSuccess(response.data.booking);
      }

      onClose();
    } catch (error) {
      console.error('Booking error:', error);
      const message = error.response?.data?.message || 'Failed to create booking';
      
      if (error.response?.data?.conflict) {
        toast.error(message, {
          duration: 4000,
          icon: '⚠️'
        });
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Book Appointment</h2>
            <p className="text-sm text-green-100">Schedule a meeting with dealer</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Dealer Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {dealer.name?.[0]?.toUpperCase() || 'D'}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{dealer.name}</h3>
                <p className="text-sm text-gray-600">
                  {dealer.dealerInfo?.businessName || 'Dealer'}
                </p>
                {dealer.location?.district && (
                  <p className="text-xs text-gray-500">📍 {dealer.location.district}</p>
                )}
              </div>
            </div>
          </div>

          {/* Crop Name */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-gray-600">Crop</p>
            <p className="font-semibold text-gray-900 capitalize">🌾 {cropName}</p>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Select Date *
            </label>
            <input
              type="date"
              min={getTomorrowDate()}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Select a future date for the appointment</p>
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Time Slot *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['Morning', 'Afternoon', 'Evening'].map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setFormData({ ...formData, timeSlot: slot })}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    formData.timeSlot === slot
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {slot === 'Morning' && '🌅'}
                  {slot === 'Afternoon' && '☀️'}
                  {slot === 'Evening' && '🌙'}
                  <div className="text-xs mt-1">
                    {slot === 'Morning' && '9-12 AM'}
                    {slot === 'Afternoon' && '12-4 PM'}
                    {slot === 'Evening' && '4-7 PM'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Additional Notes (Optional)
            </label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any specific requirements or questions..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Booking...
                </span>
              ) : (
                '✓ Confirm Booking'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
