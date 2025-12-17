-- Ensure admin@auxiliumincasso.com has admin role

-- Update the profile role for admin@auxilium-incasso.be
UPDATE profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@auxiliumincasso.com'
)
AND role != 'admin';

-- If profile doesn't exist, create it
INSERT INTO profiles (id, role, full_name)
SELECT id, 'admin', 'Admin Gebruiker'
FROM auth.users
WHERE email = 'admin@auxiliumincasso.com'
AND NOT EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.users.id
);

