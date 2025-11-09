import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

// Simple imports without lazy loading
import ErrorBoundary from './components/ErrorBoundary'
import { useAuth } from './hooks/useAuth'

// Import pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Reception from './pages/Reception'
import AdminApproval from './pages/AdminApproval'
import Settings from './pages/Settings'
import GuestTerminal from './pages/GuestTerminal'
import CheckoutTerminal from './pages/CheckoutTerminal'
import GuestPanel from './pages/GuestPanel'
import GuestDashboard from './pages/GuestDashboard'
import PrivacyPolicy from './pages/PrivacyPolicy'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Fallback jeśli coś poszło nie tak
  if (!user && !loading) {
    console.log('No user, redirecting to login');
  }

  try {
    return (
      <ErrorBoundary>
        <Router>
          <Routes>
        {/* Publiczne trasy */}
        <Route path="/guest/:companyId" element={<GuestTerminal />} />
        <Route path="/checkout/:companyId" element={<CheckoutTerminal />} />
        <Route path="/panel/:companyId" element={<GuestPanel />} />
        <Route path="/lobby/:companyId" element={<GuestDashboard />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        
        {/* Trasy wymagające autoryzacji */}
        {user ? (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reception" element={<Reception />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin/approval" element={<AdminApproval />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
          </Routes>
        </Router>
      </ErrorBoundary>
    )
  } catch (error) {
    console.error('App render error:', error)
    return (
      <div className="min-h-screen bg-red-50 flex justify-center items-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Application Error</h1>
          <p className="text-red-500 mb-4">Something went wrong. Please refresh the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }
}

export default App