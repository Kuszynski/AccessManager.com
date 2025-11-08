import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../hooks/useAuth'
import { Check, X, Clock, Building, Key } from 'lucide-react'

const AdminApproval = () => {
  const { user } = useAuth()
  const [pendingCompanies, setPendingCompanies] = useState([])
  const [approvedCompanies, setApprovedCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    checkSuperAdmin()
  }, [user])
  
  useEffect(() => {
    if (isSuperAdmin) {
      loadPendingCompanies()
      loadApprovedCompanies()
    }
  }, [isSuperAdmin])
  
  const checkSuperAdmin = async () => {
    if (!user) {
      setCheckingAuth(false)
      return
    }
    
    try {
      const { data } = await supabase
        .from('companies')
        .select('role')
        .eq('admin_email', user.email)
        .eq('role', 'super_admin')
        .single()
      
      setIsSuperAdmin(!!data)
    } catch (error) {
      setIsSuperAdmin(false)
    } finally {
      setCheckingAuth(false)
    }
  }

  const loadPendingCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setPendingCompanies(data || [])
    } catch (error) {
      console.error('Error loading pending companies:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const loadApprovedCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('status', 'approved')
        .neq('role', 'super_admin')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setApprovedCompanies(data || [])
    } catch (error) {
      console.error('Error loading approved companies:', error)
    }
  }

  const handleApproval = async (companyId, status) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ status })
        .eq('id', companyId)
      
      if (error) throw error
      
      // Odśwież listy
      loadPendingCompanies()
      loadApprovedCompanies()
      
      alert(`Firma została ${status === 'approved' ? 'zatwierdzona' : 'odrzucona'}`)
    } catch (error) {
      console.error('Error updating company status:', error)
      alert('Błąd podczas aktualizacji statusu firmy')
    }
  }
  
  const handlePasswordReset = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`
      })
      
      if (error) throw error
      
      alert(`Email z resetem hasła został wysłany na adres: ${email}`)
    } catch (error) {
      console.error('Error sending password reset:', error)
      alert('Błąd podczas wysyłania emaila z resetem hasła')
    }
  }

  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Brak dostępu</h2>
          <p className="text-gray-600">Nie masz uprawnień do tej strony</p>
          <a href="/" className="mt-4 inline-block bg-gray-900 text-white px-4 py-2 rounded-lg">Powrót do dashboardu</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Zatwierdzanie Firm
          </h1>
          <p className="text-gray-600">
            Zarządzaj rejestracjami firm oczekującymi na zatwierdzenie
          </p>
        </div>

        {pendingCompanies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Brak oczekujących firm
            </h3>
            <p className="text-gray-600">
              Wszystkie rejestracje zostały przetworzone
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingCompanies.map((company) => (
              <div key={company.id} className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-lg p-3 mr-4">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {company.name}
                      </h3>
                      <p className="text-gray-600 mb-2">{company.address}</p>
                      <div className="space-y-1 text-sm text-gray-500">
                        <p><strong>Email:</strong> {company.admin_email}</p>
                        <p><strong>Telefon:</strong> {company.phone || 'Nie podano'}</p>
                        <p><strong>Data rejestracji:</strong> {new Date(company.created_at).toLocaleDateString('pl-PL')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleApproval(company.id, 'approved')}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Zatwierdź
                      </button>
                      <button
                        onClick={() => handleApproval(company.id, 'rejected')}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Odrzuć
                      </button>
                    </div>
                    <button
                      onClick={() => handlePasswordReset(company.admin_email)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Reset hasła
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminApproval