import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { dbHelpers, supabase } from '../utils/supabase'
import { generateEvacuationList } from '../utils/pdfGenerator'
import { sendEmergencySMS, getEmergencyMessage } from '../utils/smsService'
import Layout from '../components/Layout'
import VisitorList from '../components/VisitorList'
import LanguageSelector from '../components/LanguageSelector'
import { useTranslation } from '../utils/translations'
import { AlertTriangle, Users, Download, Shield } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [company, setCompany] = useState(null)
  const [visitors, setVisitors] = useState([])
  const [todayCheckedOut, setTodayCheckedOut] = useState([])
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
      
      // Pobierz gości ze statusem 'in' i 'out' (wymeldowanych z ostatnich 24h)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      
      console.log('Loading visitors - oneDayAgo:', oneDayAgo)
      
      // Pobierz TYLKO gości z tej firmy - BEZPIECZEŃSTWO!
      const { data: allVisitors, error } = await supabase
        .from('visitors')
        .select('*')
        .eq('company_id', companyData.id)
        .order('check_in_time', { ascending: false })
      
      // Filtruj gości: aktywni + wymeldowani w ciągu 24h
      const filteredVisitors = allVisitors?.filter(visitor => {
        if (visitor.status === 'in') return true
        if (visitor.status === 'out' && visitor.check_out_time) {
          const checkOutTime = new Date(visitor.check_out_time)
          const oneDayAgoDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
          return checkOutTime >= oneDayAgoDate
        }
        return false
      }) || []
      
      // Pobierz dzisiejszych wymeldowanych gości
      const todayCheckedOut = allVisitors?.filter(visitor => {
        if (visitor.status === 'out') {
          if (visitor.check_out_time) {
            const checkOutTime = new Date(visitor.check_out_time)
            return checkOutTime >= todayStart
          }
          // Jeśli brak check_out_time, sprawdź created_at
          const createdTime = new Date(visitor.created_at)
          return createdTime >= todayStart
        }
        return false
      }) || []
      
      if (error) {
        console.error('Dashboard - Błąd pobierania gości:', error)
      }
      
      console.log('Dashboard - Wszyscy goście:', allVisitors)
      console.log('Dashboard - Przefiltrowane goście:', filteredVisitors)
      console.log('Dashboard - Dzisiejsi wymeldowani:', todayCheckedOut)
      setVisitors(filteredVisitors)
      
      // Ustaw wymeldowanych gości w osobnym stanie
      setTodayCheckedOut(todayCheckedOut)
      
      // Automatycznie usuń gości wymeldowanych ponad 24h temu
      const { data: deletedVisitors } = await supabase
        .from('visitors')
        .delete()
        .eq('status', 'out')
        .lt('check_out_time', oneDayAgo)
        .select()
      
      if (deletedVisitors?.length > 0) {
        console.log('Auto-deleted old visitors:', deletedVisitors)
      }
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
      // Oznacz gościa jako wymeldowanego zamiast usuwania
      const { error } = await supabase
        .from('visitors')
        .update({
          status: 'out',
          check_out_time: new Date().toISOString()
        })
        .eq('id', visitorId)
      
      if (error) throw error
      
      await loadData() // Odśwież listę
    } catch (error) {
      console.error('Błąd wymeldowania:', error)
      alert('Błąd wymeldowania gościa')
    }
  }

  const handleFireAlarm = async () => {
    if (!window.confirm(t('confirmAlarm'))) {
      return
    }

    setAlertLoading(true)
    try {
      // Zapisz alert w bazie
      await dbHelpers.createAlert({
        type: 'fire',
        triggered_by: user.email,
        company_id: company.id
      })

      const companyName = company?.name || 'Nieznana firma'
      
      // Wyślij powiadomienia do wszystkich gości z emailem
      const guestsWithEmail = visitors.filter(v => v.email)
      console.log(`Sending notifications to ${guestsWithEmail.length} guests...`)
      
      const emergencyMessage = getEmergencyMessage(companyName, language)
      
      let notificationResults = []
      for (const visitor of guestsWithEmail) {
        try {
          const result = await sendEmergencySMS(visitor.email, emergencyMessage, language)
          notificationResults.push({ 
            visitor: visitor.full_name, 
            success: result.success, 
            simulation: result.simulation,
            provider: result.provider
          })
        } catch (error) {
          console.error(`Notification error for ${visitor.full_name}:`, error)
          notificationResults.push({ visitor: visitor.full_name, success: false, error: error.message })
        }
      }

      // Generuj listę ewakuacyjną
      const pdf = generateEvacuationList(visitors, companyName, t)
      
      // Nazwa pliku w wybranym języku
      const fileName = language === 'no' ? 'evakuerings-liste' :
                      language === 'en' ? 'evacuation-list' :
                      'lista-ewakuacyjna'
      const date = new Date().toISOString().split('T')[0]
      pdf.save(`${fileName}-${date}.pdf`)

      // Pokaż wyniki
      const successCount = notificationResults.filter(r => r.success).length
      const simulationMode = notificationResults.some(r => r.simulation)
      
      console.log('Notification Results:', notificationResults)
      
      let message = `Fire alarm triggered!\n\n`
      message += `Current guests: ${visitors.length}\n`
      message += `Notifications sent: ${successCount}/${guestsWithEmail.length}\n`
      
      if (simulationMode) {
        message += `\n⚠️ Notification simulation mode (missing config)`
      } else if (successCount > 0) {
        message += `\n✅ Emergency notifications sent successfully`
      }
      
      alert(message)
      
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
        {/* Modern Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-6 bg-white rounded-2xl border border-gray-200 space-y-4 sm:space-y-0">
          <div className="flex items-center">
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
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {company?.name || 'AccessManager'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                {company?.address || 'Visitor Management System'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end space-x-4">
            <LanguageSelector 
              currentLanguage={language} 
              onLanguageChange={setLanguage}
            />
            <div className="text-right">
              <div className="text-xs sm:text-sm text-gray-500">{new Date().toLocaleDateString('no-NO')}</div>
              <div className="text-sm sm:text-lg font-semibold text-gray-900">{new Date().toLocaleTimeString('no-NO', {hour: '2-digit', minute: '2-digit'})}</div>
            </div>
          </div>
        </div>

        {/* Nowoczesne karty akcji */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Statystyka gości */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{t('currentGuests')}</p>
                <p className="text-3xl font-bold text-gray-900">{visitors.length}</p>
              </div>
              <div className="bg-gray-100 rounded-full p-3">
                <Users className="h-8 w-8 text-gray-600" />
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
            <Link
              to={`/panel/${company?.id || 'demo'}`}
              className="flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold"
            >
              <Users className="h-6 w-6 mr-3" />
              {t('guestPanel')}
            </Link>
            <Link
              to={`/lobby/${company?.id || 'demo'}`}
              className="flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg font-semibold"
            >
              <Shield className="h-6 w-6 mr-3" />
              {language === 'no' ? 'Terminal for Gjester' :
               language === 'en' ? 'Guest Terminal' :
               'Terminal dla Gości'}
            </Link>
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

        {/* Dzisiejsi wymeldowani - szybki podgląd */}
        {todayCheckedOut.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              I dag utsjekket ({todayCheckedOut.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Navn</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bedrift</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inngang</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utgang</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Varighet</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {todayCheckedOut.slice(0, 5).map((visitor) => {
                    const checkIn = new Date(visitor.check_in_time)
                    const checkOut = visitor.check_out_time ? new Date(visitor.check_out_time) : new Date()
                    const duration = Math.round((checkOut - checkIn) / (1000 * 60)) // minuty
                    const hours = Math.floor(duration / 60)
                    const minutes = duration % 60
                    
                    return (
                      <tr key={visitor.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {visitor.full_name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {visitor.company_name || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {checkIn.toLocaleTimeString('no-NO', {hour: '2-digit', minute: '2-digit'})}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {visitor.check_out_time ? checkOut.toLocaleTimeString('no-NO', {hour: '2-digit', minute: '2-digit'}) : 'Nettopp'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {hours > 0 ? `${hours}t ${minutes}m` : `${minutes}m`}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {todayCheckedOut.length > 5 && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Viser 5 av {todayCheckedOut.length} utsjekket i dag
                </p>
              )}
            </div>
          </div>
        )}

        {/* Lista gości */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Gjester ({visitors.filter(v => v.status === 'in').length} inne)
            </h3>
            <div className="flex space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                • Inne
              </span>
            </div>
          </div>
          <VisitorList
            visitors={visitors.filter(v => v.status === 'in')}
            onCheckOut={handleCheckOut}
            onPrintBadge={handlePrintBadge}
            company={company}
            t={t}
          />
        </div>



      </div>
    </Layout>
  )
}

export default Dashboard