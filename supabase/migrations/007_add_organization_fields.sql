-- Add new organization fields for settings page

-- Add bank account number
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS bank_account_number TEXT;

-- Add invoice terms fields
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS has_invoice_terms BOOLEAN;

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS invoice_terms_path TEXT;

-- Add damage clause fields
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS has_damage_clause BOOLEAN;

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS damage_clause_percentage DECIMAL(5,2);

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS has_minimum_damage_clause BOOLEAN;

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS minimum_damage_clause_amount DECIMAL(10,2);

-- Add delay interest fields
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS delay_interest_type TEXT CHECK (delay_interest_type IN ('no', 'law_2002', 'fixed'));

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS delay_interest_percentage DECIMAL(5,2);

-- Create storage bucket for organization documents if it doesn't exist
-- Note: This needs to be done in Supabase dashboard, but we'll add a comment here
-- Bucket name: organization-documents
-- Public: false
-- File size limit: 10MB
-- Allowed MIME types: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document

