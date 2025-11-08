-- Dodaj kolumnę logo_url do tabeli companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Sprawdź strukturę tabeli
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'companies' 
ORDER BY ordinal_position;