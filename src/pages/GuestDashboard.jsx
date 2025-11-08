import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import LanguageSelector from '../components/LanguageSelector'
import { useTranslation } from '../utils/translations'
import { Shield, LogIn, LogOut, Clock, Wifi, WifiOff } from 'lucide-react'

const GuestDashboard = () => {
  const { companyId } = useParams()
  const [company, setCompany] = useState(null)
  const [language, setLanguage] = useState('no')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [showSuccess, setShowSuccess] = useState(false)
  const { t } = useTranslation(language)

  useEffect(() => {
    loadCompany()
    
    // Tryb kiosku - blokuj nawigację
    const handleKeyDown = (e) => {
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r') || 
          (e.altKey && e.key === 'Tab') || e.key === 'F11' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault()
      }
    }
    
    // Śledź aktywność
    const handleActivity = () => {
      setLastActivity(Date.now())
    }
    
    // Status połączenia
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    // Aktualizuj czas co sekundę
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    // Auto-refresh co 30 minut
    const refreshInterval = setInterval(() => {
      window.location.reload()
    }, 30 * 60 * 1000)
    
    // Heartbeat co 5 minut
    const heartbeatInterval = setInterval(() => {
      sendHeartbeat()
    }, 5 * 60 * 1000)
    
    // Reset po bezczynności (10 minut)
    const inactivityInterval = setInterval(() => {
      if (Date.now() - lastActivity > 10 * 60 * 1000) {
        setLanguage('no') // Reset do norweskiego
        setLastActivity(Date.now())
      }
    }, 60 * 1000)
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('click', handleActivity)
    window.addEventListener('touchstart', handleActivity)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      clearInterval(timeInterval)
      clearInterval(refreshInterval)
      clearInterval(heartbeatInterval)
      clearInterval(inactivityInterval)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('click', handleActivity)
      window.removeEventListener('touchstart', handleActivity)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [companyId, lastActivity])

  const loadCompany = async () => {
    try {
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
    }
  }

  const getRegistrationLink = () => {
    return `/guest/${company?.id || 'demo'}`
  }

  const getCheckoutLink = () => {
    return `/checkout/${company?.id || 'demo'}`
  }
  
  const sendHeartbeat = async () => {
    try {
      await supabase.from('companies').select('id').limit(1)
    } catch (error) {
      console.log('Heartbeat failed:', error)
    }
  }
  
  const handleActionClick = (action) => {
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2000)
    // Opcjonalny dźwięk
    if (window.AudioContext) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.1)
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('no-NO', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('no-NO', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-8 select-none">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-3xl shadow-2xl mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Shield className="h-16 w-16 mr-6" />
              <div>
                <h1 className="text-6xl font-bold mb-2">
                  {company?.name}
                </h1>
                <p className="text-2xl text-blue-100 mb-4">
                  {t('welcomeTo')} {company?.name}
                </p>
                <p className="text-blue-200 text-xl">{company?.address}</p>
              </div>
            </div>
            <div className="text-right">
              <LanguageSelector 
                currentLanguage={language} 
                onLanguageChange={setLanguage}
                variant="light"
              />
              <div className="mt-4">
                <div className="flex items-center text-blue-100 mb-2">
                  <Clock className="h-6 w-6 mr-2" />
                  <span className="text-lg">{formatDate(currentTime)}</span>
                  <div className="ml-4 flex items-center">
                    {isOnline ? 
                      <Wifi className="h-5 w-5 text-green-300" /> : 
                      <WifiOff className="h-5 w-5 text-red-300" />
                    }
                  </div>
                </div>
                <div className="text-4xl font-bold">
                  {formatTime(currentTime)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Registration */}
          <a
            href={getRegistrationLink()}
            onClick={() => handleActionClick('register')}
            className="group bg-white rounded-3xl shadow-2xl p-12 hover:shadow-3xl transition-all duration-300 hover:scale-105 border-4 border-transparent hover:border-green-200 active:scale-95"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-8 group-hover:bg-green-200 transition-colors">
                <LogIn className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-4">
                {t('checkInRegistration')}
              </h3>
              <p className="text-xl text-gray-600 mb-6">
                {t('terminalForNewGuests')}
              </p>
              <div className="bg-green-600 text-white px-8 py-4 rounded-2xl font-bold text-xl group-hover:bg-green-700 transition-colors">
                {t('tapToRegister') || (language === 'no' ? 'Trykk her for å registrere deg' :
                 language === 'en' ? 'Tap here to register' :
                 'Kliknij aby się zarejestrować')}
              </div>
            </div>
          </a>

          {/* Checkout */}
          <a
            href={getCheckoutLink()}
            onClick={() => handleActionClick('checkout')}
            className="group bg-white rounded-3xl shadow-2xl p-12 hover:shadow-3xl transition-all duration-300 hover:scale-105 border-4 border-transparent hover:border-red-200 active:scale-95"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-8 group-hover:bg-red-200 transition-colors">
                <LogOut className="h-12 w-12 text-red-600" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-4">
                {t('checkOutDeparture')}
              </h3>
              <p className="text-xl text-gray-600 mb-6">
                {t('terminalForDepartingGuests')}
              </p>
              <div className="bg-red-600 text-white px-8 py-4 rounded-2xl font-bold text-xl group-hover:bg-red-700 transition-colors">
                {t('tapToCheckout') || (language === 'no' ? 'Trykk her for å melde deg ut' :
                 language === 'en' ? 'Tap here to check out' :
                 'Kliknij aby się wymeldować')}
              </div>
            </div>
          </a>
        </div>

        {/* Success Animation */}
        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="bg-green-500 text-white px-8 py-4 rounded-2xl text-2xl font-bold animate-bounce">
              ✓ {t('thankYou') || (language === 'no' ? 'Takk!' : language === 'en' ? 'Thank you!' : 'Dziękuję!')}
            </div>
          </div>
        )}
        
        {/* Offline Warning */}
        {!isOnline && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg z-50">
            <div className="flex items-center">
              <WifiOff className="h-5 w-5 mr-2" />
              {t('noInternet') || (language === 'no' ? 'Ingen internettforbindelse' :
               language === 'en' ? 'No internet connection' :
               'Brak połączenia internetowego')}
            </div>
          </div>
        )}
        
        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-6 inline-block">
            <p className="text-gray-600 text-lg">
              {t('needHelp') || (language === 'no' ? 'Trenger du hjelp? Kontakt resepsjonen' :
               language === 'en' ? 'Need help? Contact reception' :
               'Potrzebujesz pomocy? Skontaktuj się z recepcją')}
            </p>
            {company?.phone && (
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {company.phone}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GuestDashboard