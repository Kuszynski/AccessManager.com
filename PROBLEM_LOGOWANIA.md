# Problem z logowaniem - "laster..." i brak możliwości zalogowania

## Diagnoza problemu

Aplikacja pokazuje komunikat "laster..." (ładowanie w języku norweskim) i nie pozwala się zalogować z powodu **brakujących kolumn w tabeli `companies`**.

## Główne problemy:

1. **Brakujące kolumny w bazie danych**: Tabela `companies` nie ma kolumn `status` i `role`
2. **Kod aplikacji oczekuje tych kolumn** w pliku `src/hooks/useAuth.js`
3. **System autoryzacji sprawdza status firmy** przed logowaniem

## Rozwiązanie:

### Krok 1: Dodaj brakujące kolumny do bazy danych

Wykonaj plik SQL `fix-missing-columns.sql` w Supabase:

```sql
-- Dodaj brakujące kolumny do tabeli companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'admin';

-- Dodaj constraints dla nowych kolumn
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_role_check;
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_status_check;

ALTER TABLE companies ADD CONSTRAINT companies_role_check 
    CHECK (role IN ('admin', 'super_admin'));

ALTER TABLE companies ADD CONSTRAINT companies_status_check 
    CHECK (status IN ('pending', 'approved', 'rejected'));

-- Zaktualizuj istniejące firmy (jeśli są)
UPDATE companies SET status = 'approved', role = 'admin' WHERE status IS NULL OR role IS NULL;
```

### Krok 2: Sprawdź strukturę tabeli

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'companies' 
ORDER BY ordinal_position;
```

### Krok 3: Sprawdź istniejące firmy

```sql
SELECT id, name, admin_email, status, role FROM companies;
```

### Krok 4: Jeśli nie ma żadnych firm, utwórz testową

```sql
INSERT INTO companies (name, address, phone, admin_email, status, role) 
VALUES ('Test Company', 'Test Address', '+48123456789', 'admin@test.com', 'approved', 'admin');
```

## Jak wykonać naprawę:

1. **Otwórz Supabase Dashboard**
2. **Przejdź do SQL Editor**
3. **Wklej i wykonaj kod z pliku `fix-missing-columns.sql`**
4. **Sprawdź czy kolumny zostały dodane**
5. **Spróbuj się zalogować ponownie**

## Testowanie:

Po wykonaniu naprawy:
1. Odśwież aplikację (F5)
2. Spróbuj się zalogować używając emaila i hasła z tabeli `companies`
3. Jeśli nadal nie działa, sprawdź konsolę przeglądarki (F12) pod kątem błędów

## Dodatkowe informacje:

- Aplikacja używa systemu zatwierdzania firm
- Status `pending` = oczekuje na zatwierdzenie
- Status `approved` = zatwierdzona, może się logować
- Status `rejected` = odrzucona, nie może się logować
- Role `admin` = administrator firmy
- Role `super_admin` = super administrator (może zatwierdzać firmy)