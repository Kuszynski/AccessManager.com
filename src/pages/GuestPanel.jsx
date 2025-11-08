import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import LanguageSelector from '../components/LanguageSelector'
import { useTranslation } from '../utils/translations'
import { Shield, LogIn, LogOut, Users, Mail, Tablet } from 'lucide-react'

const GuestPanel = () => {
  const { companyId } = useParams()
  const [company, setCompany] = useState(null)
  const [language, setLanguage] = useState('no')
  const [currentGuests, setCurrentGuests] = useState(0)
  const { t } = useTranslation(language)

  useEffect(() => {
    loadCompany()
    loadGuestCount()
    const interval = setInterval(loadGuestCount, 30000)
    return () => clearInterval(interval)
  }, [companyId])

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

  const loadGuestCount = async () => {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .select('id')
        .eq('status', 'in')
      
      if (!error) {
        setCurrentGuests(data?.length || 0)
      }
    } catch (error) {
      console.error('Błąd ładowania liczby gości:', error)
    }
  }

  const getRegistrationLink = () => {
    return `${window.location.origin}/guest/${company?.id || 'demo'}`
  }

  const getCheckoutLink = () => {
    return `${window.location.origin}/checkout/${company?.id || 'demo'}`
  }

  const copyToClipboard = (text, type) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        alert(t('linkCopiedToClipboard').replace('{type}', type))
      }).catch(() => {
        fallbackCopyTextToClipboard(text, type)
      })
    } else {
      fallbackCopyTextToClipboard(text, type)
    }
  }

  const fallbackCopyTextToClipboard = (text, type) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.top = '0'
    textArea.style.left = '0'
    textArea.style.position = 'fixed'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      const successful = document.execCommand('copy')
      if (successful) {
        alert(t('linkCopiedToClipboard').replace('{type}', type))
      } else {
        alert(`${t('copyManually')} ${text}`)
      }
    } catch (err) {
      alert(`${t('copyManually')} ${text}`)
    }
    
    document.body.removeChild(textArea)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-2xl shadow-lg mb-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center mb-4">
                <Shield className="h-12 w-12 mr-4" />
                <div>
                  <h1 className="text-4xl font-bold">{company?.name}</h1>
                  <p className="text-blue-100 text-lg">{company?.address}</p>
                </div>
              </div>
              <p className="text-blue-200 text-xl">{t('guestTerminals')}</p>
            </div>
            <LanguageSelector 
              currentLanguage={language} 
              onLanguageChange={setLanguage}
              variant="light"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-center">
            <Users className="h-8 w-8 text-blue-600 mr-4" />
            <div className="text-center">
              <p className="text-gray-600 text-lg">{t('currentGuests')}</p>
              <p className="text-4xl font-bold text-blue-600">{currentGuests}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <LogIn className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t('checkInRegistration')}
              </h3>
              <p className="text-gray-600">{t('terminalForNewGuests')}</p>
            </div>
            
            <div className="space-y-4">
              <a
                href={getRegistrationLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                <Tablet className="h-5 w-5 mr-2" />
                {t('openRegistrationTerminal')}
              </a>
              
              <button
                onClick={() => copyToClipboard(getRegistrationLink(), 'registrering')}
                className="w-full flex items-center justify-center px-6 py-3 border-2 border-green-600 text-green-600 rounded-xl font-semibold hover:bg-green-50 transition-colors"
              >
                <Mail className="h-5 w-5 mr-2" />
                {t('copyLinkToEmail')}
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 font-medium mb-2">{t('linkForSharing')}:</p>
              <p className="text-xs text-gray-500 break-all font-mono bg-white p-2 rounded border">
                {getRegistrationLink()}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <LogOut className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t('checkOutDeparture')}
              </h3>
              <p className="text-gray-600">{t('terminalForDepartingGuests')}</p>
            </div>
            
            <div className="space-y-4">
              <a
                href={getCheckoutLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center px-6 py-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                <Tablet className="h-5 w-5 mr-2" />
                {t('openCheckoutTerminal')}
              </a>
              
              <button
                onClick={() => copyToClipboard(getCheckoutLink(), 'utsjekking')}
                className="w-full flex items-center justify-center px-6 py-3 border-2 border-red-600 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors"
              >
                <Mail className="h-5 w-5 mr-2" />
                {t('copyLinkToEmail')}
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 font-medium mb-2">{t('linkForSharing')}:</p>
              <p className="text-xs text-gray-500 break-all font-mono bg-white p-2 rounded border">
                {getCheckoutLink()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{t('instructionsForUse')}:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">📱 {t('forTabletKiosk')}</h4>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>• {t('clickOpenTerminal')}</li>
                <li>• {t('placeTabletAtEntrance')}</li>
                <li>• {t('guestsCanSelfRegister')}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">✉️ {t('forEmailInvitations')}</h4>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>• {t('copyLinkAndSend')}</li>
                <li>• {t('guestsCanPreRegister')}</li>
                <li>• {t('worksOnAllDevices')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GuestPanel