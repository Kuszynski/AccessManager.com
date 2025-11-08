-- Dodaj politykę publicznego dostępu do firm dla terminali gości

-- Pozwól na publiczny odczyt podstawowych danych firm (dla terminali gości)
CREATE POLICY "Public can view company basic info" ON companies
    FOR SELECT USING (true);

-- Sprawdź wszystkie polityki
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'companies'
ORDER BY policyname;