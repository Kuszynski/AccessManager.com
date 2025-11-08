import React, { useState } from 'react'
import { User, Building, Phone, UserCheck, Mail } from 'lucide-react'

const VisitorForm = ({ onSubmit, loading = false, t, language = 'no' }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    phone: '',
    host_name: '',
    host_email: '',
    email: ''
  })
  const [errors, setErrors] = useState({})
  const [privacyAccepted, setPrivacyAccepted] = useState(false)

  const validatePhone = (phone) => {
    if (!phone) return true // Telefon nie jest wymagany
    // Norweski numer: 8 cyfr lub +47 + 8 cyfr
    const norwegianPattern = /^(\+47\s?)?\d{8}$/
    // Międzynarodowy: + i co najmniej 7 cyfr
    const internationalPattern = /^\+\d{7,15}$/
    return norwegianPattern.test(phone) || internationalPattern.test(phone)
  }

  const validateEmail = (email) => {
    if (!email) return true // Email nie jest wymagany
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(email)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const newErrors = {}
    
    // Walidacja nazwy firmy - wymagana
    if (!formData.company_name.trim()) {
      newErrors.company_name = t('companyRequired') || 'Bedrift er påkrevd'
    }
    
    // Walidacja telefonu - teraz wymagany
    if (!formData.phone.trim()) {
      newErrors.phone = t('phoneRequired') || 'Telefonnummer er påkrevd'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = t('invalidPhone') || 'Ugyldig telefonnummer. Bruk format: 12345678 eller +47 12345678'
    }
    
    // Walidacja emaila - wymagany
    if (!formData.email.trim()) {
      newErrors.email = t('emailRequired') || 'E-post er påkrevd'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('invalidEmail') || 'Ugyldig e-postadresse'
    }
    
    setErrors(newErrors)
    
    // Sprawdź zgodę na politykę prywatności
    if (!privacyAccepted) {
      newErrors.privacy = t('privacyRequired') || 'Du må godta personvernerklæringen'
    }
    
    setErrors(newErrors)
    
    // Jeśli brak błędów, wyślij formularz
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <User className="inline h-4 w-4 mr-2 text-gray-500" />
          {t('fullName') || 'Fullt navn'} *
        </label>
        <input
          type="text"
          name="full_name"
          required
          value={formData.full_name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100 transition-colors"
          placeholder={t('namePlaceholder') || 'Ola Nordmann'}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Building className="inline h-4 w-4 mr-2 text-gray-500" />
          {t('company') || 'Bedrift'} *
        </label>
        <input
          type="text"
          name="company_name"
          required
          value={formData.company_name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            errors.company_name ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-300 focus:border-gray-500 focus:ring-gray-100'
          }`}
          placeholder={t('companyPlaceholder') || 'Bedriftsnavn'}
        />
        {errors.company_name && (
          <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Phone className="inline h-4 w-4 mr-2 text-gray-500" />
          {t('phone') || 'Telefonnummer'} *
        </label>
        <input
          type="tel"
          name="phone"
          required
          value={formData.phone}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-300 focus:border-gray-500 focus:ring-gray-100'
          }`}
          placeholder={t('phonePlaceholder') || '+47 123 45 678'}
        />
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Mail className="inline h-4 w-4 mr-2 text-gray-500" />
          {t('email') || 'E-post'} *
        </label>
        <input
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-300 focus:border-gray-500 focus:ring-gray-100'
          }`}
          placeholder={t('emailPlaceholder') || 'ola@email.no'}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
        <div className="mt-2">
          <div className="p-2 bg-gray-100 rounded border border-gray-200">
            <p className="text-xs text-gray-700 flex items-center">
              🚨 <span className="ml-1">Ved brannalarm sendes evakueringsinstruksjoner til denne e-posten</span>
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <UserCheck className="inline h-4 w-4 mr-2 text-gray-500" />
          {t('hostName') || 'Person som besøkes'} *
        </label>
        <input
          type="text"
          name="host_name"
          required
          value={formData.host_name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100 transition-colors"
          placeholder={t('hostPlaceholder') || 'Kari Hansen'}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="privacy-consent"
            checked={privacyAccepted}
            onChange={(e) => setPrivacyAccepted(e.target.checked)}
            className={`mt-1 h-4 w-4 text-blue-600 border-2 rounded focus:ring-blue-500 ${
              errors.privacy ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          <label htmlFor="privacy-consent" className="ml-3 text-sm text-gray-700">
            {t('privacyConsent') || 'Jeg godtar'}{' '}
            <a 
              href="/privacy" 
              target="_blank" 
              className="text-gray-700 hover:text-gray-900 underline font-medium"
            >
              {t('privacyPolicy') || 'personvernerklæringen'}
            </a>
            {' *'}
          </label>
        </div>
        {errors.privacy && (
          <p className="text-red-500 text-sm ml-7">{errors.privacy}</p>
        )}
        <p className="text-xs text-gray-500 ml-7">
          {t('dataDeletedOnCheckout') || 'Dine data slettes automatisk når du sjekker ut'}
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('registering') || 'Registrerer...'}
          </div>
        ) : (
          t('registerGuest') || 'Registrer gjest'
        )}
      </button>
    </form>
  )
}

export default VisitorForm