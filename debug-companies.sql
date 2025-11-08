-- Debug tabeli companies

-- Sprawdź strukturę tabeli
\d companies;

-- Sprawdź constraints
SELECT conname, consrc FROM pg_constraint 
WHERE conrelid = 'companies'::regclass;

-- Tymczasowo wyłącz RLS
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

-- Sprawdź czy można wstawić rekord ręcznie
INSERT INTO companies (name, admin_email, status, role) 
VALUES ('Test Company', 'test@example.com', 'pending', 'admin');

-- Sprawdź wynik
SELECT * FROM companies WHERE admin_email = 'test@example.com';

-- Usuń test
DELETE FROM companies WHERE admin_email = 'test@example.com';

-- Włącz RLS z powrotem
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;