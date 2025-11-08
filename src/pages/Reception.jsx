import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { dbHelpers, supabase } from '../utils/supabase'
import Layout from '../components/Layout'
import VisitorForm from '../components/VisitorForm'
import VisitorList from '../components/VisitorList'
import LanguageSelector from '../components/LanguageSelector'
import { useTranslation } from '../utils/translations'
import { UserPlus, Users } from 'lucide-react'

const Reception = () => {
  const { user } = useAuth()
  const [company, setCompany] = useState(null)
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [language, setLanguage] = useState('no')
  const { t } = useTranslation(language)

  useEffect(() => {
    loadData()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    if (!user) return

    try {
      let companyData = await dbHelpers.getUserCompany(user.email)
      
      if (!companyData) {
        const { data: firstCompany } = await supabase
          .from('companies')
          .select('*')
          .limit(1)
          .single()
        companyData = firstCompany
      }
      
      console.log('Reception - Company data:', companyData)
      setCompany(companyData)
      
      // Pobierz wszystkich gości (aktywnych i wymeldowanych z ostatnich 24h)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      
      const { data: allVisitors, error } = await supabase
        .from('visitors')
        .select('*')
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
      
      if (error) {
        console.error('Reception - Błąd pobierania gości:', error)
      }
      
      console.log('Reception - Wszyscy goście:', allVisitors)
      console.log('Reception - Przefiltrowane goście:', filteredVisitors)
      setVisitors(filteredVisitors)
    } catch (error) {
      console.error('Reception - Błąd ładowania danych:', error)
      setVisitors([])
    } finally {
      setLoading(false)
    }
  }

  const handleVisitorSubmit = async (visitorData) => {
    setSubmitLoading(true)
    try {
      // Tymczasowo - użyj pierwszej firmy lub utwórz nową
      let companyId = company?.id
      if (!companyId) {
        const { data: companies } = await supabase.from('companies').select('id').limit(1)
        companyId = companies?.[0]?.id || 'temp-company-id'
      }
      
      // Zarejestruj gościa bez QR
      const { error } = await supabase
        .from('visitors')
        .insert([{
          ...visitorData,
          qr_code_id: `guest_${Date.now()}`, // Prosty identyfikator
          company_id: companyId,
          check_in_time: new Date().toISOString(),
          status: 'in'
        }])
        .select()
        .single()
      
      if (error) throw error

      // Odśwież listę i ukryj formularz
      await loadData()
      setShowForm(false)
      
      alert('Gość został zarejestrowany!')
      
    } catch (error) {
      console.error('Błąd rejestracji gościa:', error)
      alert('Błąd rejestracji gościa')
    } finally {
      setSubmitLoading(false)
    }
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



  if (loading) {
    return (
      <Layout title={t('reception')} t={t}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={t('reception')} t={t}>
      <div className="space-y-6">
        {/* Nagłówek */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('receptionPanel')} - {company?.name}
          </h2>
          <div className="flex items-center space-x-4">
            <LanguageSelector 
              currentLanguage={language} 
              onLanguageChange={setLanguage} 
            />
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              {showForm ? t('cancel') : t('newGuest')}
            </button>
          </div>
        </div>

        {/* Statystyki */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('currentGuests')}</p>
                <p className="text-2xl font-bold text-gray-900">{visitors.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <UserPlus className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('todayRegistered') || 'Today Registered'}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {visitors.filter(v => {
                    const today = new Date().toDateString()
                    const visitDate = new Date(v.check_in_time).toDateString()
                    return today === visitDate
                  }).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              {t('quickRegistration') || 'Quick Registration'}
            </button>
          </div>
        </div>

        {/* Formularz rejestracji */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('newGuestRegistration')}
            </h3>
            <VisitorForm
              onSubmit={handleVisitorSubmit}
              loading={submitLoading}
              t={t}
            />
          </div>
        )}



        {/* Lista obecnych gości */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('currentGuests')} ({visitors.length})
          </h3>
          <VisitorList
            visitors={visitors}
            onCheckOut={handleCheckOut}
            t={t}
          />
        </div>
      </div>
    </Layout>
  )
}

export default Reception