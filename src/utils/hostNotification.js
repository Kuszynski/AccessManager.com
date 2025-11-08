// Host notification service
import { sendEmergencySMS } from './smsService'

export const sendHostNotification = async (hostEmail, guestName, companyName, action = 'arrival', guestCompany = '') => {
  const emailjs = await import('@emailjs/browser')
  
  const templateParams = {
    host_email: hostEmail,
    guest_name: guestName,
    guest_company: guestCompany || 'Not specified',
    company_name: companyName,
    arrival_time: new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    from_name: 'AccessManager Notifications'
  }

  try {
    const templateId = action === 'arrival' 
      ? process.env.REACT_APP_EMAILJS_HOST_TEMPLATE_ID || process.env.REACT_APP_EMAILJS_TEMPLATE_ID
      : process.env.REACT_APP_EMAILJS_TEMPLATE_ID

    const result = await emailjs.send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID,
      templateId,
      templateParams,
      process.env.REACT_APP_EMAILJS_PUBLIC_KEY
    )
    
    console.log(`Host notification sent to ${hostEmail}:`, result)
    return { success: true, provider: 'emailjs', messageId: result.text }
  } catch (error) {
    console.error('Host notification error:', error)
    return { success: false, error: error.message }
  }
}