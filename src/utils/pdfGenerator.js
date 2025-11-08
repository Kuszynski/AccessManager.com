import jsPDF from 'jspdf'
import { format } from 'date-fns'


export const generateEvacuationList = (visitors, companyName, t) => {
  const doc = new jsPDF('landscape') // Orientacja pozioma dla większej przestrzeni
  
  // Nagłówek z tłem
  doc.setFillColor(240, 240, 240)
  doc.rect(10, 10, 277, 25, 'F')
  doc.setFontSize(18)
  doc.setFont(undefined, 'bold')
  doc.text(t ? t('evacuationList') : 'LISTA EWAKUACYJNA', 148, 25, { align: 'center' })
  
  // Informacje o firmie
  doc.setFont(undefined, 'normal')
  doc.setFontSize(12)
  doc.text(`${t ? t('companyHeader') : 'Firma'}: ${companyName}`, 15, 45)
  doc.text(`${t ? t('date') : 'Data'}: ${format(new Date(), 'dd.MM.yyyy HH:mm')}`, 15, 55)
  doc.text(`${t ? t('numberOfPeople') : 'Liczba osób'}: ${visitors.length}`, 200, 45)
  
  // Nagłówki tabeli z tłem
  let yPosition = 70
  doc.setFillColor(220, 220, 220)
  doc.rect(15, yPosition - 5, 267, 12, 'F')
  
  doc.setFont(undefined, 'bold')
  doc.setFontSize(10)
  doc.text(t ? t('serialNumber') : 'Lp.', 18, yPosition + 3)
  doc.text(t ? t('nameHeader') : 'Imię i nazwisko', 35, yPosition + 3)
  doc.text(t ? t('companyHeader') : 'Firma', 90, yPosition + 3)
  doc.text(t ? t('hostName') : 'Odwiedza', 140, yPosition + 3)
  doc.text(t ? t('phoneHeader') : 'Telefon', 190, yPosition + 3)
  doc.text(t ? t('checkIn') : 'Wejście', 240, yPosition + 3)
  
  // Linia pod nagłówkami
  yPosition += 8
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  doc.line(15, yPosition, 282, yPosition)
  yPosition += 8
  
  // Dane gości
  doc.setFont(undefined, 'normal')
  doc.setFontSize(9)
  
  visitors.forEach((visitor, index) => {
    if (yPosition > 190) {
      doc.addPage('landscape')
      yPosition = 30
      
      // Powtarzaj nagłówki na nowej stronie
      doc.setFillColor(220, 220, 220)
      doc.rect(15, yPosition - 5, 267, 12, 'F')
      doc.setFont(undefined, 'bold')
      doc.setFontSize(10)
      doc.text(t ? t('serialNumber') : 'Lp.', 18, yPosition + 3)
      doc.text(t ? t('nameHeader') : 'Imię i nazwisko', 35, yPosition + 3)
      doc.text(t ? t('companyHeader') : 'Firma', 90, yPosition + 3)
      doc.text(t ? t('hostName') : 'Odwiedza', 140, yPosition + 3)
      doc.text(t ? t('phoneHeader') : 'Telefon', 190, yPosition + 3)
      doc.text(t ? t('checkIn') : 'Wejście', 240, yPosition + 3)
      yPosition += 8
      doc.line(15, yPosition, 282, yPosition)
      yPosition += 8
      doc.setFont(undefined, 'normal')
      doc.setFontSize(9)
    }
    
    // Kolorowe tło co drugi wiersz
    if (index % 2 === 0) {
      doc.setFillColor(248, 248, 248)
      doc.rect(15, yPosition - 3, 267, 10, 'F')
    }
    
    // Dane gościa
    doc.text(`${index + 1}`, 18, yPosition + 2)
    
    // Skróć długie nazwy
    let name = visitor.full_name
    if (name.length > 20) name = name.substring(0, 17) + '...'
    doc.text(name, 35, yPosition + 2)
    
    let company = visitor.company_name || '-'
    if (company.length > 15) company = company.substring(0, 12) + '...'
    doc.text(company, 90, yPosition + 2)
    
    let host = visitor.host_name || '-'
    if (host.length > 15) host = host.substring(0, 12) + '...'
    doc.text(host, 140, yPosition + 2)
    
    doc.text(visitor.phone || '-', 190, yPosition + 2)
    doc.text(format(new Date(visitor.check_in_time), 'HH:mm'), 240, yPosition + 2)
    
    yPosition += 10
  })
  
  // Stopka
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text(`Wygenerowano: ${format(new Date(), 'dd.MM.yyyy HH:mm:ss')}`, 15, 200)
  doc.text('SafeVisit - Gjestehåndteringssystem', 200, 200)
  
  return doc
}

