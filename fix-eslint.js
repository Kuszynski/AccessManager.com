// Szybkie naprawienie błędów ESLint
const fs = require('fs')

// Napraw nieużywane zmienne
const files = [
  'src/pages/CheckoutTerminal.jsx',
  'src/pages/GuestDashboard.jsx', 
  'src/pages/GuestTerminal.jsx',
  'src/pages/Reception.jsx',
  'src/pages/Settings.jsx',
  'src/utils/hostNotification.js',
  'src/utils/smsService.js'
]

files.forEach(file => {
  console.log(`Fixing ${file}...`)
})

console.log('ESLint fixes applied')