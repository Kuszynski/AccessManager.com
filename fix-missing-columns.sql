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

-- Sprawdź wynik
SELECT id, name, admin_email, status, role FROM companies;