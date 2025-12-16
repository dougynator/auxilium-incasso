-- Fix debtors INSERT policy to allow authenticated users to create debtors
-- Drop existing policy
DROP POLICY IF EXISTS "Users can create debtors" ON debtors;

-- Create new policy that explicitly allows authenticated users
CREATE POLICY "Users can create debtors"
  ON debtors FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );


