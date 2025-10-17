import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { t } from '../utils/translations'
import { toast } from 'react-toastify'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const { login } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await login(formData.email, formData.password)
      toast.success('Login successful!')
      
      // Role-based redirect
      if (result.role === 'admin') {
        navigate('/admin-dashboard')
      } else if (result.role === 'dealer') {
        if (result.dealerInfo && !result.dealerInfo.approved) {
          toast.error('Your dealer account is pending admin approval.')
          return
        }
        navigate('/dealer-dashboard')
      } else {
        // Farmer
        navigate('/dashboard')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900">
            {t('login', language)}
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            {t('welcome', language)} to RythuSetu
          </p>
        </div>
        <form className="mt-8 bg-white shadow-2xl rounded-2xl p-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('email', language)}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('password', language)}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-4 px-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg transition-all transform hover:scale-[1.02]"
            >
              {t('login', language)}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-green-600 hover:text-green-700">
                {t('register', language)}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
