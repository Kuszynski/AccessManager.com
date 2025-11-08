import React, { useState, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../utils/translations'
import LanguageSelector from '../components/LanguageSelector'
import { supabase } from '../utils/supabase'
import { Shield, Mail, Lock, Key } from 'lucide-react'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState('no')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    companyAddress: '',
    companyPhone: ''
  })
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState([])
  const [phoneError, setPhoneError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [companyNameError, setCompanyNameError] = useState('')
  const [companyAddressError, setCompanyAddressError] = useState('')

  const { signIn, signUp } = useAuth(language)
  const { t } = useTranslation(language)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password)
        if (error) throw error
      } else {
        // Walidacja wszystkich pól przy rejestracji
        if (!validateAllFields()) {
          return
        }
        
        const { error } = await signUp(formData.email, formData.password, {
          name: formData.companyName,
          address: formData.companyAddress,
          phone: formData.companyPhone
        })
        if (error) throw error
        
        // Pokaż komunikat o oczekiwaniu na zatwierdzenie
        alert(t('registrationPending') || 'Rejestracja wysłana! Oczekuj na zatwierdzenie przez administratora.')
        // Przełącz na zakładkę logowania
        setIsLogin(true)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Walidacja w czasie rzeczywistym
    if (name === 'password') {
      validatePassword(value)
    } else if (name === 'companyPhone') {
      validatePhone(value)
    } else if (name === 'email') {
      validateEmail(value)
    } else if (name === 'companyName') {
      validateCompanyName(value)
    } else if (name === 'companyAddress') {
      validateCompanyAddress(value)
    }
  }
  
  const validatePassword = useCallback((password) => {
    const errors = []
    
    if (password.length < 8) {
      errors.push(t('passwordMinLength') || 'Minimum 8 znaków')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push(t('passwordUppercase') || 'Jedna wielka litera')
    }
    if (!/[a-z]/.test(password)) {
      errors.push(t('passwordLowercase') || 'Jedna mała litera')
    }
    if (!/\d/.test(password)) {
      errors.push(t('passwordNumber') || 'Jedna cyfra')
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push(t('passwordSpecial') || 'Jeden znak specjalny (!@#$%^&*)')
    }
    
    setPasswordErrors(errors)
    return errors.length === 0
  }, [t])
  
  // Aktualizuj walidację hasła przy zmianie języka
  React.useEffect(() => {
    if (formData.password) {
      validatePassword(formData.password)
    }
  }, [language, formData.password]) // Usunięto validatePassword z dependencies
  
  const validatePhone = (phone) => {
    const phoneRegex = /^\+\d{1,4}\s?\d{8,15}$/
    
    if (!phone) {
      setPhoneError(t('phoneRequired') || 'Telefonnummer er påkrevd')
      return false
    }
    
    if (!phoneRegex.test(phone)) {
      setPhoneError(t('phoneInvalid') || 'Bruk format: +47 12345678')
      return false
    }
    
    setPhoneError('')
    return true
  }
  
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!email) {
      setEmailError(t('emailRequired') || 'E-post er påkrevd')
      return false
    }
    
    if (!emailRegex.test(email)) {
      setEmailError(t('invalidEmail') || 'Ugyldig e-postadresse')
      return false
    }
    
    setEmailError('')
    return true
  }
  
  const validateCompanyName = (name) => {
    if (!name || name.trim().length < 2) {
      setCompanyNameError(t('companyNameRequired') || 'Firmanavn er påkrevd (minimum 2 tegn)')
      return false
    }
    
    setCompanyNameError('')
    return true
  }
  
  const validateCompanyAddress = (address) => {
    if (!address || address.trim().length < 5) {
      setCompanyAddressError(t('companyAddressRequired') || 'Firmaadresse er påkrevd (minimum 5 tegn)')
      return false
    }
    
    setCompanyAddressError('')
    return true
  }
  
  const validateAllFields = () => {
    const isEmailValid = validateEmail(formData.email)
    const isPasswordValid = validatePassword(formData.password)
    const isCompanyNameValid = validateCompanyName(formData.companyName)
    const isCompanyAddressValid = validateCompanyAddress(formData.companyAddress)
    const isPhoneValid = validatePhone(formData.companyPhone)
    
    // Sprawdź czy hasła się zgadzają
    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordMismatch') || 'Hasła nie są identyczne')
      return false
    }
    
    if (!isEmailValid || !isPasswordValid || !isCompanyNameValid || !isCompanyAddressValid || !isPhoneValid) {
      setError(t('fillAllFields') || 'Vennligst fyll ut alle påkrevde felt korrekt')
      return false
    }
    
    setError('')
    return true
  }
  
  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError(t('emailRequired') || 'Wprowadź email aby zresetować hasło')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/login`
      })
      
      if (error) throw error
      
      setResetSent(true)
    } catch (error) {
      setError(t('resetError') || 'Błąd podczas wysyłania emaila z resetem hasła')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Language Selector */}
      <div className="absolute top-4 right-4">
        <LanguageSelector 
          currentLanguage={language} 
          onLanguageChange={setLanguage}
        />
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Shield className="h-12 w-12 text-primary-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          AccessManager
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('guestManagementSystem') || 'Guest Management System'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md ${
                isLogin
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('login') || 'Logg inn'}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md ${
                !isLogin
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('register') || 'Registrer'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                <Mail className="inline h-4 w-4 mr-1" />
                {t('email') || 'E-post'} *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                  emailError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {emailError && (
                <p className="mt-1 text-xs text-red-600">{emailError}</p>
              )}
              {!emailError && formData.email && (
                <p className="mt-1 text-xs text-green-600">
                  ✓ {t('emailValid') || 'Gyldig e-postadresse'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                <Lock className="inline h-4 w-4 mr-1" />
                {t('password') || 'Passord'}
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              
              {/* Walidacja hasła dla rejestracji */}
              {!isLogin && formData.password && (
                <div className="mt-2">
                  <div className="text-xs text-gray-600 mb-2">
                    {t('passwordRequirements') || 'Wymagania dotyczące hasła:'}
                  </div>
                  <div className="space-y-1">
                    {passwordErrors.map((error, index) => (
                      <div key={index} className="flex items-center text-xs">
                        <span className="text-red-500 mr-2">✗</span>
                        <span className="text-red-600">{error}</span>
                      </div>
                    ))}
                    {passwordErrors.length === 0 && formData.password.length > 0 && (
                      <div className="flex items-center text-xs">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-green-600">{t('passwordStrong') || 'Hasło spełnia wymagania'}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <Lock className="inline h-4 w-4 mr-1" />
                  {t('confirmPassword') || 'Bekreft passord'}
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">
                    {t('passwordMismatch') || 'Hasła nie są identyczne'}
                  </p>
                )}
                {formData.confirmPassword && formData.password === formData.confirmPassword && formData.confirmPassword.length > 0 && (
                  <p className="mt-1 text-xs text-green-600">
                    ✓ {t('passwordMatch') || 'Hasła są identyczne'}
                  </p>
                )}
              </div>
            )}

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('companyName') || 'Bedriftsnavn'} *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      companyNameError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {companyNameError && (
                    <p className="mt-1 text-xs text-red-600">{companyNameError}</p>
                  )}
                  {!companyNameError && formData.companyName && formData.companyName.trim().length >= 2 && (
                    <p className="mt-1 text-xs text-green-600">
                      ✓ {t('companyNameValid') || 'Gyldig firmanavn'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('companyAddress') || 'Bedriftsadresse'} *
                  </label>
                  <input
                    type="text"
                    name="companyAddress"
                    required
                    value={formData.companyAddress}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      companyAddressError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {companyAddressError && (
                    <p className="mt-1 text-xs text-red-600">{companyAddressError}</p>
                  )}
                  {!companyAddressError && formData.companyAddress && formData.companyAddress.trim().length >= 5 && (
                    <p className="mt-1 text-xs text-green-600">
                      ✓ {t('companyAddressValid') || 'Gyldig adresse'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('companyPhone') || 'Bedriftstelefon'} *
                  </label>
                  <input
                    type="tel"
                    name="companyPhone"
                    required
                    value={formData.companyPhone}
                    onChange={handleChange}
                    placeholder="+47 12345678"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      phoneError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {phoneError && (
                    <p className="mt-1 text-xs text-red-600">{phoneError}</p>
                  )}
                  {!phoneError && formData.companyPhone && (
                    <p className="mt-1 text-xs text-green-600">
                      ✓ {t('phoneValid') || 'Gyldig telefonnummer'}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {t('phoneFormat') || 'Format: +47 12345678 (med landskode)'}
                  </p>
                </div>
              </>
            )}

            {resetSent ? (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded text-center">
                <Key className="inline h-4 w-4 mr-2" />
                {t('resetEmailSent') || 'Email z resetem hasła został wysłany!'}
              </div>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {loading ? (t('loading') || 'Laster...') : (isLogin ? (t('signIn') || 'Logg inn') : (t('registerCompany') || 'Registrer bedrift'))}
                </button>
                
                {isLogin && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    {t('forgotPassword') || 'Glemt passord?'}
                  </button>
                )}
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login