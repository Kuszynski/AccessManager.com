import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import LanguageSelector from '../components/LanguageSelector'
import { useTranslation } from '../utils/translations'
import { LogOut, Search, CheckCircle, ArrowLeft } from 'lucide-react'

const CheckoutTerminal = () => {
  const { companyId } = useParams()
  const [company, setCompany] = useState(null)
  const [language, setLanguage] = useState('no')
  const [phone, setPhone] = useState('')
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [checkedOut, setCheckedOut] = useState(null)
  const { t } = useTranslation(language)

  useEffect(() => {
    loadCompany()
  }, [companyId])

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

  const resetForm = () => {
    setCheckedOut(null)
    setVisitors([])
    setPhone('')
  }

  if (checkedOut) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">{t('welcomeTo')} {company?.name}</h1>
                <p className="text-red-100 mt-2">{t('checkout')}</p>
              </div>
              <LanguageSelector 
                currentLanguage={language} 
                onLanguageChange={setLanguage}
                variant="light"
              />
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-white p-8 rounded-b-2xl shadow-lg">
            <div className="text-center">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('checkoutComplete')}
              </h2>
              <p className="text-lg text-gray-600 mb-2">
                <strong>{checkedOut.full_name}</strong> {t('hasBeenCheckedOut')}
              </p>
              <p className="text-gray-500 mb-8">{t('thanksForVisit')}</p>
              
              <button
                onClick={resetForm}
                className="bg-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center mx-auto"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                {t('checkoutAnother')}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{t('welcomeTo')} {company?.name}</h1>
              <p className="text-red-100 mt-2">{t('checkout')}</p>
            </div>
            <LanguageSelector 
              currentLanguage={language} 
              onLanguageChange={setLanguage}
              variant="light"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white p-8 rounded-b-2xl shadow-lg">
          {/* Phone Search Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Search className="h-6 w-6 mr-2 text-red-600" />
              {t('searchByPhone')}
            </h3>
            
            <div className="flex gap-4 mb-6">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('phonePlaceholder')}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
                onKeyPress={(e) => e.key === 'Enter' && searchVisitors()}
              />
              <button
                onClick={searchVisitors}
                disabled={loading || !phone.trim()}
                className="bg-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Search className="h-5 w-5 mr-2" />
                {loading ? '...' : t('search')}
              </button>
            </div>

            {/* Search Results */}
            {visitors.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">{t('guestsFound')}:</h4>
                {visitors.map((visitor) => (
                  <div key={visitor.id} className="bg-gray-50 p-4 rounded-xl border">
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="font-semibold text-lg">{visitor.full_name}</h5>
                        <p className="text-gray-600">{visitor.company_name}</p>
                        <p className="text-sm text-gray-500">
                          {t('visiting')}: {visitor.host_name}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCheckOut(visitor)}
                        disabled={checkingOut}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {checkingOut ? t('checkingOut') : t('checkOut')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {visitors.length === 0 && phone && !loading && (
              <p className="text-gray-500 text-center py-4">{t('noGuestsFound')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutTerminal