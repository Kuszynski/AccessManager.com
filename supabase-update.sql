-- Add missing columns to visitors table
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS host_email TEXT;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS check_out_time TIMESTAMPTZ;

-- Update existing visitor with host email (example)
-- UPDATE visitors SET host_email = 'kari@eco.no' WHERE full_name = 'tomek';

-- Check current visitors
-- SELECT id, full_name, status, check_in_time, check_out_time FROM visitors ORDER BY check_in_time DESC;