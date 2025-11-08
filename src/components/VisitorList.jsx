import React, { useState } from 'react'
import { sendHostNotification } from '../utils/hostNotification'
import { LogOut, User, Building, Phone, Clock, Mail, Bell } from 'lucide-react'

// Prosta funkcja formatowania daty
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('no-NO', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const VisitorList = ({ visitors, onCheckOut, t, company }) => {
  const [notifyingGuest, setNotifyingGuest] = useState(null)
  
  // Podziel gości na obecnych i wymeldowanych
  const activeVisitors = visitors.filter(v => v.status === 'in')
  const checkedOutVisitors = visitors.filter(v => v.status === 'out')

  const handleNotifyHost = async (visitor) => {
    if (!visitor.host_email) {
      alert('No host email available for this guest')
      return
    }

    setNotifyingGuest(visitor.id)
    try {
      const result = await sendHostNotification(
        visitor.host_email,
        visitor.full_name,
        company?.name || 'Company',
        'arrival',
        visitor.company_name
      )
      
      if (result.success) {
        alert(`Email sent to ${visitor.host_email}`)
      } else {
        alert(`Failed to send email: ${result.error}`)
      }
    } catch (error) {
      console.error('Notification error:', error)
      alert('Failed to send notification')
    } finally {
      setNotifyingGuest(null)
    }
  }
  if (!visitors || visitors.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>{t ? t('noGuests') : 'Ingen gjester på området'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Obecni goście */}
      {activeVisitors.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-green-800 border-b border-green-200 pb-2">
            Gjester inne ({activeVisitors.length})
          </h4>
          {activeVisitors.map((visitor) => (
            <VisitorCard 
              key={visitor.id} 
              visitor={visitor} 
              onCheckOut={onCheckOut}
              onNotifyHost={handleNotifyHost}
              notifyingGuest={notifyingGuest}
              t={t}
              isActive={true}
            />
          ))}
        </div>
      )}
      
      {/* Wymeldowani goście */}
      {checkedOutVisitors.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-600 border-b border-gray-200 pb-2">
            Nylig utsjekket ({checkedOutVisitors.length})
          </h4>
          {checkedOutVisitors.map((visitor) => (
            <VisitorCard 
              key={visitor.id} 
              visitor={visitor} 
              onCheckOut={onCheckOut}
              onNotifyHost={handleNotifyHost}
              notifyingGuest={notifyingGuest}
              t={t}
              isActive={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Komponent karty gościa
const VisitorCard = ({ visitor, onCheckOut, onNotifyHost, notifyingGuest, t, isActive }) => {
  return (
    <div className={`p-4 rounded-lg shadow border ${
      isActive ? 'bg-white border-green-200' : 'bg-gray-50 border-gray-200 opacity-75'
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center">
            <h3 className={`font-semibold text-lg ${
              isActive ? 'text-gray-900' : 'text-gray-600'
            }`}>
              {visitor.full_name}
            </h3>
            <span className={`ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {isActive ? 'Inne' : 'Utsjekket'}
            </span>
          </div>
              
          <div className={`mt-2 space-y-1 text-sm ${
            isActive ? 'text-gray-600' : 'text-gray-500'
          }`}>
            {visitor.company_name && (
              <div className="flex items-center">
                <Building className="h-4 w-4 mr-2" />
                {visitor.company_name}
              </div>
            )}
            
            {visitor.phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                {visitor.phone}
              </div>
            )}
            
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              {t ? t('visiting') : 'Besøker'}: {visitor.host_name}
            </div>
            
            {visitor.host_email && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Host: {visitor.host_email}
              </div>
            )}
            
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Inn: {formatDate(visitor.check_in_time)}
            </div>
            
            {!isActive && visitor.check_out_time && (
              <div className="flex items-center">
                <LogOut className="h-4 w-4 mr-2" />
                Ut: {formatDate(visitor.check_out_time)}
              </div>
            )}
          </div>
        </div>
        
        {isActive && (
          <div className="flex flex-col space-y-2 ml-4">
            {visitor.host_email && (
              <button
                onClick={() => onNotifyHost(visitor)}
                disabled={notifyingGuest === visitor.id}
                className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {notifyingGuest === visitor.id ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    Sender...
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    Varsle vert
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={() => onCheckOut(visitor.id)}
              className="flex items-center px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sjekk ut
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default VisitorList