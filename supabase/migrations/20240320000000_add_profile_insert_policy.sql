-- Enable RLS for applications table
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create policies for applications table
CREATE POLICY "Users can view own applications"
ON applications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own applications"
ON applications FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own applications"
ON applications FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own applications"
ON applications FOR DELETE
TO authenticated
USING (user_id = auth.uid());
