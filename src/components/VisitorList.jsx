import React from 'react'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { LogOut, QrCode, User, Building, Phone, Clock } from 'lucide-react'

const VisitorList = ({ visitors, onCheckOut, t }) => {
  if (!visitors || visitors.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>{t ? t('noGuests') : 'Ingen gjester på området'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {visitors.map((visitor) => (
        <div key={visitor.id} className="bg-white p-4 rounded-lg shadow border">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900">
                {visitor.full_name}
              </h3>
              
              <div className="mt-2 space-y-1 text-sm text-gray-600">
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
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {t ? t('checkIn') : 'Wejście'}: {format(new Date(visitor.check_in_time), 'dd.MM.yyyy HH:mm', { locale: pl })}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => onCheckOut(visitor.id)}
                className="flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                <LogOut className="h-4 w-4 mr-1" />
                {t ? t('checkOut') : 'Wymelduj'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default VisitorList