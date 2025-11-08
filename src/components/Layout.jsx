import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../utils/supabase'
import { LogOut, Shield, Settings, Upload, X } from 'lucide-react'

const Layout = ({ children, title, t }) => {
  const { user, signOut } = useAuth()
  const [showSettings, setShowSettings] = useState(false)
  const [company, setCompany] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    if (user) {
      console.log('Layout - loading company for user:', user.email)
      loadCompany()
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadCompany = async () => {
    try {
      console.log('Layout - loadCompany started for:', user?.email)
      // Znajdź firmę użytkownika po emailu
      const { data: userCompany, error } = await supabase
        .from('companies')
        .select('*')
        .eq('admin_email', user.email)
        .single()
      
      console.log('Layout - query result:', userCompany, error)
      
      if (userCompany) {
        setCompany(userCompany)
        console.log('Layout - user company:', userCompany.name, 'role:', userCompany.role)
        console.log('Layout - setting isSuperAdmin to:', userCompany.role === 'super_admin')
        setIsSuperAdmin(userCompany.role === 'super_admin')
      } else {
        console.log('Layout - no user company found, using fallback')
        // Fallback - pierwsza firma
        const { data: firstCompany } = await supabase
          .from('companies')
          .select('*')
          .limit(1)
          .single()
        setCompany(firstCompany)
        setIsSuperAdmin(false)
      }
    } catch (error) {
      console.error('Layout - Error loading company:', error)
      setIsSuperAdmin(false)
    }
  }

  const handleLogoUpload = async () => {
    if (!logoFile || !company) return
    
    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const logoUrl = e.target.result
          
          const { error } = await supabase
            .from('companies')
            .update({ logo_url: logoUrl })
            .eq('id', company.id)
          
          if (error) {
            console.error('Supabase error:', error)
            throw new Error(error.message || 'Database update failed')
          }
          
          setCompany({ ...company, logo_url: logoUrl })
          setShowSettings(false)
          setLogoFile(null)
          
          // Reload page to update logo everywhere
          window.location.reload()
        } catch (innerError) {
          console.error('Inner upload error:', innerError)
          alert('Feil ved opplasting av logo: ' + innerError.message)
          setUploading(false)
        }
      }
      
      reader.onerror = () => {
        console.error('FileReader error')
        alert('Feil ved lesing av fil')
        setUploading(false)
      }
      
      reader.readAsDataURL(logoFile)
    } catch (error) {
      console.error('Logo upload error:', error)
      alert('Feil ved opplasting av logo: ' + (error.message || 'Ukjent feil'))
      setUploading(false)
    }
  }

  const removeLogo = async () => {
    if (!company) return
    
    try {
      const { error } = await supabase
        .from('companies')
        .update({ logo_url: null })
        .eq('id', company.id)
      
      if (error) {
        console.error('Supabase error:', error)
        throw new Error(error.message || 'Database update failed')
      }
      
      setCompany({ ...company, logo_url: null })
      
      // Reload page to update logo everywhere
      window.location.reload()
    } catch (error) {
      console.error('Error removing logo:', error)
      alert('Feil ved fjerning av logo: ' + (error.message || 'Ukjent feil'))
    }
  }

  const handleSignOut = async () => {
    console.log('handleSignOut clicked')
    try {
      console.log('Calling signOut...')
      await signOut()
      console.log('SignOut successful, redirecting...')
      // Przekieruj do strony logowania
      window.location.href = '/login'
    } catch (error) {
      console.error('Błąd wylogowania:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">AccessManager</h1>
              {title && (
                <>
                  <span className="mx-3 text-gray-400">|</span>
                  <span className="text-gray-600">{title}</span>
                </>
              )}
            </div>
            
            {user && (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">{t ? t('dashboard') : 'Dashboard'}</Link>
                <Link to="/reception" className="text-sm text-gray-600 hover:text-gray-900">{t ? t('reception') : 'Reception'}</Link>
                {/* Zatwierdzanie tylko dla super-admina */}
                {isSuperAdmin && (
                  <Link to="/admin/approval" className="text-sm text-gray-600 hover:text-gray-900">Zatwierdzanie</Link>
                )}
                <span className="text-sm text-gray-600">{user.email}</span>
                <Link
                  to="/settings"
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  {t ? t('settings') || 'Innstillinger' : 'Innstillinger'}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  {t ? t('logout') : 'Logg ut'}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {t ? t('settings') || 'Innstillinger' : 'Innstillinger'}
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t ? t('companyLogo') || 'Bedriftslogo' : 'Bedriftslogo'}
                </label>
                
                {company?.logo_url && (
                  <div className="mb-4">
                    <img 
                      src={company.logo_url} 
                      alt="Current logo"
                      className="h-16 w-auto border border-gray-200 rounded-lg"
                    />
                    <button
                      onClick={removeLogo}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      {t ? t('removeLogo') || 'Fjern logo' : 'Fjern logo'}
                    </button>
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
                
                {logoFile && (
                  <button
                    onClick={handleLogoUpload}
                    disabled={uploading}
                    className="mt-3 w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center"
                  >
                    {uploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {uploading ? (t ? t('uploading') || 'Laster opp...' : 'Laster opp...') : (t ? t('uploadLogo') || 'Last opp logo' : 'Last opp logo')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Layout