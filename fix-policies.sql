-- Usuń istniejące polityki dla visitors
DROP POLICY IF EXISTS "Users can insert visitors to their company" ON visitors;
DROP POLICY IF EXISTS "Anyone can insert visitors" ON visitors;

-- Nowa polityka - pozwala na dodawanie gości przez zalogowanych użytkowników
CREATE POLICY "Authenticated users can insert visitors" ON visitors
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Polityka dla recepcji - pozwala na dodawanie gości do swojej firmy
CREATE POLICY "Users can manage visitors for their company" ON visitors
    FOR ALL 
    USING (
        company_id IN (
            SELECT id FROM companies WHERE admin_user_id = auth.uid()
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT id FROM companies WHERE admin_user_id = auth.uid()
        )
    );