-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a new insert policy that allows both authenticated users and the service role
CREATE POLICY "Enable profile creation during signup"
ON profiles FOR INSERT
WITH CHECK (
  -- Allow authenticated users to insert their own profile
  (auth.uid() = id AND auth.role() = 'authenticated') OR
  -- Allow the service role to insert profiles during signup
  auth.role() = 'service_role'
);

-- Ensure the service role has necessary permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON profiles TO service_role;
