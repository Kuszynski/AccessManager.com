// Funkcja do wysyłania emaili z identyfikatorem
export const sendVisitorBadgeEmail = async (visitor, pdfBlob) => {
  // W prawdziwej aplikacji użyj EmailJS lub Supabase Edge Functions
  
  // Przykład z EmailJS (wymaga konfiguracji)
  if (window.emailjs) {
    try {
      // Konwertuj PDF do base64
      const reader = new FileReader()
      reader.readAsDataURL(pdfBlob)
      
      reader.onload = async () => {
        const base64PDF = reader.result.split(',')[1]
        
        await window.emailjs.send(
          'YOUR_SERVICE_ID', // Skonfiguruj w EmailJS
          'YOUR_TEMPLATE_ID', // Skonfiguruj w EmailJS
          {
            to_email: visitor.email,
            visitor_name: visitor.full_name,
            company_name: visitor.company_name || 'Brak',
            host_name: visitor.host_name,
            pdf_attachment: base64PDF
          },
          'YOUR_PUBLIC_KEY' // Klucz publiczny EmailJS
        )
        
        console.log('Email wysłany pomyślnie!')
      }
    } catch (error) {
      console.error('Błąd wysyłania emaila:', error)
    }
  } else {
    // Fallback - pokaż link do pobrania
    const url = URL.createObjectURL(pdfBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `identyfikator-${visitor.full_name.replace(/\s+/g, '-')}.pdf`
    a.click()
    URL.revokeObjectURL(url)
    
    alert(`Email nie został skonfigurowany. PDF został pobrany lokalnie.\nGdyby email był skonfigurowany, zostałby wysłany na: ${visitor.email}`)
  }
}

// Alternatywna funkcja używająca Supabase Edge Functions
export const sendEmailViaSupabase = async (visitor, pdfBase64) => {
  const { supabase } = await import('./supabase')
  
  try {
    const { data, error } = await supabase.functions.invoke('send-visitor-email', {
      body: {
        to: visitor.email,
        visitor: visitor,
        pdfAttachment: pdfBase64
      }
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Błąd wysyłania emaila przez Supabase:', error)
    throw error
  }
}