import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { Eye, EyeOff } from 'lucide-react'

const Register = () => {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'farmer',
    language: 'en',
    location: {
      state: '',
      district: '',
      village: '',
      pincode: '',
    },
    farmerInfo: {
      farmSize: '',
      crops: [],
    },
    dealerInfo: {
      businessName: '',
      gstNumber: '',
      licenseNumber: '',
      specialization: [],
    },
  })

  const [cropInput, setCropInput] = useState('')
  const [specializationInput, setSpecializationInput] = useState('')

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const submitData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: formData.role,
      language: formData.language,
      location: formData.location,
    }

    if (formData.role === 'farmer') {
      submitData.farmerInfo = {
        farmSize: formData.farmerInfo.farmSize,
        crops: formData.farmerInfo.crops,
      }
    } else if (formData.role === 'dealer') {
      submitData.dealerInfo = {
        businessName: formData.dealerInfo.businessName,
        gstNumber: formData.dealerInfo.gstNumber,
        licenseNumber: formData.dealerInfo.licenseNumber,
        specialization: formData.dealerInfo.specialization,
      }
    }

    try {
      const result = await register(submitData)
      
      if (formData.role === 'dealer' && result.dealerInfo && !result.dealerInfo.approved) {
        toast.warning(t('register.dealerPendingApproval'))
        navigate('/login')
      } else {
        toast.success(t('register.registrationSuccess'))
        navigate('/dashboard')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('register.registrationFailed'))
    }
  }

  const addCrop = () => {
    if (cropInput.trim() && !formData.farmerInfo.crops.includes(cropInput.trim())) {
      setFormData({
        ...formData,
        farmerInfo: {
          ...formData.farmerInfo,
          crops: [...formData.farmerInfo.crops, cropInput.trim()],
        },
      })
      setCropInput('')
    }
  }

  const removeCrop = (crop) => {
    setFormData({
      ...formData,
      farmerInfo: {
        ...formData.farmerInfo,
        crops: formData.farmerInfo.crops.filter((c) => c !== crop),
      },
    })
  }

  const addSpecialization = () => {
    if (specializationInput.trim() && !formData.dealerInfo.specialization.includes(specializationInput.trim())) {
      setFormData({
        ...formData,
        dealerInfo: {
          ...formData.dealerInfo,
          specialization: [...formData.dealerInfo.specialization, specializationInput.trim()],
        },
      })
      setSpecializationInput('')
    }
  }

  const removeSpecialization = (spec) => {
    setFormData({
      ...formData,
      dealerInfo: {
        ...formData.dealerInfo,
        specialization: formData.dealerInfo.specialization.filter((s) => s !== spec),
      },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('register.title')}
          </h1>
          <p className="text-gray-600">{t('register.subtitle')}</p>
        </div>

        <form className="bg-white rounded-lg shadow-md p-6 space-y-6" onSubmit={handleSubmit}>
          {/* Role Selection - Simplified */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('register.iAmA')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'farmer' })}
                className={`p-4 border-2 rounded-lg transition-all text-center ${
                  formData.role === 'farmer'
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="text-3xl mb-1">👨‍🌾</div>
                <div className="font-semibold text-gray-900">{t('register.farmer')}</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'dealer' })}
                className={`p-4 border-2 rounded-lg transition-all text-center ${
                  formData.role === 'dealer'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-3xl mb-1">🏪</div>
                <div className="font-semibold text-gray-900">{t('register.dealer')}</div>
              </button>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('register.name')}
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('register.namePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('register.mobileNumber')}
              </label>
              <input
                type="tel"
                required
                pattern="[0-9]{10}"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={t('register.mobilePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('register.email')}
              </label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t('register.emailPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('register.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength="6"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={t('register.passwordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">{t('register.location')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  value={formData.location.state}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    location: { ...formData.location, state: e.target.value }
                  })}
                  placeholder={t('register.statePlaceholder')}
                />
              </div>

              <div>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  value={formData.location.district}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    location: { ...formData.location, district: e.target.value }
                  })}
                  placeholder={t('register.districtPlaceholder')}
                />
              </div>

              <div>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  value={formData.location.village}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    location: { ...formData.location, village: e.target.value }
                  })}
                  placeholder={t('register.villagePlaceholder')}
                />
              </div>

              <div>
                <input
                  type="text"
                  pattern="[0-9]{6}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  value={formData.location.pincode}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    location: { ...formData.location, pincode: e.target.value }
                  })}
                  placeholder={t('register.pincodePlaceholder')}
                />
              </div>
            </div>
          </div>

          {/* Farmer Specific Fields */}
          {formData.role === 'farmer' && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <span className="mr-2">🌾</span>
                {t('register.farmDetails')}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    value={formData.farmerInfo.farmSize}
                    onChange={(e) => setFormData({
                      ...formData,
                      farmerInfo: { ...formData.farmerInfo, farmSize: e.target.value }
                    })}
                    placeholder={t('register.farmSizePlaceholder')}
                  />
                </div>

                <div>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      value={cropInput}
                      onChange={(e) => setCropInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCrop())}
                      placeholder={t('register.addCropsPlaceholder')}
                    />
                    <button
                      type="button"
                      onClick={addCrop}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                      {t('register.addButton')}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.farmerInfo.crops.map((crop, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-white border border-green-300 text-green-800 rounded-full text-sm"
                      >
                        {crop}
                        <button
                          type="button"
                          onClick={() => removeCrop(crop)}
                          className="ml-2 text-green-600 hover:text-green-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dealer Specific Fields */}
          {formData.role === 'dealer' && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <span className="mr-2">🏪</span>
                {t('register.businessDetails')}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    required={formData.role === 'dealer'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.dealerInfo.businessName}
                    onChange={(e) => setFormData({
                      ...formData,
                      dealerInfo: { ...formData.dealerInfo, businessName: e.target.value }
                    })}
                    placeholder={t('register.businessNamePlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.dealerInfo.gstNumber}
                      onChange={(e) => setFormData({
                        ...formData,
                        dealerInfo: { ...formData.dealerInfo, gstNumber: e.target.value.toUpperCase() }
                      })}
                      placeholder={t('register.gstPlaceholder')}
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.dealerInfo.licenseNumber}
                      onChange={(e) => setFormData({
                        ...formData,
                        dealerInfo: { ...formData.dealerInfo, licenseNumber: e.target.value }
                      })}
                      placeholder={t('register.licensePlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      value={specializationInput}
                      onChange={(e) => setSpecializationInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                      placeholder={t('register.specializationPlaceholder')}
                    />
                    <button
                      type="button"
                      onClick={addSpecialization}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      {t('register.addButton')}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.dealerInfo.specialization.map((spec, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-white border border-blue-300 text-blue-800 rounded-full text-sm"
                      >
                        {spec}
                        <button
                          type="button"
                          onClick={() => removeSpecialization(spec)}
                          className="ml-2 text-blue-600 hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-3">
                  <p className="text-xs text-yellow-800">
                    ⚠️ {t('register.adminVerification')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              {formData.role === 'dealer' ? t('register.registerDealerButton') : t('register.registerButton')}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {t('register.alreadyHaveAccount')}{' '}
              <Link to="/login" className="font-medium text-green-600 hover:text-green-700">
                {t('register.loginLink')}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
