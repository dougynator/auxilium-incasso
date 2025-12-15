-- Add debtor_type column to saved_debtors table
ALTER TABLE saved_debtors
ADD COLUMN IF NOT EXISTS debtor_type TEXT CHECK (debtor_type IN ('particular', 'company')) DEFAULT 'particular';

-- Add debtor_type column to debtors table
ALTER TABLE debtors
ADD COLUMN IF NOT EXISTS debtor_type TEXT CHECK (debtor_type IN ('particular', 'company')) DEFAULT 'particular';

-- Update existing rows with a default value if needed
UPDATE saved_debtors SET debtor_type = 'company' WHERE company_name IS NOT NULL AND name IS NULL;
UPDATE debtors SET debtor_type = 'company' WHERE company_name IS NOT NULL AND name IS NULL;

