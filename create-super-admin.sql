-- Utwórz super admina

-- Najpierw sprawdź strukturę tabeli
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'companies' ORDER BY ordinal_position;

-- Dodaj kolumny jeśli nie istnieją
ALTER TABLE companies ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
ALTER TABLE companies ADD COLUMN IF NOT EXISTS admin_email VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin'));

-- Sprawdź co jest w tabeli
SELECT * FROM companies;

-- Usuń istniejące rekordy z tym emailem
DELETE FROM companies WHERE admin_email = 'twoj-email@example.com';

-- Utwórz super admina (zmień email na swój)
INSERT INTO companies (name, admin_email, status, role) 
VALUES ('Super Admin', 'twoj-email@example.com', 'approved', 'super_admin');

-- Sprawdź wynik
SELECT * FROM companies WHERE role = 'super_admin';