import React from 'react'
import { Globe } from 'lucide-react'

const LanguageSelector = ({ currentLanguage, onLanguageChange }) => {
  const languages = [
    { code: 'no', name: 'NO', flag: '🇳🇴' },
    { code: 'en', name: 'EN', flag: '🇬🇧' },
    { code: 'pl', name: 'PL', flag: '🇵🇱' }
  ]

  return (
    <div className="flex items-center space-x-2 bg-white p-3 rounded-full shadow-lg border border-white/20">
      <Globe className="h-4 w-4 text-gray-600" />
      <select
        value={currentLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="text-sm bg-white border-none focus:outline-none cursor-pointer text-gray-800 font-medium pr-1"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="text-gray-800">
            {lang.flag}
          </option>
        ))}
      </select>
    </div>
  )
}

export default LanguageSelector