import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import VisitorForm from '../components/VisitorForm'
import LanguageSelector from '../components/LanguageSelector'
import { useTranslation } from '../utils/translations'
import { sendHostNotification } from '../utils/hostNotification'
import { Shield, CheckCircle, ArrowLeft, Phone } from 'lucide-react'

const GuestTerminal = () => {
  const { companyId } = useParams()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [formData, setFormData] = useState(null)

  const [language, setLanguage] = useState('no')
  const [currentTime, setCurrentTime] = useState(new Date())
  const { t } = useTranslation(language)

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(timeInterval)
  }, [])

  useEffect(() => {
    if (company?.name) {
      document.title = `Registrering - ${company.name}`
    }
  }, [company])

  useEffect(() => {
    loadCompany()
  }, [companyId])
  
  // Auto-redirect po rejestracji
  useEffect(() => {
    if (registered) {
      let countdown = 10
      const interval = setInterval(() => {
        countdown--
        const countdownElement = document.getElementById('countdown')
        if (countdownElement) {
          countdownElement.textContent = countdown
        }
        if (countdown <= 0) {
          navigate(`/lobby/${companyId}`)
        }
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [registered, navigate, companyId])

  const loadCompany = async () => {
    try {
      // Zawsze użyj pierwszej dostępnej firmy
      const { data: firstCompany } = await supabase
        .from('companies')
        .select('*')
        .limit(1)
        .single()
      
      setCompany(firstCompany || {
        id: 'demo',
        name: 'Elektryk AS',
        address: 'ul. Młotkowa 2, Warszawa'
      })
    } catch (error) {
      console.error('Błąd ładowania firmy:', error)
      setCompany({
        id: 'demo',
        name: 'Elektryk AS',
        address: 'ul. Młotkowa 2, Warszawa'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVisitorSubmit = async (visitorData) => {
    setSubmitLoading(true)
    try {
      // Pobierz ID pierwszej firmy
      const { data: firstCompany } = await supabase
        .from('companies')
        .select('id')
        .limit(1)
        .single()
      
      // Zarejestruj gościa bez QR
      const { error } = await supabase
        .from('visitors')
        .insert([{
          ...visitorData,
          qr_code_id: `guest_${Date.now()}`, // Prosty identyfikator
          company_id: firstCompany?.id || null,
          check_in_time: new Date().toISOString(),
          status: 'in'
        }])
        .select()
        .single()
      
      if (error) throw error
      
      // Wyślij email do gospodarza jeśli podano email
      if (visitorData.host_email) {
        try {
          await sendHostNotification(visitorData.host_email, visitorData.full_name, company.name, 'arrival', visitorData.company_name)
        } catch (emailError) {
          console.error('Błąd wysyłania emaila:', emailError)
          // Nie przerywamy procesu jeśli email się nie udał
        }
      }
      
      setFormData(visitorData)
      setRegistered(true)
      
    } catch (error) {
      console.error('Błąd rejestracji:', error)
      alert(`Błąd rejestracji: ${error.message || 'Nieznany błąd'}`)
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Firma nie znaleziona</h2>
          <p className="text-gray-600">Sprawdź poprawność linku</p>
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
        {!registered ? (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-2xl mb-6">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {t('guestRegistration') || 'Gjesteregistrering'}
              </h2>
              <p className="text-gray-600">{t('pleaseFillinformation') || 'Vennligst fyll ut informasjonen nedenfor'}</p>
            </div>
            
            <VisitorForm
              onSubmit={handleVisitorSubmit}
              loading={submitLoading}
              t={t}
              language={language}
            />
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-xl mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('registrationComplete') || 'Registrering fullført!'}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {t('welcomeTo')} {company.name}
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-gray-900 font-medium mb-2">
                  ✓ {t('nowRegistered') || 'Du er nå registrert som gjest'}
                </p>
                <p className="text-gray-600 text-sm">
                  {t('goToReceptionOrHost') || 'Gå til resepsjonen eller til personen du skal besøke'}
                </p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-gray-900 font-medium flex items-center mb-2">
                  <Phone className="h-4 w-4 mr-2" />
                  {t('rememberPhone') || 'Husk ditt telefonnummer'}: <span className="font-bold ml-1">{formData?.phone}</span>
                </p>
                <p className="text-gray-600 text-sm">
                  {t('neededForCheckout') || 'Trenger dette for utsjekking når du forlater bygningen'}
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-4">
                {t('autoReturn') || 'Automatisk retur til terminal om'} <span id="countdown">10</span> {t('seconds') || 'sekunder'}
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
        )}
        
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

export default GuestTerminal