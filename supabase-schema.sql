-- Tworzenie tabel dla SafeVisit

-- Tabela firm
CREATE TABLE companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela gości
CREATE TABLE visitors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    phone VARCHAR(50),
    host_name VARCHAR(255) NOT NULL,
    qr_code_id VARCHAR(255) UNIQUE NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
    check_out_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'in' CHECK (status IN ('in', 'out')),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela alertów
CREATE TABLE alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('fire', 'evacuation', 'security')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    triggered_by UUID REFERENCES auth.users(id),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    notes TEXT
);

-- Indeksy dla lepszej wydajności
CREATE INDEX idx_visitors_company_id ON visitors(company_id);
CREATE INDEX idx_visitors_status ON visitors(status);
CREATE INDEX idx_visitors_check_in_time ON visitors(check_in_time);
CREATE INDEX idx_visitors_qr_code_id ON visitors(qr_code_id);
CREATE INDEX idx_companies_admin_user_id ON companies(admin_user_id);
CREATE INDEX idx_alerts_company_id ON alerts(company_id);

-- RLS (Row Level Security) policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Polityki dla companies
CREATE POLICY "Users can view their own company" ON companies
    FOR SELECT USING (admin_user_id = auth.uid());

CREATE POLICY "Users can update their own company" ON companies
    FOR UPDATE USING (admin_user_id = auth.uid());

CREATE POLICY "Users can insert their own company" ON companies
    FOR INSERT WITH CHECK (admin_user_id = auth.uid());

-- Polityki dla visitors
CREATE POLICY "Users can view visitors from their company" ON visitors
    FOR SELECT USING (
        company_id IN (
            SELECT id FROM companies WHERE admin_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert visitors to their company" ON visitors
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT id FROM companies WHERE admin_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update visitors from their company" ON visitors
    FOR UPDATE USING (
        company_id IN (
            SELECT id FROM companies WHERE admin_user_id = auth.uid()
        )
    );

-- Polityka publiczna dla gości (terminal)
CREATE POLICY "Anyone can insert visitors" ON visitors
    FOR INSERT WITH CHECK (true);

-- Polityki dla alerts
CREATE POLICY "Users can view alerts from their company" ON alerts
    FOR SELECT USING (
        company_id IN (
            SELECT id FROM companies WHERE admin_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert alerts for their company" ON alerts
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT id FROM companies WHERE admin_user_id = auth.uid()
        )
    );

-- Funkcja do automatycznego ustawiania updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger dla companies
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();