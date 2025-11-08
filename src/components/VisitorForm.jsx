import React, { useState } from 'react'
import { User, Building, Phone, UserCheck } from 'lucide-react'

const VisitorForm = ({ onSubmit, loading = false, t }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    phone: '',
    host_name: '',
    host_phone: '',
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
    
    // Walidacja telefonu - teraz wymagany
    if (!formData.phone.trim()) {
      newErrors.phone = t ? t('phoneRequired') : 'Telefonnummer er påkrevd'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = t ? t('invalidPhone') : 'Ugyldig telefonnummer. Bruk format: 12345678 eller +47 12345678'
    }
    
    // Walidacja telefonu gospodarza - teraz wymagany
    if (!formData.host_phone.trim()) {
      newErrors.host_phone = t ? t('hostPhoneRequired') || 'Telefon til vert er påkrevd' : 'Telefon til vert er påkrevd'
    } else if (!validatePhone(formData.host_phone)) {
      newErrors.host_phone = t ? t('invalidPhone') : 'Ugyldig telefonnummer. Bruk format: 12345678 eller +47 12345678'
    }
    
    // Walidacja emaila
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = t ? t('invalidEmail') : 'Ugyldig e-postadresse'
    }
    
    setErrors(newErrors)
    
    // Sprawdź zgodę na politykę prywatności
    if (!privacyAccepted) {
      newErrors.privacy = t ? t('privacyRequired') : 'Du må godta personvernerklæringen'
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">
          <User className="inline h-5 w-5 mr-2 text-blue-600" />
          {t ? t('fullName') : 'Fullt navn'} *
        </label>
        <input
          type="text"
          name="full_name"
          required
          value={formData.full_name}
          onChange={handleChange}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-lg"
          placeholder={t ? t('namePlaceholder') : 'Ola Nordmann'}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Building className="inline h-4 w-4 mr-1" />
          {t ? t('company') : 'Firma'}
        </label>
        <input
          type="text"
          name="company_name"
          value={formData.company_name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder={t ? t('companyPlaceholder') : 'Bedriftsnavn'}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Phone className="inline h-4 w-4 mr-1" />
          {t ? t('phone') : 'Telefonnummer'} *
        </label>
        <input
          type="tel"
          name="phone"
          required
          value={formData.phone}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'
          }`}
          placeholder={t ? t('phonePlaceholder') : '+47 123 45 678'}
        />
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <UserCheck className="inline h-4 w-4 mr-1" />
          {t ? t('hostName') : 'Person som besøkes'} *
        </label>
        <input
          type="text"
          name="host_name"
          required
          value={formData.host_name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder={t ? t('hostPlaceholder') : 'Kari Hansen'}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Phone className="inline h-4 w-4 mr-1" />
          {t ? t('hostPhone') || 'Telefon til vert' : 'Telefon til vert'} *
        </label>
        <input
          type="tel"
          name="host_phone"
          required
          value={formData.host_phone}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.host_phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'
          }`}
          placeholder={t ? t('hostPhonePlaceholder') || '+47 987 65 432' : '+47 987 65 432'}
        />
        {errors.host_phone && (
          <p className="text-red-500 text-sm mt-1">{errors.host_phone}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {t ? t('hostPhoneDescription') || 'For å varsle om ankomst' : 'For å varsle om ankomst'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Phone className="inline h-4 w-4 mr-1" />
          {t ? t('guestEmail') : 'E-post (valgfritt)'}
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'
          }`}
          placeholder={t ? t('emailPlaceholder') : 'ola@email.no'}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">{t ? t('emailDescription') : 'ID-kort vil bli sendt til denne e-posten'}</p>
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
            {t ? t('privacyConsent') : 'Jeg godtar'}{' '}
            <a 
              href="/privacy" 
              target="_blank" 
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              {t ? t('privacyPolicy') : 'personvernerklæringen'}
            </a>
            {' *'}
          </label>
        </div>
        {errors.privacy && (
          <p className="text-red-500 text-sm ml-7">{errors.privacy}</p>
        )}
        <p className="text-xs text-gray-500 ml-7">
          {t ? t('dataDeletedOnCheckout') : 'Dine data slettes automatisk når du sjekker ut'}
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t ? t('registering') : 'Registrerer...'}
          </div>
        ) : (
          t ? t('registerGuest') : 'Registrer gjest'
        )}
      </button>
    </form>
  )
}

export default VisitorForm