import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { LogOut, Shield } from 'lucide-react'

const Layout = ({ children, title, t }) => {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">SafeVisit</h1>
              {title && (
                <>
                  <span className="mx-3 text-gray-400">|</span>
                  <span className="text-gray-600">{title}</span>
                </>
              )}
            </div>
            
            {user && (
              <div className="flex items-center space-x-4">
                <a href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">{t ? t('panel') : 'Panel'}</a>
                <a href="/reception" className="text-sm text-gray-600 hover:text-gray-900">{t ? t('reception') : 'Recepcja'}</a>
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  {t ? t('logout') : 'Wyloguj'}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

export default Layout