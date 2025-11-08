import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import LanguageSelector from '../components/LanguageSelector'
import { useTranslation } from '../utils/translations'
import { Shield, LogIn, LogOut, Users, Mail, Tablet, ArrowLeft } from 'lucide-react'

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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-50 border border-gray-200 p-4 sm:p-6 rounded-2xl mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center">
              <a
                href="/dashboard"
                className="flex items-center bg-gray-100 hover:bg-gray-200 p-2 sm:px-4 sm:py-3 rounded-lg transition-colors mr-3 sm:mr-6"
              >
                <ArrowLeft className="h-4 w-4 sm:hidden text-gray-600" />
                <Shield className="hidden sm:block h-4 w-4 text-gray-600" />
                <span className="hidden sm:inline text-sm font-medium text-gray-600 ml-2">
                  {language === 'no' ? 'Tilbake' : language === 'en' ? 'Back' : 'Powrót'}
                </span>
              </a>
              {company?.logo_url ? (
                <img 
                  src={company.logo_url} 
                  alt={company.name}
                  className="h-8 sm:h-10 w-auto mr-3 sm:mr-4"
                />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                </div>
              )}
              <div className="min-w-0 flex-1 sm:hidden">
                <h1 className="text-lg font-bold text-gray-900 truncate">{company?.name || 'AccessManager'}</h1>
                <p className="text-xs text-gray-600 truncate">{company?.address || 'Visitor Management System'}</p>
              </div>
            </div>
            <div className="hidden sm:block text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{company?.name || 'AccessManager'}</h1>
              <p className="text-gray-600">{company?.address || 'Visitor Management System'}</p>
            </div>
            <div className="flex justify-center sm:justify-end">
              <LanguageSelector 
                currentLanguage={language} 
                onLanguageChange={setLanguage}
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-center">
            <Users className="h-8 w-8 text-gray-600 mr-4" />
            <div className="text-center">
              <p className="text-gray-600 text-lg">{t('currentGuests')}</p>
              <p className="text-4xl font-bold text-gray-900">{currentGuests}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
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

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
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

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
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