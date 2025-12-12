-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE debtors ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins and staff can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

-- Organizations policies
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins and staff can view all organizations"
  ON organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Clients can update their own organization"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid()
      AND role = 'client'
    )
  );

-- Debtors policies
CREATE POLICY "Users can view debtors of their cases"
  ON debtors FOR SELECT
  USING (
    id IN (
      SELECT debtor_id FROM cases
      WHERE organization_id IN (
        SELECT organization_id FROM profiles
        WHERE id = auth.uid()
      )
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Users can create debtors"
  ON debtors FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins and staff can update debtors"
  ON debtors FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

-- Cases policies
CREATE POLICY "Clients can view their organization's cases"
  ON cases FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid()
      AND role = 'client'
    )
  );

CREATE POLICY "Admins and staff can view all cases"
  ON cases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Clients can create cases for their organization"
  ON cases FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid()
      AND role = 'client'
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Clients can update their organization's cases"
  ON cases FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid()
      AND role = 'client'
    )
    AND status = 'draft'
  );

CREATE POLICY "Admins and staff can update all cases"
  ON cases FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

-- Case invoices policies
CREATE POLICY "Users can view invoices of their cases"
  ON case_invoices FOR SELECT
  USING (
    case_id IN (
      SELECT id FROM cases
      WHERE organization_id IN (
        SELECT organization_id FROM profiles
        WHERE id = auth.uid()
      )
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admins and staff can manage invoices"
  ON case_invoices FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

-- Case attachments policies
CREATE POLICY "Users can view attachments of their cases"
  ON case_attachments FOR SELECT
  USING (
    case_id IN (
      SELECT id FROM cases
      WHERE organization_id IN (
        SELECT organization_id FROM profiles
        WHERE id = auth.uid()
      )
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Users can upload attachments to their cases"
  ON case_attachments FOR INSERT
  WITH CHECK (
    case_id IN (
      SELECT id FROM cases
      WHERE organization_id IN (
        SELECT organization_id FROM profiles
        WHERE id = auth.uid()
      )
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admins and staff can delete attachments"
  ON case_attachments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

-- Case events policies
CREATE POLICY "Users can view events of their cases (excluding internal notes)"
  ON case_events FOR SELECT
  USING (
    case_id IN (
      SELECT id FROM cases
      WHERE organization_id IN (
        SELECT organization_id FROM profiles
        WHERE id = auth.uid()
      )
    )
    AND (
      metadata->>'internal' IS NULL
      OR metadata->>'internal' = 'false'
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'staff')
      )
    )
  );

CREATE POLICY "Admins and staff can view all events"
  ON case_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Users can create events for their cases"
  ON case_events FOR INSERT
  WITH CHECK (
    case_id IN (
      SELECT id FROM cases
      WHERE organization_id IN (
        SELECT organization_id FROM profiles
        WHERE id = auth.uid()
      )
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

-- Tasks policies
CREATE POLICY "Admins and staff can manage tasks"
  ON tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

-- OTP challenges policies
-- Note: Using auth.uid() directly to avoid RLS recursion
CREATE POLICY "Users can manage their own OTP challenges"
  ON otp_challenges FOR ALL
  USING (profile_id = auth.uid());

-- Audit log policies
CREATE POLICY "Admins and staff can view audit log"
  ON audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

-- Function to log audit events (called by application, not directly)
-- This is a helper function that can be called from application code

