-- Napraw polityki RLS dla tabeli companies

-- Usuń wszystkie istniejące polityki dla companies
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Users can update their own company" ON companies;
DROP POLICY IF EXISTS "Users can insert their own company" ON companies;
DROP POLICY IF EXISTS "Anyone can insert companies" ON companies;
DROP POLICY IF EXISTS "Super admin can do everything" ON companies;

-- Nowe polityki dla companies
-- Pozwól na odczyt własnej firmy
CREATE POLICY "Users can view their own company" ON companies
    FOR SELECT USING (
        admin_email = auth.email()
    );

-- Pozwól na aktualizację własnej firmy
CREATE POLICY "Users can update their own company" ON companies
    FOR UPDATE USING (
        admin_email = auth.email()
    );

-- Pozwól na wstawianie nowych firm (bez ograniczeń dla rejestracji)
CREATE POLICY "Anyone can insert companies" ON companies
    FOR INSERT WITH CHECK (true);

-- Pozwól super_admin na wszystko
CREATE POLICY "Super admin can do everything" ON companies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM companies 
            WHERE admin_email = auth.email() 
            AND role = 'super_admin'
        )
    );

-- Sprawdź polityki
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'companies';