import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import { toast } from 'react-toastify'

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFarmers: 0,
    totalDealers: 0,
    pendingDealers: 0,
    totalPrices: 0,
    totalBookings: 0,
  })
  const [pendingDealers, setPendingDealers] = useState([])
  const [users, setUsers] = useState([])
  const [prices, setPrices] = useState([])

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
        api.get('/admin/users'),
        api.get('/admin/prices'),
      ])
      
      console.log('Dashboard Stats Response:', statsRes.data)
      
      if (statsRes.data.statistics) {
        setStats(statsRes.data.statistics)
      }
      setPendingDealers(dealersRes.data.dealers || [])
      setUsers(usersRes.data.users || [])
      setPrices(pricesRes.data.prices || [])
    } catch (error) {
      toast.error('Failed to fetch admin data')
      console.error('Admin dashboard error:', error)
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
              <h1 className="text-2xl font-bold text-gray-900">👑 Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <span>🏠</span>
                <span>Home</span>
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Logout
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
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('dealers')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'dealers'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🏪 Dealer Approvals ({pendingDealers.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'users'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              👥 Users
            </button>
            <button
              onClick={() => setActiveTab('prices')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'prices'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              💰 Prices
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
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
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
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Farmers</p>
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
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Dealers</p>
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
                  <p className="text-sm font-medium text-gray-600 mb-1">Pending Approvals</p>
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
                  <p className="text-sm font-medium text-gray-600 mb-1">Prices Posted</p>
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
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Bookings</p>
                  <p className="text-4xl font-bold text-gray-900">{stats.totalBookings}</p>
                </div>
                <div className="bg-pink-100 p-4 rounded-full">
                  <span className="text-3xl">📦</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dealer Approvals Tab */}
        {activeTab === 'dealers' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Pending Dealer Approvals</h2>
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
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleRejectDealer(dealer._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {pendingDealers.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No pending dealer approvals
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-8">
            {/* Header with Statistics */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">👥 User Management</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">{users.filter(u => u.role === 'admin').length}</div>
                  <div className="text-sm text-gray-600 mt-1">Admins</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{users.filter(u => u.role === 'farmer').length}</div>
                  <div className="text-sm text-gray-600 mt-1">Farmers</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{users.filter(u => u.role === 'dealer').length}</div>
                  <div className="text-sm text-gray-600 mt-1">Dealers</div>
                </div>
              </div>
            </div>

            {/* System Admins Section */}
            {users.filter(u => u.role === 'admin').length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-xl font-bold text-gray-900">👑 System Administrators</h3>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                    {users.filter(u => u.role === 'admin').length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {users.filter(u => u.role === 'admin').map((user) => (
                    <div 
                      key={user._id} 
                      className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-purple-200"
                    >
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center text-2xl">
                            👑
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-lg">{user.name}</h4>
                            <span className="inline-block px-3 py-1 bg-purple-500 text-white rounded-full text-xs font-semibold mt-1">
                              SYSTEM ADMIN
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <span>📧</span>
                            <span className="truncate">{user.email}</span>
                          </div>
                          {user.createdAt && (
                            <div className="flex items-center gap-2 text-gray-600 text-xs pt-2 border-t border-purple-200">
                              <span>📅</span>
                              <span>Since: {new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Farmers and Dealers Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Farmers Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 sticky top-0 bg-gradient-to-br from-purple-50 to-pink-50 py-3 px-4 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900">👨‍🌾 Farmers</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    {users.filter(u => u.role === 'farmer').length}
                  </span>
                </div>
                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                  {users.filter(u => u.role === 'farmer').map((user) => (
                    <div 
                      key={user._id} 
                      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 border-green-500"
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-xl">
                              👨‍🌾
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{user.name}</h4>
                              <span className="text-xs text-gray-500">Farmer</span>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm mb-3">
                          <div className="flex items-center gap-2 text-gray-600">
                            <span>📧</span>
                            <span className="truncate">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <span>📱</span>
                              <span>{user.phone}</span>
                            </div>
                          )}
                          {user.createdAt && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                              <span>📅</span>
                              <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => handleToggleUserStatus(user._id)}
                            className={`flex-1 px-3 py-2 rounded-lg font-semibold text-xs transition-all duration-200 ${
                              user.isActive
                                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {user.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold text-xs transition-all duration-200"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {users.filter(u => u.role === 'farmer').length === 0 && (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                      <div className="text-4xl mb-2">👨‍🌾</div>
                      <p className="text-gray-500 text-sm">No farmers yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Dealers Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 sticky top-0 bg-gradient-to-br from-purple-50 to-pink-50 py-3 px-4 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900">🏪 Dealers</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {users.filter(u => u.role === 'dealer').length}
                  </span>
                </div>
                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                  {users.filter(u => u.role === 'dealer').map((user) => (
                    <div 
                      key={user._id} 
                      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 border-blue-500"
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-xl">
                              🏪
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{user.name}</h4>
                              <span className="text-xs text-gray-500">Dealer</span>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm mb-3">
                          <div className="flex items-center gap-2 text-gray-600">
                            <span>�</span>
                            <span className="truncate">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <span>📱</span>
                              <span>{user.phone}</span>
                            </div>
                          )}
                          {user.dealerInfo?.businessName && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <span>🏢</span>
                              <span className="truncate">{user.dealerInfo.businessName}</span>
                            </div>
                          )}
                          {user.dealerInfo?.approved !== undefined && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                user.dealerInfo.approved 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-orange-100 text-orange-700'
                              }`}>
                                {user.dealerInfo.approved ? '✓ Approved' : '⏳ Pending'}
                              </span>
                            </div>
                          )}
                          {user.createdAt && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                              <span>📅</span>
                              <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => handleToggleUserStatus(user._id)}
                            className={`flex-1 px-3 py-2 rounded-lg font-semibold text-xs transition-all duration-200 ${
                              user.isActive
                                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {user.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold text-xs transition-all duration-200"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {users.filter(u => u.role === 'dealer').length === 0 && (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                      <div className="text-4xl mb-2">🏪</div>
                      <p className="text-gray-500 text-sm">No dealers yet</p>
                    </div>
                  )}
                </div>
              </div>

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
