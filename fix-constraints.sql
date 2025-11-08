-- Napraw constraints w tabeli companies

-- Usuń istniejące constraints
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_role_check;
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_status_check;

-- Dodaj poprawne constraints
ALTER TABLE companies ADD CONSTRAINT companies_role_check 
    CHECK (role IN ('admin', 'super_admin'));

ALTER TABLE companies ADD CONSTRAINT companies_status_check 
    CHECK (status IN ('pending', 'approved', 'rejected'));

-- Sprawdź constraints
SELECT conname FROM pg_constraint 
WHERE conrelid = 'companies'::regclass AND contype = 'c';

-- Sprawdź strukturę tabeli
SELECT column_name, data_type, column_default FROM information_schema.columns 
WHERE table_name = 'companies' ORDER BY ordinal_position;