import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useTranslation } from 'react-i18next'
import { FaBars, FaTimes, FaGlobe, FaUser } from 'react-icons/fa'

const Navbar = () => {
  const { user, logout, isFarmer, isDealer, isAdmin } = useAuth()
  const { language, changeLanguage } = useLanguage()
  const { t } = useTranslation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)

  // Role-based navigation links
  const getNavLinks = () => {
    if (!user) {
      return [
        { to: '/', label: t('common.home') },
        { to: '/forum', label: t('common.forum') },
      ]
    }

    if (isAdmin()) {
      return [
        { to: '/admin-dashboard', label: `👑 ${t('dashboard.adminDashboard')}` },
        { to: '/forum', label: t('common.forum') },
      ]
    }

    if (isDealer()) {
      return [
        { to: '/dealer-dashboard', label: `🏪 ${t('dashboard.dealerDashboard')}` },
        { to: '/forum', label: t('common.forum') },
      ]
    }

    // Farmer links
    return [
      { to: '/dashboard', label: t('common.dashboard') },
      { to: '/crop-advisor', label: t('common.cropAdvisor') },
      { to: '/crop-prices', label: '💰 Crop Prices' },
      { to: '/storage-finder', label: t('storage.title') },
      { to: '/schemes', label: t('common.schemes') },
      { to: '/forum', label: t('common.forum') },
    ]
  }

  const navLinks = getNavLinks()

  const handleLanguageChange = (lang) => {
    changeLanguage(lang)
    setLangDropdownOpen(false)
  }

  return (
    <nav className="bg-primary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold">🌾 RythuSetu</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary transition"
              >
                {link.label}
              </Link>
            ))}

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-secondary transition"
              >
                <FaGlobe />
                <span className="text-sm">{language.toUpperCase()}</span>
              </button>
              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white text-gray-800 rounded-md shadow-lg z-50">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    English
                  </button>
                  <button
                    onClick={() => handleLanguageChange('te')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    తెలుగు
                  </button>
                  <button
                    onClick={() => handleLanguageChange('hi')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    हिन्दी
                  </button>
                </div>
              )}
            </div>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/profile"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-secondary transition"
                >
                  <FaUser />
                  <div className="flex flex-col items-start">
                    <span className="text-sm">{user.name}</span>
                    <span className="text-xs opacity-75">
                      {isAdmin() && '👑 Admin'}
                      {isDealer() && '🏪 Dealer'}
                      {isFarmer() && `👨‍🌾 ${t('auth.farmer')}`}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-600 rounded-md text-sm font-medium hover:bg-red-700 transition"
                >
                  {t('common.logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary transition"
                >
                  {t('common.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-accent text-gray-800 rounded-md text-sm font-medium hover:bg-yellow-500 transition"
                >
                  {t('common.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2"
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-secondary">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary"
                >
                  {t('common.profile')}
                </Link>
                <div className="px-3 py-2 text-sm">
                  {isAdmin() && '👑 Admin'}
                  {isDealer() && '🏪 Dealer'}
                  {isFarmer() && `👨‍🌾 ${t('auth.farmer')}`}
                </div>
                <button
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-primary"
                >
                  {t('common.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary"
                >
                  {t('common.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary"
                >
                  {t('common.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