export const generateVisitorBadge = async (visitor, qrCodeDataURL) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  })
  
  // Wymiary karty na A4
  const cardWidth = 85
  const cardHeight = 54
  const startX = 20
  const startY = 20
  
  // Tło karty
  doc.setFillColor(250, 250, 250)
  doc.rect(startX, startY, cardWidth, cardHeight, 'F')
  
  // Ramka
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  doc.rect(startX, startY, cardWidth, cardHeight)
  
  // Nagłówek
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text('GOSC', startX + cardWidth/2, startY + 8, { align: 'center' })
  
  // Imię i nazwisko - bez polskich znaków
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  let name = visitor.full_name
    .replace(/ą/g, 'a')
    .replace(/ć/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/ó/g, 'o')
    .replace(/ś/g, 's')
    .replace(/ź/g, 'z')
    .replace(/ż/g, 'z')
    .replace(/Ą/g, 'A')
    .replace(/Ć/g, 'C')
    .replace(/Ę/g, 'E')
    .replace(/Ł/g, 'L')
    .replace(/Ń/g, 'N')
    .replace(/Ó/g, 'O')
    .replace(/Ś/g, 'S')
    .replace(/Ź/g, 'Z')
    .replace(/Ż/g, 'Z')
  
  if (name.length > 20) {
    name = name.substring(0, 17) + '...'
  }
  doc.text(name, startX + cardWidth/2, startY + 18, { align: 'center' })
  
  // Firma - skrócona i bez polskich znaków
  doc.setFont(undefined, 'normal')
  doc.setFontSize(8)
  if (visitor.company_name) {
    let company = visitor.company_name
      .replace(/ą/g, 'a')
      .replace(/ć/g, 'c')
      .replace(/ę/g, 'e')
      .replace(/ł/g, 'l')
      .replace(/ń/g, 'n')
      .replace(/ó/g, 'o')
      .replace(/ś/g, 's')
      .replace(/ź/g, 'z')
      .replace(/ż/g, 'z')
      .replace(/Ą/g, 'A')
      .replace(/Ć/g, 'C')
      .replace(/Ę/g, 'E')
      .replace(/Ł/g, 'L')
      .replace(/Ń/g, 'N')
      .replace(/Ó/g, 'O')
      .replace(/Ś/g, 'S')
      .replace(/Ź/g, 'Z')
      .replace(/Ż/g, 'Z')
    
    if (company.length > 25) {
      company = company.substring(0, 22) + '...'
    }
    doc.text(company, startX + cardWidth/2, startY + 25, { align: 'center' })
  }
  
  // Kod QR
  if (qrCodeDataURL) {
    doc.addImage(qrCodeDataURL, 'PNG', startX + 25, startY + 30, 20, 20)
  }
  
  // Data
  doc.setFontSize(6)
  doc.text(format(new Date(), 'dd.MM.yyyy HH:mm'), startX + cardWidth/2, startY + 52, { align: 'center' })
  
  // Linie do wycięcia
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.2)
  doc.setLineDashPattern([2, 2], 0)
  doc.line(startX - 5, startY, startX - 5, startY + cardHeight)
  doc.line(startX + cardWidth + 5, startY, startX + cardWidth + 5, startY + cardHeight)
  doc.line(startX, startY - 5, startX + cardWidth, startY - 5)
  doc.line(startX, startY + cardHeight + 5, startX + cardWidth, startY + cardHeight + 5)
  
  return doc
}