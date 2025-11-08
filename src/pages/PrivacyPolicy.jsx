import React, { useState } from 'react'
import { useTranslation } from '../utils/translations'
import LanguageSelector from '../components/LanguageSelector'
import { Shield, ArrowLeft } from 'lucide-react'

const PrivacyPolicy = () => {
  const [language, setLanguage] = useState('no')
  const { t } = useTranslation(language)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Shield className="h-8 w-8 mr-3" />
            <h1 className="text-2xl font-bold">SafeVisit</h1>
          </div>
          <LanguageSelector 
            currentLanguage={language} 
            onLanguageChange={setLanguage}
            variant="light"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => window.history.back()}
              className="mr-4 p-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-3xl font-bold text-gray-900">
              {t('privacyPolicy') || 'Personvernerklæring'}
            </h2>
          </div>

          <div className="prose max-w-none">
            {language === 'no' && (
              <div className="space-y-6">
                <section>
                  <h3 className="text-xl font-semibold mb-3">1. Dataansvarlig</h3>
                  <p>SafeVisit er et gjestehåndteringssystem. Den enkelte bedrift som bruker systemet er dataansvarlig for behandling av personopplysninger.</p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">2. Hvilke opplysninger samler vi inn?</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Navn og etternavn</li>
                    <li>Telefonnummer</li>
                    <li>E-postadresse (valgfritt)</li>
                    <li>Firmanavn</li>
                    <li>Person som besøkes</li>
                    <li>Tidspunkt for inn- og utsjekking</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">3. Formål med behandlingen</h3>
                  <p>Personopplysningene behandles for følgende formål:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Sikkerhet og adgangskontroll</li>
                    <li>Evakuering i nødsituasjoner</li>
                    <li>Overholdelse av sikkerhetskrav</li>
                    <li>Kontaktsporing ved behov</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">4. Behandlingsgrunnlag</h3>
                  <p>Behandlingen er basert på:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Berettiget interesse (sikkerhet og adgangskontroll)</li>
                    <li>Samtykke (for e-postadresse)</li>
                    <li>Rettslig forpliktelse (sikkerhetskrav)</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">5. Lagring og sletting</h3>
                  <p>Personopplysninger lagres kun så lenge det er nødvendig for formålet:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Besøksdata slettes automatisk ved utsjekking</strong></li>
                    <li>Sikkerhetshendelser kan lagres i inntil 1 år</li>
                    <li>Du kan be om sletting av dine opplysninger når som helst</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">6. Dine rettigheter</h3>
                  <p>Du har følgende rettigheter:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Rett til innsyn i dine personopplysninger</li>
                    <li>Rett til retting av feilaktige opplysninger</li>
                    <li>Rett til sletting</li>
                    <li>Rett til begrensning av behandling</li>
                    <li>Rett til dataportabilitet</li>
                    <li>Rett til å trekke tilbake samtykke</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">7. Sikkerhet</h3>
                  <p>Vi bruker tekniske og organisatoriske tiltak for å beskytte dine personopplysninger mot uautorisert tilgang, endring, sletting eller avsløring.</p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">8. Kontakt</h3>
                  <p>For spørsmål om personvern, kontakt den bedriften du besøker eller systemadministrator.</p>
                </section>
              </div>
            )}

            {language === 'en' && (
              <div className="space-y-6">
                <section>
                  <h3 className="text-xl font-semibold mb-3">1. Data Controller</h3>
                  <p>SafeVisit is a visitor management system. Each company using the system is the data controller for processing personal data.</p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">2. What information do we collect?</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>First and last name</li>
                    <li>Phone number</li>
                    <li>Email address (optional)</li>
                    <li>Company name</li>
                    <li>Person being visited</li>
                    <li>Check-in and check-out times</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">3. Purpose of processing</h3>
                  <p>Personal data is processed for the following purposes:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Security and access control</li>
                    <li>Emergency evacuation</li>
                    <li>Compliance with security requirements</li>
                    <li>Contact tracing when needed</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">4. Legal basis</h3>
                  <p>Processing is based on:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Legitimate interest (security and access control)</li>
                    <li>Consent (for email address)</li>
                    <li>Legal obligation (security requirements)</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">5. Storage and deletion</h3>
                  <p>Personal data is stored only as long as necessary for the purpose:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Visit data is automatically deleted upon checkout</strong></li>
                    <li>Security incidents may be stored for up to 1 year</li>
                    <li>You can request deletion of your data at any time</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">6. Your rights</h3>
                  <p>You have the following rights:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Right to access your personal data</li>
                    <li>Right to rectification of incorrect data</li>
                    <li>Right to erasure</li>
                    <li>Right to restriction of processing</li>
                    <li>Right to data portability</li>
                    <li>Right to withdraw consent</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">7. Security</h3>
                  <p>We use technical and organizational measures to protect your personal data against unauthorized access, alteration, deletion or disclosure.</p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">8. Contact</h3>
                  <p>For privacy questions, contact the company you are visiting or the system administrator.</p>
                </section>
              </div>
            )}

            {language === 'pl' && (
              <div className="space-y-6">
                <section>
                  <h3 className="text-xl font-semibold mb-3">1. Administrator danych</h3>
                  <p>SafeVisit to system zarządzania gośćmi. Każda firma korzystająca z systemu jest administratorem danych osobowych.</p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">2. Jakie dane zbieramy?</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Imię i nazwisko</li>
                    <li>Numer telefonu</li>
                    <li>Adres e-mail (opcjonalnie)</li>
                    <li>Nazwa firmy</li>
                    <li>Osoba odwiedzana</li>
                    <li>Czas zameldowania i wymeldowania</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">3. Cel przetwarzania</h3>
                  <p>Dane osobowe są przetwarzane w następujących celach:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Bezpieczeństwo i kontrola dostępu</li>
                    <li>Ewakuacja w sytuacjach awaryjnych</li>
                    <li>Przestrzeganie wymogów bezpieczeństwa</li>
                    <li>Śledzenie kontaktów w razie potrzeby</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">4. Podstawa prawna</h3>
                  <p>Przetwarzanie opiera się na:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Prawnie uzasadnionym interesie (bezpieczeństwo)</li>
                    <li>Zgodzie (dla adresu e-mail)</li>
                    <li>Obowiązku prawnym (wymogi bezpieczeństwa)</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">5. Przechowywanie i usuwanie</h3>
                  <p>Dane osobowe są przechowywane tylko tak długo, jak to konieczne:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Dane wizyt są automatycznie usuwane przy wymeldowaniu</strong></li>
                    <li>Zdarzenia bezpieczeństwa mogą być przechowywane do 1 roku</li>
                    <li>Możesz poprosić o usunięcie swoich danych w każdej chwili</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">6. Twoje prawa</h3>
                  <p>Masz następujące prawa:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Prawo dostępu do swoich danych</li>
                    <li>Prawo do sprostowania nieprawidłowych danych</li>
                    <li>Prawo do usunięcia</li>
                    <li>Prawo do ograniczenia przetwarzania</li>
                    <li>Prawo do przenoszenia danych</li>
                    <li>Prawo do wycofania zgody</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">7. Bezpieczeństwo</h3>
                  <p>Stosujemy środki techniczne i organizacyjne w celu ochrony danych osobowych przed nieuprawnionym dostępem, zmianą, usunięciem lub ujawnieniem.</p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">8. Kontakt</h3>
                  <p>W sprawach dotyczących prywatności skontaktuj się z firmą, którą odwiedzasz, lub z administratorem systemu.</p>
                </section>
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>{t('lastUpdated') || 'Sist oppdatert'}:</strong> {new Date().toLocaleDateString(language === 'no' ? 'no-NO' : language === 'pl' ? 'pl-PL' : 'en-US')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy