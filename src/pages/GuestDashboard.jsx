import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import LanguageSelector from '../components/LanguageSelector'
import { useTranslation } from '../utils/translations'
import { Shield, LogIn, LogOut, Clock, Wifi, WifiOff, Phone, Settings, Upload, X } from 'lucide-react'

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

  useEffect(() => {
    if (company?.name) {
      document.title = `Digital resepsjon - ${company.name}`
    }
  }, [company])

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 select-none">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center">
            {company?.logo_url ? (
              <img 
                src={company.logo_url} 
                alt={company.name}
                className="h-8 w-auto mr-3"
              />
            ) : null}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {company?.name}
            </h1>
          </div>
          <div className="flex justify-end">
            <LanguageSelector 
              currentLanguage={language} 
              onLanguageChange={setLanguage}
            />
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Registration */}
          <a
            href={getRegistrationLink()}
            onClick={() => handleActionClick('register')}
            className="group bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl p-8 md:p-12 transition-all duration-200 hover:shadow-lg active:scale-98"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-2xl mb-6">
                <LogIn className="h-8 w-8 md:h-10 md:w-10 text-green-600" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {t('register') || 'Registrer deg'}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('fillInformation') || 'Fyll ut dine opplysninger'}
              </p>
              <div className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold group-hover:bg-green-700 transition-colors">
                {t('clickToStart') || 'Trykk for å starte'}
              </div>
            </div>
          </a>

          {/* Checkout */}
          <a
            href={getCheckoutLink()}
            onClick={() => handleActionClick('checkout')}
            className="group bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl p-8 md:p-12 transition-all duration-200 hover:shadow-lg active:scale-98"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-red-100 rounded-2xl mb-6">
                <LogOut className="h-8 w-8 md:h-10 md:w-10 text-red-600" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {t('checkOut') || 'Meld deg ut'}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('enterPhone') || 'Skriv inn ditt telefonnummer'}
              </p>
              <div className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold group-hover:bg-red-700 transition-colors">
                {t('clickToCheckout') || 'Trykk for å melde ut'}
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

export default GuestDashboard