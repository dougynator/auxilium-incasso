-- Add commission invoice field to cases table
ALTER TABLE cases
ADD COLUMN IF NOT EXISTS commission_invoice_sent BOOLEAN DEFAULT FALSE;

-- Create index for commission_invoice_sent
CREATE INDEX IF NOT EXISTS idx_cases_commission_invoice ON cases(commission_invoice_sent);

-- Note: The status mapping will be done in the application:
-- - "open" = "sent" or "in_progress" (blauw)
-- - "ontvangen" = "paid" (groen)
-- - "deurwaarder" = new status we'll add to enum (rood)
-- 
-- To add "deurwaarder" status to the enum, run this in Supabase SQL Editor:
-- ALTER TYPE case_status ADD VALUE IF NOT EXISTS 'bailiff';

