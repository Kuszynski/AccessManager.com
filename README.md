# SafeVisit - System Zarządzania Gośćmi

SafeVisit to nowoczesny system zarządzania gośćmi (VMS) dla firm, zintegrowany z Supabase. Aplikacja umożliwia rejestrację gości, generowanie identyfikatorów z kodami QR, zarządzanie bezpieczeństwem i generowanie list ewakuacyjnych.

## 🚀 Funkcje

### Dla Administratorów
- Panel zarządzania firmą
- Przegląd aktualnie obecnych gości
- Wywołanie alarmu pożarowego
- Generowanie list ewakuacyjnych (PDF)
- Eksport danych

### Dla Recepcji
- Rejestracja nowych gości
- Generowanie i drukowanie identyfikatorów z QR
- Wymeldowanie gości (QR lub manualnie)
- Zarządzanie listą obecnych

### Dla Gości
- Samodzielna rejestracja przez terminal (tablet/kiosk)
- Otrzymanie kodu QR
- Prosty interfejs użytkownika

### Bezpieczeństwo
- Alarm pożarowy z automatyczną listą ewakuacyjną
- Wysyłanie SMS do gości (wymaga konfiguracji)
- Historia zdarzeń
- Multi-tenant SaaS

## 🛠️ Technologie

- **Frontend**: React 18 + TailwindCSS
- **Backend**: Supabase (Auth + Database + API)
- **QR Codes**: qrcode
- **PDF**: jsPDF
- **SMS**: Twilio/SMSAPI (opcjonalnie)
- **Icons**: Lucide React

## 📦 Instalacja

1. **Sklonuj repozytorium**
```bash
git clone <repository-url>
cd safevisit
```

2. **Zainstaluj zależności**
```bash
npm install
```

3. **Konfiguracja Supabase**
   - Utwórz projekt w [Supabase](https://supabase.com)
   - Skopiuj URL i klucz API
   - Wykonaj schema SQL z pliku `supabase-schema.sql`

4. **Konfiguracja zmiennych środowiskowych**
```bash
cp .env.example .env
```
Uzupełnij plik `.env` swoimi danymi Supabase:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. **Uruchom aplikację**
```bash
npm start
```

## 🗄️ Struktura Bazy Danych

### Tabela `companies`
- `id` - UUID (klucz główny)
- `name` - nazwa firmy
- `address` - adres firmy
- `phone` - telefon firmy
- `admin_user_id` - ID administratora (Supabase Auth)

### Tabela `visitors`
- `id` - UUID (klucz główny)
- `full_name` - imię i nazwisko gościa
- `company_name` - firma gościa
- `phone` - telefon gościa
- `host_name` - osoba odwiedzana
- `qr_code_id` - unikalny kod QR
- `check_in_time` - czas wejścia
- `check_out_time` - czas wyjścia
- `status` - status ('in', 'out')
- `company_id` - ID firmy

### Tabela `alerts`
- `id` - UUID (klucz główny)
- `type` - typ alarmu ('fire', 'evacuation')
- `created_at` - czas utworzenia
- `triggered_by` - kto wywołał
- `company_id` - ID firmy

## 🔧 Konfiguracja SMS (Opcjonalna)

### Twilio
```env
REACT_APP_TWILIO_ACCOUNT_SID=your_account_sid
REACT_APP_TWILIO_AUTH_TOKEN=your_auth_token
REACT_APP_TWILIO_PHONE_NUMBER=your_phone_number
```

### SMSAPI (Polska)
```env
REACT_APP_SMSAPI_TOKEN=your_smsapi_token
```

## 🚀 Wdrożenie

### Lovable (Zalecane)
1. Połącz repozytorium z Lovable
2. Skonfiguruj zmienne środowiskowe
3. Deploy automatyczny

### Vercel/Netlify
1. Połącz repozytorium
2. Ustaw zmienne środowiskowe
3. Deploy

## 📱 Użytkowanie

### Rejestracja Firmy
1. Przejdź do `/login`
2. Wybierz "Rejestracja"
3. Wypełnij dane firmy
4. Potwierdź email

### Panel Administratora
- URL: `/dashboard`
- Przegląd gości, wywołanie alarmu, eksport danych

### Recepcja
- URL: `/reception`
- Rejestracja gości, drukowanie identyfikatorów

### Terminal Gości
- URL: `/guest/{company_id}`
- Samodzielna rejestracja dla gości

## 🔒 Bezpieczeństwo

- Row Level Security (RLS) w Supabase
- Autoryzacja oparta na JWT
- Izolacja danych między firmami
- Bezpieczne API endpoints

## 📄 Licencja

MIT License - szczegóły w pliku LICENSE

## 🤝 Wsparcie

W przypadku problemów lub pytań, utwórz issue w repozytorium.

---

**SafeVisit** - Bezpieczne zarządzanie gośćmi dla nowoczesnych firm 🛡️