-- Bibliotheek tables for saved invoices and debtors

-- Saved invoices (opgeslagen facturen)
CREATE TABLE saved_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Invoice data extracted from document
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  
  -- Related debtor (can be null if not yet saved)
  debtor_id UUID REFERENCES debtors(id) ON DELETE SET NULL,
  
  -- Extracted data from AI/OCR
  debtor_name TEXT,
  debtor_address_street TEXT,
  debtor_address_city TEXT,
  debtor_address_postal_code TEXT,
  debtor_address_country TEXT DEFAULT 'BE',
  debtor_vat_number TEXT,
  debtor_email TEXT,
  
  -- Document storage
  document_path TEXT, -- Path to stored document in Supabase Storage
  document_name TEXT,
  
  -- Metadata
  extracted_data JSONB DEFAULT '{}', -- Full extracted data from AI
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved debtors (opgeslagen relaties)
CREATE TABLE saved_debtors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Link to main debtors table if exists
  debtor_id UUID REFERENCES debtors(id) ON DELETE SET NULL,
  
  -- Debtor data
  name TEXT,
  company_name TEXT,
  email TEXT NOT NULL,
  vat_number TEXT,
  address_street TEXT,
  address_city TEXT,
  address_postal_code TEXT,
  address_country TEXT DEFAULT 'BE',
  phone TEXT,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique email per organization
  UNIQUE(organization_id, email)
);

-- Indexes for better performance
CREATE INDEX idx_saved_invoices_organization ON saved_invoices(organization_id);
CREATE INDEX idx_saved_invoices_created_by ON saved_invoices(created_by);
CREATE INDEX idx_saved_invoices_debtor ON saved_invoices(debtor_id);
CREATE INDEX idx_saved_debtors_organization ON saved_debtors(organization_id);
CREATE INDEX idx_saved_debtors_created_by ON saved_debtors(created_by);
CREATE INDEX idx_saved_debtors_debtor ON saved_debtors(debtor_id);

-- RLS Policies
ALTER TABLE saved_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_debtors ENABLE ROW LEVEL SECURITY;

-- Users can view their organization's saved invoices
CREATE POLICY "Users can view their organization's saved invoices"
  ON saved_invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.organization_id = saved_invoices.organization_id
        OR profiles.role IN ('admin', 'staff')
      )
    )
  );

-- Users can create saved invoices for their organization
CREATE POLICY "Users can create saved invoices"
  ON saved_invoices FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.organization_id = saved_invoices.organization_id
        OR profiles.role IN ('admin', 'staff')
      )
    )
  );

-- Users can update their organization's saved invoices
CREATE POLICY "Users can update their organization's saved invoices"
  ON saved_invoices FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.organization_id = saved_invoices.organization_id
        OR profiles.role IN ('admin', 'staff')
      )
    )
  );

-- Users can delete their organization's saved invoices
CREATE POLICY "Users can delete their organization's saved invoices"
  ON saved_invoices FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.organization_id = saved_invoices.organization_id
        OR profiles.role IN ('admin', 'staff')
      )
    )
  );

-- Users can view their organization's saved debtors
CREATE POLICY "Users can view their organization's saved debtors"
  ON saved_debtors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.organization_id = saved_debtors.organization_id
        OR profiles.role IN ('admin', 'staff')
      )
    )
  );

-- Users can create saved debtors for their organization
CREATE POLICY "Users can create saved debtors"
  ON saved_debtors FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.organization_id = saved_debtors.organization_id
        OR profiles.role IN ('admin', 'staff')
      )
    )
  );

-- Users can update their organization's saved debtors
CREATE POLICY "Users can update their organization's saved debtors"
  ON saved_debtors FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.organization_id = saved_debtors.organization_id
        OR profiles.role IN ('admin', 'staff')
      )
    )
  );

-- Users can delete their organization's saved debtors
CREATE POLICY "Users can delete their organization's saved debtors"
  ON saved_debtors FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.organization_id = saved_debtors.organization_id
        OR profiles.role IN ('admin', 'staff')
      )
    )
  );

