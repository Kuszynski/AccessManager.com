-- Debug logowania - sprawdź dane w tabeli companies
SELECT 
    id,
    name,
    admin_email,
    status,
    role,
    created_at
FROM companies 
ORDER BY created_at DESC;

-- Sprawdź czy są użytkownicy w auth.users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users 
ORDER BY created_at DESC;

-- Sprawdź czy admin_email w companies odpowiada email w auth.users
SELECT 
    c.name as company_name,
    c.admin_email,
    c.status,
    c.role,
    u.email as auth_email,
    u.email_confirmed_at
FROM companies c
LEFT JOIN auth.users u ON c.admin_email = u.email;