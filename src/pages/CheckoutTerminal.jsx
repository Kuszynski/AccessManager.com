import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import LanguageSelector from '../components/LanguageSelector'
import { useTranslation } from '../utils/translations'
import { LogOut, Search, CheckCircle, ArrowLeft, Shield } from 'lucide-react'

const CheckoutTerminal = () => {
  const { companyId } = useParams()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [language, setLanguage] = useState('no')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [phone, setPhone] = useState('')
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [checkedOut, setCheckedOut] = useState(null)
  const { t } = useTranslation(language)

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(timeInterval)
  }, [])

  useEffect(() => {
    if (company?.name) {
      document.title = `Utsjekking - ${company.name}`
    }
  }, [company])

  useEffect(() => {
    loadCompany()
  }, [companyId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadCompany = async () => {
    try {
      const { data } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single()
      setCompany(data)
    } catch (error) {
      console.error('Błąd ładowania firmy:', error)
    }
  }

  const searchVisitors = async () => {
    if (!phone.trim()) return
    
    setLoading(true)
    try {
      const searchPhone = phone.trim()
      console.log('Szukam telefonu:', searchPhone, 'w firmie:', companyId)
      
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'in')
        .ilike('phone', `%${searchPhone}%`)
      
      if (error) {
        console.error('Błąd zapytania:', error)
      }
      
      console.log('Znalezieni goście:', data)
      setVisitors(data || [])
    } catch (error) {
      console.error('Błąd wyszukiwania:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async (visitor) => {
    setCheckingOut(true)
    try {
      console.log('Usuwanie gościa:', visitor.id)
      
      const { data, error } = await supabase
        .from('visitors')
        .delete()
        .eq('id', visitor.id)
        .select()

      if (error) {
        console.error('Błąd Supabase:', error)
        throw error
      }
      
      console.log('Usunięto:', data)
      setCheckedOut(visitor)
      setVisitors([])
      setPhone('')
    } catch (error) {
      console.error('Błąd wymeldowania:', error)
      alert(`Błąd wymeldowania: ${error.message}`)
    } finally {
      setCheckingOut(false)
    }
  }

  // Auto-redirect po wymeldowaniu
  useEffect(() => {
    if (checkedOut) {
      let countdown = 8
      const interval = setInterval(() => {
        countdown--
        const countdownElement = document.getElementById('checkout-countdown')
        if (countdownElement) {
          countdownElement.textContent = countdown
        }
        if (countdown <= 0) {
          navigate(`/lobby/${companyId}`)
        }
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [checkedOut, navigate, companyId])

  if (checkedOut) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-8 select-none">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 sm:mb-8 space-y-4 sm:space-y-0">
            <div className="flex items-center">
              <button
                onClick={() => navigate(`/lobby/${companyId}`)}
                className="flex items-center bg-gray-100 hover:bg-gray-200 p-2 sm:px-4 sm:py-3 rounded-lg transition-colors mr-3 sm:mr-6"
              >
                <ArrowLeft className="h-4 w-4 text-gray-600" />
                <span className="hidden sm:inline text-sm font-medium text-gray-600 ml-2">Tilbake</span>
              </button>
              {company?.logo_url ? (
                <img 
                  src={company.logo_url} 
                  alt={company.name}
                  className="h-6 sm:h-8 w-auto mr-2 sm:mr-3"
                />
              ) : null}
              <h1 className="text-base sm:text-2xl md:text-3xl font-bold text-gray-900 truncate max-w-[200px] sm:max-w-none">
                {company?.name}
              </h1>
            </div>
            <div className="flex justify-center sm:justify-end">
              <LanguageSelector 
                currentLanguage={language} 
                onLanguageChange={setLanguage}
              />
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-xl mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('checkoutComplete') || 'Utsjekking fullført'}!
            </h2>
            
            <p className="text-gray-600 mb-6">
              <strong>{checkedOut.full_name}</strong> {t('hasBeenCheckedOut') || 'har blitt meldt ut'}
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-gray-900 font-medium mb-2">
                  ✓ Du er nå utsjekket fra bygningen
                </p>
                <p className="text-gray-600 text-sm">
                  {t('thanksForVisit') || 'Takk for besøket!'}
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-4">
                {t('autoReturn') || 'Automatisk retur til terminal om'} <span id="checkout-countdown">8</span> {t('seconds') || 'sekunder'}
              </p>
              <button
                onClick={() => navigate(`/lobby/${companyId}`)}
                className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('backToTerminalNow') || 'Tilbake til terminal nå'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 select-none">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center">
            <button
              onClick={() => navigate(`/lobby/${companyId}`)}
              className="flex items-center bg-gray-100 hover:bg-gray-200 p-2 sm:px-4 sm:py-3 rounded-lg transition-colors mr-3 sm:mr-6"
            >
              <ArrowLeft className="h-4 w-4 text-gray-600" />
              <span className="hidden sm:inline text-sm font-medium text-gray-600 ml-2">Tilbake</span>
            </button>
            {company?.logo_url ? (
              <img 
                src={company.logo_url} 
                alt={company.name}
                className="h-6 sm:h-8 w-auto mr-2 sm:mr-3"
              />
            ) : null}
            <h1 className="text-base sm:text-2xl md:text-3xl font-bold text-gray-900 truncate max-w-[200px] sm:max-w-none">
              {company?.name}
            </h1>
          </div>
          <div className="flex justify-center sm:justify-end">
            <LanguageSelector 
              currentLanguage={language} 
              onLanguageChange={setLanguage}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-red-100 rounded-2xl mb-6">
              <LogOut className="h-8 w-8 md:h-10 md:w-10 text-red-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {t('checkOut') || 'Meld deg ut'}
            </h2>
            <p className="text-gray-600">{t('enterPhoneToCheckout') || 'Skriv inn ditt telefonnummer for å melde deg ut'}</p>
          </div>
          
          {/* Phone Search Section */}
          <div>
            <div className="flex gap-3 mb-6">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+47 123 45 678"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100 transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && searchVisitors()}
              />
              <button
                onClick={searchVisitors}
                disabled={loading || !phone.trim()}
                className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
              >
                <Search className="h-4 w-4 mr-2" />
                {loading ? (t('searching') || 'Søker...') : (t('search') || 'Søk')}
              </button>
            </div>

            {/* Search Results */}
            {visitors.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 mb-4">{t('guestsFound') || 'Funnet gjester'}:</h4>
                {visitors.map((visitor) => (
                  <div key={visitor.id} className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="font-medium text-gray-900">{visitor.full_name}</h5>
                        <p className="text-gray-600 text-sm">{visitor.company_name}</p>
                        <p className="text-gray-500 text-sm">
                          {t('visiting') || 'Besøker'}: {visitor.host_name}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCheckOut(visitor)}
                        disabled={checkingOut}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {checkingOut ? (t('checkingOut') || 'Melder ut...') : (t('checkOut') || 'Meld ut')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {visitors.length === 0 && phone && !loading && (
              <div className="text-center py-6">
                <p className="text-gray-500">{t('noGuestsFound') || 'Ingen gjester funnet med dette telefonnummeret'}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Help Section */}
        {company?.phone && (
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm mb-2">
              {t('needHelp') || 'Trenger du hjelp?'}
            </p>
            <p className="text-gray-700 font-medium">
              {t('callReception') || 'Ring resepsjonen'}: {company.phone}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckoutTerminal