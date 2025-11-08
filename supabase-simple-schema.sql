-- Usuń istniejące tabele
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS visitors CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Prosta tabela firm bez foreign key
CREATE TABLE companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    admin_email VARCHAR(255) NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela gości
CREATE TABLE visitors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    host_name VARCHAR(255) NOT NULL,
    host_phone VARCHAR(50),
    host_email VARCHAR(255),
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
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    triggered_by VARCHAR(255),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE
);

-- Wyłącz RLS dla prostoty
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE visitors DISABLE ROW LEVEL SECURITY;
ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;

-- Dodaj brakujące kolumny do istniejącej tabeli (jeśli już istnieje)
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS host_phone VARCHAR(50);
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS host_email VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Dodaj przykładową firmę
INSERT INTO companies (name, address, phone, admin_email) 
VALUES ('Elektryk AS', 'ul. Młotkowa 2, Warszawa', '123456789', 'admin@elektryk.pl');