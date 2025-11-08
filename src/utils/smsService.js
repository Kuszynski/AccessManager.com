// SMS Service dla powiadomień alarmowych
export const sendEmergencySMS = async (phoneNumber, message, language = 'no') => {
  // Sprawdź czy są skonfigurowane klucze
  const emailjsServiceId = process.env.REACT_APP_EMAILJS_SERVICE_ID
  const emailjsTemplateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID
  const emailjsPublicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY

  console.log('=== NOTIFICATION CONFIG ===')
  console.log('EmailJS Service:', emailjsServiceId ? 'OK' : 'BRAK')
  console.log('Contact:', phoneNumber)
  console.log('========================')

  try {
    if (emailjsServiceId && emailjsTemplateId && emailjsPublicKey) {
      console.log(`Sending email notification to: ${phoneNumber}`)
      const result = await sendEmailNotification(phoneNumber, message)
      console.log('Email sent successfully:', result)
      return result
    } else {
      console.log('=== NOTIFICATION SIMULATION ===')
      console.log(`To: ${phoneNumber}`)
      console.log(`Message: ${message}`)
      console.log('Reason: Missing EmailJS config')
      console.log('======================')
      return { success: true, simulation: true }
    }
  } catch (error) {
    console.error('Notification sending error:', error)
    return { success: false, error: error.message }
  }
}

const sendEmailNotification = async (email, message) => {
  const emailjs = await import('@emailjs/browser')
  
  const templateParams = {
    to_email: email,
    message: message,
    from_name: 'AccessManager Security System'
  }
  
  const result = await emailjs.send(
    process.env.REACT_APP_EMAILJS_SERVICE_ID,
    process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
    templateParams,
    process.env.REACT_APP_EMAILJS_PUBLIC_KEY
  )
  
  return { success: true, provider: 'emailjs', messageId: result.text }
}

const sendSMSAPI = async (to, message, token) => {
  const response = await fetch('https://api.smsapi.pl/sms.do', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      to: to,
      message: message,
      from: 'SafeVisit'
    })
  })

  if (!response.ok) {
    throw new Error(`SMSAPI error: ${response.status}`)
  }

  return { success: true, provider: 'smsapi' }
}

export const getEmergencyMessage = (companyName, language = 'en') => {
  const messages = {
    no: `🚨 BRANNALARM - ${companyName}! Forlat bygningen umiddelbart og møt opp på samlingspunktet foran kontoret. Følg evakueringsrutinene. - AccessManager`,
    en: `🚨 FIRE ALARM - ${companyName}! Leave the building immediately and proceed to the assembly point in front of the office. Follow evacuation procedures. - AccessManager`,
    pl: `🚨 ALARM POŻAROWY - ${companyName}! Natychmiast opuść budynek i udaj się na miejsce zbiórki przed biurem. Postępuj zgodnie z procedurami ewakuacyjnymi. - AccessManager`
  }
  
  return messages[language] || messages['en']
}