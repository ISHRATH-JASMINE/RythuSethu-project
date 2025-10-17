import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/translations';
import api from '../utils/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const StorageFinder = () => {
  const { language } = useLanguage();
  const [searchType, setSearchType] = useState('pincode'); // 'pincode' or 'gps'
  const [pincode, setPincode] = useState('');
  const [storageType, setStorageType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [storages, setStorages] = useState([]);
  const [searchLocation, setSearchLocation] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [error, setError] = useState('');

  const storageTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'Cold Storage', label: 'Cold Storage' },
    { value: 'Mandi', label: 'Mandi' },
    { value: 'Warehouse', label: 'Warehouse' },
    { value: 'Processing Unit', label: 'Processing Unit' }
  ];

  // Search by pincode
  const handlePincodeSearch = async (e) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const typeParam = storageType !== 'all' ? `?type=${storageType}` : '';
      const response = await api.get(`/storage/pincode/${pincode}${typeParam}`);
      
      setStorages(response.data.storages || []);
      setSearchLocation(response.data.searchLocation || null);
      
      if (response.data.storages.length === 0) {
        setError('No cold storages found for this pincode');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to fetch cold storages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Search using GPS
  const handleGPSSearch = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const typeParam = storageType !== 'all' ? `&type=${storageType}` : '';
          const response = await api.get(
            `/storage/nearby?latitude=${latitude}&longitude=${longitude}&radius=100${typeParam}`
          );
          
          setStorages(response.data.storages || []);
          setSearchLocation({ latitude, longitude });
          
          if (response.data.storages.length === 0) {
            setError('No cold storages found within 100km radius');
          }
        } catch (err) {
          console.error('GPS search error:', err);
          setError('Failed to fetch nearby cold storages');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        setError(`GPS error: ${err.message}. Please enable location services.`);
      }
    );
  };

  // Get storage type icon
  const getStorageIcon = (type) => {
    switch (type) {
      case 'Cold Storage': return '❄️';
      case 'Mandi': return '🏪';
      case 'Warehouse': return '🏭';
      case 'Processing Unit': return '🏗️';
      default: return '📦';
    }
  };

  // Get facility icon
  const getFacilityIcon = (service) => {
    switch (service) {
      case 'grading': return '📊';
      case 'packaging': return '📦';
      case 'transport': return '🚛';
      case 'auction': return '🔨';
      default: return '✓';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4 shadow-lg">
            <span className="text-4xl">❄️</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3">
            {t('coldStorageFinder', language)}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Find nearby cold storages, mandis, and warehouses to store your produce safely
          </p>
        </div>

        {/* Search Card */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Search Type Tabs */}
            <div className="flex bg-gradient-to-r from-green-500 to-blue-500">
              <button
                onClick={() => setSearchType('pincode')}
                className={`flex-1 py-4 px-6 font-semibold transition-all ${
                  searchType === 'pincode'
                    ? 'bg-white text-green-600'
                    : 'text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl">📮</span>
                  <span>{t('searchByPincode', language)}</span>
                </div>
              </button>
              <button
                onClick={() => setSearchType('gps')}
                className={`flex-1 py-4 px-6 font-semibold transition-all ${
                  searchType === 'gps'
                    ? 'bg-white text-blue-600'
                    : 'text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl">📍</span>
                  <span>{t('useMyLocation', language)}</span>
                </div>
              </button>
            </div>

            <div className="p-8">
              {/* Storage Type Filter */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3 flex items-center">
                  <span className="mr-2">🏪</span>
                  {t('storageType', language)}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {storageTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setStorageType(type.value)}
                      className={`py-3 px-4 rounded-xl font-medium transition-all ${
                        storageType === type.value
                          ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg transform scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pincode Search */}
              {searchType === 'pincode' && (
                <form onSubmit={handlePincodeSearch} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-3">
                      {t('pincode', language)}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="e.g., 500001, 506002"
                        className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        maxLength={6}
                      />
                      <span className="absolute right-4 top-4 text-2xl">📮</span>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-xl transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Searching...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {t('search', language)}
                      </div>
                    )}
                  </button>
                </form>
              )}

              {/* GPS Search */}
              {searchType === 'gps' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-xl">
                    <div className="flex items-start">
                      <span className="text-3xl mr-4">📍</span>
                      <div>
                        <h3 className="font-semibold text-blue-900 mb-2">Use Your Current Location</h3>
                        <p className="text-blue-700">
                          Click the button below to automatically find cold storages within 100km of your current location
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleGPSSearch}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Detecting Location...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Find Storages Near Me
                      </div>
                    )}
                  </button>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">⚠️</span>
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {storages.length > 0 && (
          <div className="max-w-7xl mx-auto">
            {/* Results Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">
                    Found {storages.length} Storage{storages.length > 1 ? 's' : ''}
                  </h2>
                  <p className="text-gray-600">
                    Sorted by distance from your location
                  </p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold">
                  ✓ Results Ready
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Storage List */}
              <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-gray-200">
                {storages.map((storage, index) => (
                  <div
                    key={storage._id}
                    onClick={() => setSelectedStorage(storage)}
                    className={`bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                      selectedStorage?._id === storage._id ? 'ring-4 ring-green-500 shadow-2xl' : ''
                    }`}
                  >
                    {/* Card Header with Gradient */}
                    <div className={`p-6 ${
                      storage.type === 'Cold Storage' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                      storage.type === 'Mandi' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                      'bg-gradient-to-r from-purple-500 to-purple-600'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center flex-1">
                          <span className="text-5xl mr-4">{getStorageIcon(storage.type)}</span>
                          <div className="text-white">
                            <h3 className="text-2xl font-bold mb-1">{storage.name}</h3>
                            <div className="flex items-center space-x-3">
                              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                                {storage.type}
                              </span>
                              {storage.governmentApproved && (
                                <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Verified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {storage.distance !== null && (
                          <div className="bg-white text-gray-800 px-4 py-2 rounded-xl font-bold text-lg shadow-lg">
                            📍 {storage.distanceText}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Address */}
                      <div className="mb-4 flex items-start">
                        <svg className="w-6 h-6 mr-3 mt-0.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-gray-700 font-medium">
                          {storage.address.village && `${storage.address.village}, `}
                          {storage.address.mandal && `${storage.address.mandal}, `}
                          {storage.address.district}, {storage.address.state} - {storage.address.pincode}
                        </p>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">📦</span>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-200 px-2 py-1 rounded-full">Capacity</span>
                          </div>
                          <p className="text-2xl font-bold text-blue-700">
                            {storage.facilities.capacity.value}
                          </p>
                          <p className="text-sm text-blue-600">{storage.facilities.capacity.unit}</p>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">⭐</span>
                            <span className="text-xs font-semibold text-yellow-600 bg-yellow-200 px-2 py-1 rounded-full">Rating</span>
                          </div>
                          <p className="text-2xl font-bold text-yellow-700">
                            {storage.rating}/5
                          </p>
                          <p className="text-sm text-yellow-600">Customer Rating</p>
                        </div>
                      </div>

                      {/* Services */}
                      {storage.services && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <span className="mr-2">🔧</span>
                            Available Services
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {storage.services.grading && (
                              <span className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-4 py-2 rounded-full text-sm font-medium border border-green-300">
                                📊 Grading
                              </span>
                            )}
                            {storage.services.packaging && (
                              <span className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-4 py-2 rounded-full text-sm font-medium border border-purple-300">
                                📦 Packaging
                              </span>
                            )}
                            {storage.services.transport && (
                              <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-4 py-2 rounded-full text-sm font-medium border border-blue-300">
                                🚛 Transport
                              </span>
                            )}
                            {storage.services.auction && (
                              <span className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 px-4 py-2 rounded-full text-sm font-medium border border-orange-300">
                                🔨 Auction
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Contact */}
                      {storage.contact.phone && (
                        <div className="border-t pt-4">
                          <a
                            href={`tel:${storage.contact.phone}`}
                            className="block w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-center font-bold py-3 px-6 rounded-xl transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-center">
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              Call {storage.contact.phone}
                            </div>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Map */}
              {searchLocation && (
                <div className="lg:sticky lg:top-4">
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4">
                      <h3 className="text-white font-bold text-lg flex items-center">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Interactive Map View
                      </h3>
                      <p className="text-white text-sm opacity-90 mt-1">Click markers to view details</p>
                    </div>
                    <div className="h-[800px]">
                      <MapContainer
                        center={[searchLocation.latitude, searchLocation.longitude]}
                        zoom={10}
                        style={{ height: '100%', width: '100%' }}
                        className="z-0"
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        
                        {/* Search location marker */}
                        <Marker position={[searchLocation.latitude, searchLocation.longitude]}>
                          <Popup>
                            <div className="p-2">
                              <strong className="text-blue-600 text-lg">📍 Your Location</strong>
                              <p className="text-gray-600 text-sm mt-1">Search starting point</p>
                            </div>
                          </Popup>
                        </Marker>

                        {/* Storage markers */}
                        {storages.map((storage) => (
                          <Marker
                            key={storage._id}
                            position={[
                              storage.location.coordinates[1],
                              storage.location.coordinates[0]
                            ]}
                          >
                            <Popup maxWidth={300}>
                              <div className="p-3">
                                <div className="flex items-center mb-2">
                                  <span className="text-3xl mr-2">{getStorageIcon(storage.type)}</span>
                                  <div>
                                    <h4 className="font-bold text-lg text-gray-800">{storage.name}</h4>
                                    <span className="text-xs text-gray-500">{storage.type}</span>
                                  </div>
                                </div>
                                
                                <div className="border-t pt-2 mt-2">
                                  <p className="text-sm text-gray-700 mb-2">
                                    📍 {storage.address.district}, {storage.address.state}
                                  </p>
                                  
                                  {storage.distance !== null && (
                                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm font-semibold mb-2 inline-block">
                                      {storage.distanceText} away
                                    </div>
                                  )}
                                  
                                  <div className="mt-2 pt-2 border-t">
                                    <p className="text-xs text-gray-600 mb-1">
                                      📦 Capacity: {storage.facilities.capacity.value} {storage.facilities.capacity.unit}
                                    </p>
                                    <p className="text-xs text-gray-600 mb-2">
                                      ⭐ Rating: {storage.rating}/5
                                    </p>
                                  </div>
                                  
                                  {storage.contact.phone && (
                                    <a
                                      href={`tel:${storage.contact.phone}`}
                                      className="block w-full bg-green-600 hover:bg-green-700 text-white text-center font-medium py-2 px-4 rounded-lg text-sm mt-2 transition"
                                    >
                                      📞 Call Now
                                    </a>
                                  )}
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                      </MapContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && storages.length === 0 && !error && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-4">
                <span className="text-6xl">❄️</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Ready to Find Storage Facilities
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              Enter a pincode or use your location to discover nearby cold storages, mandis, and warehouses
            </p>
            <div className="flex justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="mr-2">✓</span>
                <span>21+ Facilities</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Verified Contacts</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Distance Sorted</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorageFinder;
