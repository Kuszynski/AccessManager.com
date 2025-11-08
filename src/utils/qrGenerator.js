import QRCode from 'qrcode'

export const generateQRCode = async (data) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    return qrCodeDataURL
  } catch (error) {
    console.error('Błąd generowania kodu QR:', error)
    throw error
  }
}

export const generateVisitorQR = (visitorId) => {
  return `SAFEVISIT_${visitorId}_${Date.now()}`
}