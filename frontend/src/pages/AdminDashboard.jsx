import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../utils/api'
import { toast } from 'react-toastify'

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalFarmers: 0,
    totalDealers: 0,
    pendingDealers: 0,
    totalPrices: 0,
    totalBookings: 0,
  })
  const [pendingDealers, setPendingDealers] = useState([])
  const [users, setUsers] = useState([])
  const [prices, setPrices] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query) ||
      user.dealerInfo?.businessName?.toLowerCase().includes(query) ||
      user.dealerInfo?.location?.district?.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Access denied. Admin only.')
      navigate('/login')
      return
    }
    fetchDashboardData()
  }, [user, navigate])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, dealersRes, usersRes, pricesRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/dealers/pending'),
        api.get('/admin/users?limit=100'),
        api.get('/admin/prices'),
      ])
      
      console.log('Dashboard Stats Response:', statsRes.data)
      console.log('Users Response:', usersRes.data)
      console.log('Users Count:', usersRes.data.users?.length)
      
      if (statsRes.data.statistics) {
        setStats(statsRes.data.statistics)
      }
      setPendingDealers(dealersRes.data.dealers || [])
      setUsers(usersRes.data.users || [])
      setPrices(pricesRes.data.prices || [])
    } catch (error) {
      // Silently handle admin data fetch errors
      console.error('Admin dashboard error:', error)
      // Set default empty values
      setPendingDealers([])
      setUsers([])
      setPrices([])
    }
  }

  const handleApproveDealer = async (dealerId) => {
    try {
      await api.put(`/admin/dealers/${dealerId}/approve`)
      toast.success('Dealer approved successfully')
      fetchDashboardData()
    } catch (error) {
      toast.error('Failed to approve dealer')
    }
  }

  const handleRejectDealer = async (dealerId) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return
    try {
      await api.put(`/admin/dealers/${dealerId}/reject`, { reason })
      toast.success('Dealer rejected')
      fetchDashboardData()
    } catch (error) {
      toast.error('Failed to reject dealer')
    }
  }

  const handleToggleUserStatus = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-active`)
      toast.success('User status updated')
      fetchDashboardData()
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    try {
      await api.delete(`/admin/users/${userId}`)
      toast.success('User deleted successfully')
      fetchDashboardData()
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">👑 {t('common.adminDashboard')}</h1>
              <p className="text-sm text-gray-600">{t('common.welcome')}, {user?.name}</p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <span>🏠</span>
                <span>{t('common.home')}</span>
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                {t('common.logout')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'dashboard'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 {t('dashboard.overview')}
            </button>
            <button
              onClick={() => setActiveTab('dealers')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'dealers'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🏪 {t('dealer.approvals')} ({pendingDealers.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'users'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              👥 {t('common.users')}
            </button>
            <button
              onClick={() => setActiveTab('prices')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'prices'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              💰 {t('priceAnalytics.prices')}
            </button>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Users Card */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{t('common.totalUsers')}</p>
                  <p className="text-4xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <div className="bg-purple-100 p-4 rounded-full">
                  <span className="text-3xl">👥</span>
                </div>
              </div>
            </div>

            {/* Total Farmers Card */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{t('common.totalFarmers')}</p>
                  <p className="text-4xl font-bold text-gray-900">{stats.totalFarmers}</p>
                </div>
                <div className="bg-green-100 p-4 rounded-full">
                  <span className="text-3xl">👨‍🌾</span>
                </div>
              </div>
            </div>

            {/* Total Dealers Card */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{t('dealer.totalDealers')}</p>
                  <p className="text-4xl font-bold text-gray-900">{stats.totalDealers}</p>
                </div>
                <div className="bg-blue-100 p-4 rounded-full">
                  <span className="text-3xl">🏪</span>
                </div>
              </div>
            </div>

            {/* Pending Approvals Card */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{t('dealer.pendingApprovals')}</p>
                  <p className="text-4xl font-bold text-gray-900">{stats.pendingDealers}</p>
                </div>
                <div className="bg-yellow-100 p-4 rounded-full">
                  <span className="text-3xl">⏳</span>
                </div>
              </div>
            </div>

            {/* Total Prices Card */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{t('priceAnalytics.pricesPosted')}</p>
                  <p className="text-4xl font-bold text-gray-900">{stats.totalPrices}</p>
                </div>
                <div className="bg-indigo-100 p-4 rounded-full">
                  <span className="text-3xl">💰</span>
                </div>
              </div>
            </div>

            {/* Total Bookings Card */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-pink-500">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{t('dealer.totalBookings')}</p>
                  <p className="text-4xl font-bold text-gray-900">{stats.totalBookings}</p>
                </div>
                <div className="bg-pink-100 p-4 rounded-full">
                  <span className="text-3xl">📦</span>
                </div>
              </div>
            </div>

            {/* Community Forum Card */}
            <Link 
              to="/forum"
              className="bg-gradient-to-br from-purple-500 to-blue-500 p-6 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white mb-1">💬 Community Forum</p>
                  <p className="text-lg font-semibold text-white">Moderate discussions</p>
                  <p className="text-xs text-purple-100 mt-2">Pin/Delete posts • Manage community</p>
                </div>
                <div className="bg-white bg-opacity-20 p-4 rounded-full">
                  <span className="text-3xl">🛡️</span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Dealer Approvals Tab */}
        {activeTab === 'dealers' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">{t('dealer.pendingApprovals')}</h2>
            <div className="space-y-4">
              {pendingDealers.map((dealer) => (
                <div key={dealer._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{dealer.dealerInfo?.businessName}</h3>
                      <p className="text-sm text-gray-600">Owner: {dealer.name}</p>
                      <p className="text-sm text-gray-600">Email: {dealer.email}</p>
                      <p className="text-sm text-gray-600">Phone: {dealer.phone}</p>
                      {dealer.dealerInfo?.gstNumber && (
                        <p className="text-sm text-gray-600">GST: {dealer.dealerInfo.gstNumber}</p>
                      )}
                      {dealer.dealerInfo?.licenseNumber && (
                        <p className="text-sm text-gray-600">License: {dealer.dealerInfo.licenseNumber}</p>
                      )}
                      {dealer.dealerInfo?.specialization?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {dealer.dealerInfo.specialization.map((spec, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveDealer(dealer._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        ✓ {t('dealer.approve')}
                      </button>
                      <button
                        onClick={() => handleRejectDealer(dealer._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        ✕ {t('dealer.reject')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {pendingDealers.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  {t('dealer.noPendingApprovals')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Header with Statistics */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2 text-gray-900 flex items-center gap-3">
                    <span className="text-4xl">👥</span>
                    User Management
                  </h2>
                  <p className="text-gray-600 mb-4">Manage all system users and their access</p>
                  
                  {/* Search Input */}
                  <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-xl">🔍</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Search by name, email, phone, or business..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        <span className="text-xl">✕</span>
                      </button>
                    )}
                  </div>
                  {searchQuery && (
                    <div className="mt-2 text-sm text-gray-600">
                      Found <span className="font-bold text-purple-600">{filteredUsers.length}</span> user{filteredUsers.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div className="text-right bg-gradient-to-br from-purple-50 to-blue-50 px-6 py-4 rounded-xl border border-purple-200">
                  <div className="text-4xl font-bold text-purple-600">{users.length}</div>
                  <div className="text-gray-600 text-sm font-medium">Total Users</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-2xl shadow-md">👑</div>
                    <div>
                      <div className="text-3xl font-bold text-purple-700">{filteredUsers.filter(u => u.role === 'admin').length}</div>
                      <div className="text-sm text-purple-600 font-semibold">System Admins</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-2xl shadow-md">👨‍🌾</div>
                    <div>
                      <div className="text-3xl font-bold text-green-700">{filteredUsers.filter(u => u.role === 'farmer').length}</div>
                      <div className="text-sm text-green-600 font-semibold">Farmers</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-2xl shadow-md">🏪</div>
                    <div>
                      <div className="text-3xl font-bold text-blue-700">{filteredUsers.filter(u => u.role === 'dealer').length}</div>
                      <div className="text-sm text-blue-600 font-semibold">Dealers</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Admins Section - Card Format */}
            {filteredUsers.filter(u => u.role === 'admin').length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-xl">👑</div>
                    <h3 className="text-2xl font-bold text-gray-900">System Administrators</h3>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                      {filteredUsers.filter(u => u.role === 'admin').length}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUsers.filter(u => u.role === 'admin').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((user) => (
                    <div 
                      key={user._id} 
                      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-purple-200 transform hover:-translate-y-1"
                    >
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center text-3xl border-2 border-white">
                            👑
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-white text-lg mb-1">{user.name}</h4>
                            <span className="inline-block px-3 py-1 bg-white bg-opacity-30 text-white rounded-full text-xs font-bold backdrop-blur-sm">
                              SYSTEM ADMIN
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg">
                            <span className="text-xl">📧</span>
                            <span className="truncate text-sm font-medium">{user.email}</span>
                          </div>
                          {user.createdAt && (
                            <div className="flex items-center gap-3 text-gray-600 bg-purple-50 p-3 rounded-lg border border-purple-100">
                              <span className="text-lg">📅</span>
                              <div>
                                <div className="text-xs text-purple-600 font-semibold uppercase">Joined</div>
                                <div className="text-sm font-bold text-purple-700">{new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Farmers Table */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-xl">👨‍🌾</div>
                  <h3 className="text-2xl font-bold text-gray-900">Farmers</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                    {filteredUsers.filter(u => u.role === 'farmer').length}
                  </span>
                </div>
              </div>
              
              {filteredUsers.filter(u => u.role === 'farmer').length > 0 ? (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Farmer</th>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Contact Info</th>
                          <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Joined</th>
                          <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredUsers.filter(u => u.role === 'farmer').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((user, index) => (
                          <tr 
                            key={user._id} 
                            className={`hover:bg-green-50 transition-colors ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                          >
                            {/* Farmer Info */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-gray-900 text-base">{user.name}</div>
                                  <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <span>👨‍🌾</span>
                                    <span>Farmer</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            
                            {/* Contact */}
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <span className="text-base">📧</span>
                                  <span className="truncate max-w-[250px]" title={user.email}>{user.email}</span>
                                </div>
                                {user.phone && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span className="text-base">📱</span>
                                    <span>{user.phone}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            
                            {/* Status */}
                            <td className="px-6 py-4">
                              <div className="flex justify-center">
                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${
                                  user.isActive 
                                    ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                                    : 'bg-red-100 text-red-800 border-2 border-red-300'
                                }`}>
                                  <span className={`w-2.5 h-2.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </td>
                            
                            {/* Joined Date */}
                            <td className="px-6 py-4 text-center">
                              {user.createdAt ? (
                                <div className="text-sm">
                                  <div className="font-semibold text-gray-900">
                                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(user.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            
                            {/* Actions */}
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleToggleUserStatus(user._id)}
                                  className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                                    user.isActive
                                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                                      : 'bg-green-500 text-white hover:bg-green-600'
                                  }`}
                                  title={user.isActive ? 'Deactivate User' : 'Activate User'}
                                >
                                  {user.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user._id)}
                                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold text-xs transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                  title="Delete User"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
                  <div className="text-6xl mb-4">👨‍🌾</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Farmers Yet</h3>
                  <p className="text-gray-600">Farmers will appear here once they register</p>
                </div>
              )}
            </div>

            {/* Dealers Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-xl">🏪</div>
                  <h3 className="text-2xl font-bold text-gray-900">Dealers</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                    {filteredUsers.filter(u => u.role === 'dealer').length}
                  </span>
                </div>
              </div>
              
              {filteredUsers.filter(u => u.role === 'dealer').length > 0 ? (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                  <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Dealer</th>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Contact Info</th>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Business Details</th>
                          <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Joined</th>
                          <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredUsers.filter(u => u.role === 'dealer').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((user, index) => (
                          <tr 
                            key={user._id} 
                            className={`hover:bg-blue-50 transition-colors ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                          >
                            {/* Dealer Info */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-gray-900 text-base">{user.name}</div>
                                  <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <span>🏪</span>
                                    <span>Dealer</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            
                            {/* Contact */}
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <span className="text-base">📧</span>
                                  <span className="truncate max-w-[200px]" title={user.email}>{user.email}</span>
                                </div>
                                {user.phone && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span className="text-base">📱</span>
                                    <span>{user.phone}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            
                            {/* Business Details */}
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                {user.dealerInfo?.businessName && (
                                  <div className="font-medium text-gray-900 text-sm flex items-center gap-2">
                                    <span>🏢</span>
                                    <span className="truncate max-w-[180px]" title={user.dealerInfo.businessName}>{user.dealerInfo.businessName}</span>
                                  </div>
                                )}
                                {user.dealerInfo?.location?.district && (
                                  <div className="text-xs text-gray-600 flex items-center gap-2">
                                    <span>📍</span>
                                    <span>{user.dealerInfo.location.district}, {user.dealerInfo.location.state}</span>
                                  </div>
                                )}
                                {!user.dealerInfo?.businessName && (
                                  <span className="text-xs text-gray-400 italic">No business info</span>
                                )}
                              </div>
                            </td>
                            
                            {/* Status */}
                            <td className="px-6 py-4">
                              <div className="flex flex-col items-center gap-2">
                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${
                                  user.isActive 
                                    ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                                    : 'bg-red-100 text-red-800 border-2 border-red-300'
                                }`}>
                                  <span className={`w-2.5 h-2.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                                {user.dealerInfo?.approved !== undefined && (
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                    user.dealerInfo.approved 
                                      ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                                      : 'bg-orange-100 text-orange-800 border border-orange-300'
                                  }`}>
                                    {user.dealerInfo.approved ? '✓ Approved' : '⏳ Pending'}
                                  </span>
                                )}
                              </div>
                            </td>
                            
                            {/* Joined Date */}
                            <td className="px-6 py-4 text-center">
                              {user.createdAt ? (
                                <div className="text-sm">
                                  <div className="font-semibold text-gray-900">
                                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(user.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            
                            {/* Actions */}
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleToggleUserStatus(user._id)}
                                  className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                                    user.isActive
                                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                                      : 'bg-green-500 text-white hover:bg-green-600'
                                  }`}
                                  title={user.isActive ? 'Deactivate User' : 'Activate User'}
                                >
                                  {user.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user._id)}
                                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold text-xs transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                  title="Delete User"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
                  <div className="text-6xl mb-4">🏪</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Dealers Yet</h3>
                  <p className="text-gray-600">Dealers will appear here once they register</p>
                </div>
              )}
            </div>

            {users.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Users Found</h3>
                <p className="text-gray-600">There are no users in the system yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Prices Tab */}
        {activeTab === 'prices' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">All Prices</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Crop</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Variety</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Posted By</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {prices.map((price) => (
                    <tr key={price._id}>
                      <td className="px-4 py-3 text-sm font-semibold">{price.cropName}</td>
                      <td className="px-4 py-3 text-sm">{price.variety || '-'}</td>
                      <td className="px-4 py-3 text-sm text-green-600 font-semibold">
                        ₹{price.price}/{price.unit}
                      </td>
                      <td className="px-4 py-3 text-sm">{price.postedBy?.name}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          price.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {price.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
