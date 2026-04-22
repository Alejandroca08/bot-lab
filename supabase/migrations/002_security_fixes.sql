-- Security fixes: prevent privilege escalation
-- Run this against your existing database to patch the two critical vulnerabilities.

-- 1. Fix handle_new_user trigger: never read role from user metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'client'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix profile UPDATE policy: clients can only update their name
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own name" ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
    AND project_id IS NOT DISTINCT FROM (SELECT project_id FROM profiles WHERE id = auth.uid())
  );
