-- Zmień domyślny status na 'pending' aby wymagać zatwierdzenia
ALTER TABLE companies ALTER COLUMN status SET DEFAULT 'pending';

-- Zaktualizuj istniejące firmy bez statusu na 'pending'
UPDATE companies SET status = 'pending' WHERE status IS NULL;

-- Jeśli chcesz aby istniejące firmy były automatycznie zatwierdzone, odkomentuj poniższą linię:
-- UPDATE companies SET status = 'approved' WHERE created_at < NOW();