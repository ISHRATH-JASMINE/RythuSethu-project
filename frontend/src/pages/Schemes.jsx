import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { t } from '../utils/translations'
import api from '../utils/api'
import { FaExternalLinkAlt, FaSearch } from 'react-icons/fa'
import { toast } from 'react-toastify'

const Schemes = () => {
  const { language } = useLanguage()
  const [schemes, setSchemes] = useState([])
  const [filteredSchemes, setFilteredSchemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('')

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
      financial: 'bg-green-100 text-green-800',
      credit: 'bg-blue-100 text-blue-800',
      insurance: 'bg-purple-100 text-purple-800',
      advisory: 'bg-yellow-100 text-yellow-800',
      market: 'bg-pink-100 text-pink-800',
      irrigation: 'bg-cyan-100 text-cyan-800',
      transport: 'bg-orange-100 text-orange-800',
    }
    return colors[cat] || 'bg-gray-100 text-gray-800'
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        📄 {t('schemes', language)}
      </h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder={t('search', language)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="financial">Financial</option>
              <option value="credit">Credit</option>
              <option value="insurance">Insurance</option>
              <option value="advisory">Advisory</option>
              <option value="market">Market</option>
              <option value="irrigation">Irrigation</option>
              <option value="transport">Transport</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schemes List */}
      {filteredSchemes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSchemes.map((scheme) => (
            <div key={scheme.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-semibold text-gray-800">{scheme.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(scheme.category)}`}>
                  {scheme.category}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{scheme.fullName}</p>
              <p className="text-gray-700 mb-4">{scheme.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="bg-green-50 p-3 rounded-md">
                  <p className="text-sm font-semibold text-green-800">
                    {t('benefits', language)}:
                  </p>
                  <p className="text-sm text-green-700">{scheme.benefits}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm font-semibold text-blue-800">
                    {t('eligibility', language)}:
                  </p>
                  <p className="text-sm text-blue-700">{scheme.eligibility}</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">📍 {scheme.state}</span>
                <a
                  href={scheme.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition"
                >
                  <span>{t('applyNow', language)}</span>
                  <FaExternalLinkAlt size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          {t('noData', language)}
        </div>
      )}
    </div>
  )
}

export default Schemes
