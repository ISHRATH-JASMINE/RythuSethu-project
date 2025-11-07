import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { t } from '../utils/translations'
import api from '../utils/api'
import { FaExternalLinkAlt, FaSearch, FaInfoCircle, FaCheckCircle, FaUserCheck, FaRupeeSign } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'

const Schemes = () => {
  const { language } = useLanguage()
  const [schemes, setSchemes] = useState([])
  const [filteredSchemes, setFilteredSchemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('')
  const [selectedScheme, setSelectedScheme] = useState(null)

  useEffect(() => {
    fetchSchemes()
  }, [category])

  const fetchSchemes = async () => {
    try {
      const { data } = await api.get(`/schemes?category=${category}`)
      setSchemes(data)
      setFilteredSchemes(data)
    } catch (error) {
      console.error('Error fetching schemes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const filtered = schemes.filter(scheme =>
      scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredSchemes(filtered)
  }, [searchTerm, schemes])

  const getCategoryColor = (cat) => {
    const colors = {
      financial: 'bg-green-100 text-green-800 border-green-200',
      credit: 'bg-blue-100 text-blue-800 border-blue-200',
      insurance: 'bg-purple-100 text-purple-800 border-purple-200',
      advisory: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      market: 'bg-pink-100 text-pink-800 border-pink-200',
      irrigation: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      transport: 'bg-orange-100 text-orange-800 border-orange-200',
    }
    return colors[cat] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getCategoryIcon = (cat) => {
    const icons = {
      financial: '💰',
      credit: '💳',
      insurance: '🛡️',
      advisory: '📊',
      market: '🏪',
      irrigation: '💧',
      transport: '🚂',
    }
    return icons[cat] || '📄'
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <span className="text-5xl">📄</span>
          {t('schemes.title', language)}
        </h1>
        <p className="text-gray-600 text-lg">
          {t('schemes.details', language)}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <p className="text-2xl font-bold text-green-700">{schemes.length}</p>
          <p className="text-sm text-green-600">{t('common.total')} {t('schemes.title')}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <p className="text-2xl font-bold text-blue-700">
            {schemes.filter(s => s.state === 'All India').length}
          </p>
          <p className="text-sm text-blue-600">{t('schemes.allIndia')}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <p className="text-2xl font-bold text-purple-700">
            {schemes.filter(s => s.category === 'financial').length}
          </p>
          <p className="text-sm text-purple-600">{t('schemes.financial')}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <p className="text-2xl font-bold text-orange-700">
            {filteredSchemes.length}
          </p>
          <p className="text-sm text-orange-600">{t('common.showing')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaSearch className="text-green-600" />
          {t('common.search')} & {t('common.filter')} {t('schemes.title')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder={t('schemes.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">{t('common.all')} {t('schemes.categories')} ({schemes.length})</option>
              <option value="financial">💰 {t('schemes.financial')} ({schemes.filter(s => s.category === 'financial').length})</option>
              <option value="credit">💳 {t('schemes.credit')} ({schemes.filter(s => s.category === 'credit').length})</option>
              <option value="insurance">🛡️ {t('schemes.insurance')} ({schemes.filter(s => s.category === 'insurance').length})</option>
              <option value="advisory">📊 {t('schemes.advisory')} ({schemes.filter(s => s.category === 'advisory').length})</option>
              <option value="market">🏪 {t('schemes.market')} ({schemes.filter(s => s.category === 'market').length})</option>
              <option value="irrigation">💧 {t('schemes.irrigation')} ({schemes.filter(s => s.category === 'irrigation').length})</option>
              <option value="transport">🚂 {t('schemes.transport')} ({schemes.filter(s => s.category === 'transport').length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schemes List */}
      {filteredSchemes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSchemes.map((scheme) => (
            <motion.div
              key={scheme.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-200"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-3xl">{getCategoryIcon(scheme.category)}</span>
                      <h3 className="text-xl font-bold text-gray-800">{scheme.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 italic">{scheme.fullName}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(scheme.category)}`}>
                    {scheme.category.toUpperCase()}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-4 leading-relaxed">{scheme.description}</p>
                
                {/* Benefits & Eligibility */}
                <div className="space-y-3 mb-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-start gap-2">
                      <FaRupeeSign className="text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-green-800 mb-1">{t('schemes.benefits')}</p>
                        <p className="text-sm text-green-700">{scheme.benefits}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2">
                      <FaUserCheck className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-blue-800 mb-1">{t('schemes.eligibility')}</p>
                        <p className="text-sm text-blue-700">{scheme.eligibility}</p>
                      </div>
                    </div>
                  </div>
                  {scheme.howToApply && (
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-start gap-2">
                        <FaInfoCircle className="text-purple-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-purple-800 mb-1">{t('schemes.howToApply')}</p>
                          <p className="text-sm text-purple-700">{scheme.howToApply}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="px-3 py-1 bg-gray-100 rounded-full font-medium">
                      📍 {scheme.state}
                    </span>
                  </div>
                  <a
                    href={scheme.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md hover:shadow-lg"
                  >
                    <span>{t('schemes.apply')}</span>
                    <FaExternalLinkAlt size={14} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('common.noData')}</h3>
          <p className="text-gray-500">{t('schemes.noSchemesMessage')}</p>
          <button
            onClick={() => {
              setSearchTerm('')
              setCategory('')
            }}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            {t('common.clearFilters')}
          </button>
        </div>
      )}
    </div>
  )
}

export default Schemes
