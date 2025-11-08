import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import VisitorForm from '../components/VisitorForm'
import LanguageSelector from '../components/LanguageSelector'
import { useTranslation } from '../utils/translations'
import { Shield, CheckCircle } from 'lucide-react'

const GuestTerminal = () => {
  const { companyId } = useParams()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [registered, setRegistered] = useState(false)

  const [language, setLanguage] = useState('no')
  const { t } = useTranslation(language)

  useEffect(() => {
    loadCompany()
  }, [companyId])

  const sendHostNotification = async (visitorData) => {
    // Symulacja wysyłania SMS - można zintegować z Twilio/SMSAPI
    const message = `${t('smsNotification') || 'Gjest ankommet'}: ${visitorData.full_name} ${visitorData.company_name ? `fra ${visitorData.company_name}` : ''} er nå på besøk.`
    
    console.log('SMS do:', visitorData.host_phone)
    console.log('Treść:', message)
    
    // Tutaj można dodać prawdziwą integrację SMS:
    // const response = await fetch('/api/send-sms', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ to: visitorData.host_phone, message })
    // })
    
    return Promise.resolve() // Symulacja sukcesu
  }

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
      const { data: visitor, error } = await supabase
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
      
      // Wyślij SMS do gospodarza jeśli podano telefon
      if (visitorData.host_phone) {
        try {
          await sendHostNotification(visitorData)
        } catch (smsError) {
          console.error('Błąd wysyłania SMS:', smsError)
          // Nie przerywamy procesu jeśli SMS się nie udał
        }
      }
      
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
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Firma nie znaleziona</h2>
          <p className="text-gray-600">Sprawdź poprawność linku</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nagłówek */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto px-6 py-12">
          <div className="flex justify-end mb-6">
            <LanguageSelector 
              currentLanguage={language} 
              onLanguageChange={setLanguage} 
            />
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-2">
              {company.name}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-4">
              {t('welcomeTo')} {company.name}
            </p>
            <p className="text-blue-200 text-lg">{company.address}</p>
          </div>
        </div>
      </div>

      {/* Główna zawartość */}
      <div className="max-w-2xl mx-auto px-6 py-8 -mt-8 relative z-10">
        {!registered ? (
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t('guestRegistration')}
              </h3>
              <p className="text-gray-600">Vennligst fyll ut informasjonen nedenfor</p>
            </div>
            <VisitorForm
              onSubmit={handleVisitorSubmit}
              loading={submitLoading}
              t={t}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t('registrationComplete')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('registrationSuccess')}
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => setRegistered(false)}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                {t('registerAnother')}
              </button>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                {t('keepQr')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GuestTerminal