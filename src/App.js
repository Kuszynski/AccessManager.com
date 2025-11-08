import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Reception from './pages/Reception'
import GuestTerminal from './pages/GuestTerminal'
import CheckoutTerminal from './pages/CheckoutTerminal'
import GuestPanel from './pages/GuestPanel'
import GuestDashboard from './pages/GuestDashboard'
import PrivacyPolicy from './pages/PrivacyPolicy'
import './index.css'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
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
            <Route path="/login" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </Router>
  )
}

export default App