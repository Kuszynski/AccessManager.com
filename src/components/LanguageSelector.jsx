import React from 'react'

const LanguageSelector = ({ currentLanguage, onLanguageChange }) => {
  const languages = [
    { code: 'no', name: 'NO', flag: '🇳🇴' },
    { code: 'en', name: 'EN', flag: '🇬🇧' },
    { code: 'pl', name: 'PL', flag: '🇵🇱' }
  ]

  return (
    <div className="inline-flex items-center bg-gray-100 px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-200 transition-all duration-200">
      <select
        value={currentLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="text-lg bg-transparent border-none focus:outline-none cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="text-gray-800 bg-white">
            {lang.flag}
          </option>
        ))}
      </select>
    </div>
  )
}

export default LanguageSelector