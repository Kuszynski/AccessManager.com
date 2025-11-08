import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { dbHelpers, supabase } from '../utils/supabase'
import { generateEvacuationList } from '../utils/pdfGenerator'
import Layout from '../components/Layout'
import VisitorList from '../components/VisitorList'
import LanguageSelector from '../components/LanguageSelector'
import { useTranslation } from '../utils/translations'
import { AlertTriangle, Users, Download, Shield } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [company, setCompany] = useState(null)
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [alertLoading, setAlertLoading] = useState(false)
  const [language, setLanguage] = useState('no')
  const { t } = useTranslation(language)

  useEffect(() => {
    loadData()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    if (!user) return

    try {
      let companyData = await dbHelpers.getUserCompany(user.email)
      
      // Fallback - jeśli nie znaleziono firmy po emailu, pobierz pierwszą
      if (!companyData) {
        console.log('Nie znaleziono firmy po emailu, pobieram pierwszą z bazy')
        const { data: firstCompany } = await supabase
          .from('companies')
          .select('*')
          .limit(1)
          .single()
        companyData = firstCompany
      }
      
      console.log('Dashboard - Company data:', companyData)
      setCompany(companyData)
      
      // Zawsze pobierz wszystkich gości ze statusem 'in'
      const { data: allVisitors, error } = await supabase
        .from('visitors')
        .select('*')
        .eq('status', 'in')
        .order('check_in_time', { ascending: false })
      
      if (error) {
        console.error('Dashboard - Błąd pobierania gości:', error)
      }
      
      console.log('Dashboard - Wszyscy goście:', allVisitors)
      setVisitors(allVisitors || [])
    } catch (error) {
      console.error('Dashboard - Błąd ładowania danych:', error)
      setVisitors([])
    } finally {
      setLoading(false)
    }
    
    // Nie pobieramy wymeldowanych - dane są usuwane przy checkout
  }

  const handleCheckOut = async (visitorId) => {
    try {
      // Usuń dane gościa natychmiast (GDPR-friendly)
      const { error } = await supabase
        .from('visitors')
        .delete()
        .eq('id', visitorId)
      
      if (error) throw error
      
      await loadData() // Odśwież listę
    } catch (error) {
      console.error('Błąd wymeldowania:', error)
      alert('Błąd wymeldowania gościa')
    }
  }

  const handleFireAlarm = async () => {
    if (!window.confirm('Czy na pewno chcesz wywołać alarm pożarowy?')) {
      return
    }

    setAlertLoading(true)
    try {
      // Zapisz alert w bazie
      await dbHelpers.createAlert({
        type: 'fire',
        triggered_by: user.id,
        company_id: company.id
      })

      // Generuj listę ewakuacyjną
      console.log('Company data:', company)
      const companyName = company?.name || 'Nieznana firma'
      const pdf = generateEvacuationList(visitors, companyName, t)
      
      // Nazwa pliku w wybranym języku
      const fileName = language === 'no' ? 'evakuerings-liste' :
                      language === 'en' ? 'evacuation-list' :
                      'lista-ewakuacyjna'
      const date = new Date().toISOString().split('T')[0]
      pdf.save(`${fileName}-${date}.pdf`)

      // Tutaj można dodać wysyłanie SMS (wymaga integracji z Twilio/SMSAPI)
      alert(`Alarm wywołany! Lista ewakuacyjna została wygenerowana. Obecnych gości: ${visitors.length}`)
      
    } catch (error) {
      console.error('Błąd wywołania alarmu:', error)
      alert('Błąd wywołania alarmu')
    } finally {
      setAlertLoading(false)
    }
  }

  const handlePrintBadge = async (visitor) => {
    try {
      // Wygeneruj kod QR dla gościa
      const { generateQRCode } = await import('../utils/qrGenerator')
      const { generateVisitorBadge } = await import('../utils/pdfGenerator')
      
      const qrCodeDataURL = await generateQRCode(visitor.qr_code_id)
      const badge = await generateVisitorBadge(visitor, qrCodeDataURL)
      
      // Otwórz PDF w nowym oknie
      badge.output('dataurlnewwindow')
    } catch (error) {
      console.error('Błąd drukowania identyfikatora:', error)
      alert('Błąd generowania identyfikatora')
    }
  }

  if (loading) {
    return (
      <Layout title={t('dashboard')} t={t}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={t('dashboard')} t={t}>
      <div className="space-y-6">
        {/* Nowoczesny nagłówek firmy */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 mr-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{company?.name}</h1>
                <div className="flex items-center text-blue-100 mb-1">
                  <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {company?.address}
                </div>
                {company?.phone && (
                  <div className="flex items-center text-blue-100">
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    {company.phone}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector 
                currentLanguage={language} 
                onLanguageChange={setLanguage}
                variant="light"
              />
              <div className="text-right">
                <div className="text-sm text-blue-200">{new Date().toLocaleDateString('no-NO')}</div>
                <div className="text-lg font-semibold">{new Date().toLocaleTimeString('no-NO', {hour: '2-digit', minute: '2-digit'})}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Nowoczesne karty akcji */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Statystyka gości */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{t('currentGuests')}</p>
                <p className="text-3xl font-bold text-gray-900">{visitors.length}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Alarm pożarowy */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <button
              onClick={handleFireAlarm}
              disabled={alertLoading}
              className="w-full h-full flex flex-col items-center justify-center px-4 py-6 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
            >
              <AlertTriangle className="h-8 w-8 mb-2" />
              <span className="font-semibold">
                {alertLoading ? t('triggeringAlarm') : t('fireAlarm')}
              </span>
            </button>
          </div>

          {/* Eksport listy */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <button
              onClick={() => {
                console.log('Company data for export:', company)
                const companyName = company?.name || 'Nieznana firma'
                const pdf = generateEvacuationList(visitors, companyName, t)
                
                // Nazwa pliku w wybranym języku
                const fileName = language === 'no' ? 'gjester-liste' :
                                language === 'en' ? 'guest-list' :
                                'lista-gosci'
                const date = new Date().toISOString().split('T')[0]
                pdf.save(`${fileName}-${date}.pdf`)
              }}
              className="w-full h-full flex flex-col items-center justify-center px-4 py-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
            >
              <Download className="h-8 w-8 mb-2" />
              <span className="font-semibold">{t('exportList')}</span>
            </button>
          </div>
        </div>

        {/* Panel gości */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">{t('guestTerminals')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href={`/panel/${company?.id || 'demo'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold"
            >
              <Users className="h-6 w-6 mr-3" />
              {t('guestPanel')}
            </a>
            <a
              href={`/lobby/${company?.id || 'demo'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg font-semibold"
            >
              <Shield className="h-6 w-6 mr-3" />
              {language === 'no' ? 'Terminal for Gjester' :
               language === 'en' ? 'Guest Terminal' :
               'Terminal dla Gości'}
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <p className="text-blue-700 text-sm text-center">
              {t('guestPanelDescription')}
            </p>
            <div className="text-green-700 text-sm">
              <p className="text-center mb-2">
                {language === 'no' ? 'Selvbetjent terminal for gjester. Sett opp på tablet i resepsjonen eller hol.' :
                 language === 'en' ? 'Self-service terminal for guests. Set up on tablet in reception or lobby.' :
                 'Samoobsługowy terminal dla gości. Ustaw na tablecie w recepcji lub holu.'}
              </p>
              <div className="bg-green-50 p-3 rounded border">
                <p className="font-medium mb-1">
                  {language === 'no' ? 'Direkte link til terminal:' :
                   language === 'en' ? 'Direct link to terminal:' :
                   'Bezpośredni link do terminala:'}
                </p>
                <p className="text-xs font-mono bg-white p-2 rounded border break-all">
                  {window.location.origin}/lobby/{company?.id || 'demo'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista obecnych gości */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('currentGuests')} ({visitors.length})
          </h3>
          <VisitorList
            visitors={visitors}
            onCheckOut={handleCheckOut}
            onPrintBadge={handlePrintBadge}
            t={t}
          />
        </div>


      </div>
    </Layout>
  )
}

export default Dashboard