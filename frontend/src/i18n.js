import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enTranslation from './locales/en/translation.json'
import teTranslation from './locales/te/translation.json'
import hiTranslation from './locales/hi/translation.json'

// Get saved language from localStorage or default to 'en'
const savedLanguage = localStorage.getItem('language') || 'en'

i18n
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      te: {
        translation: teTranslation
      },
      hi: {
        translation: hiTranslation
      }
    },
    lng: savedLanguage, // Default language
    fallbackLng: 'en', // Fallback language if translation is missing
    
    interpolation: {
      escapeValue: false // React already does escaping
    },
    
    react: {
      useSuspense: false // Disable suspense to avoid loading issues
    }
  })

// Listen for language changes and save to localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng)
})

export default i18n
